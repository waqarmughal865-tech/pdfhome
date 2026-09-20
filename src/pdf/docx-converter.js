import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPDFDocument } from './renderer.js';
import { extractOcrTextFromPage } from './ocr-engine.js';
import { createWorker } from 'tesseract.js';

// Matrix helpers for tracking CTM in PDF operator stream
function multMatrix(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5]
  ];
}

function transformPoint(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

// Convert PDF.js image object to PNG Uint8Array via offscreen canvas
async function imageObjToPngUint8(imgObj) {
  if (!imgObj || !imgObj.width || !imgObj.height) return null;
  const { width, height, data, kind } = imgObj;

  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      if (typeof ImageBitmap !== 'undefined' && imgObj instanceof ImageBitmap) {
        ctx.drawImage(imgObj, 0, 0);
      } else if (imgObj.bitmap && typeof ImageBitmap !== 'undefined' && imgObj.bitmap instanceof ImageBitmap) {
        ctx.drawImage(imgObj.bitmap, 0, 0);
      } else if (typeof HTMLImageElement !== 'undefined' && imgObj instanceof HTMLImageElement) {
        ctx.drawImage(imgObj, 0, 0);
      } else if (data) {
        const imgData = ctx.createImageData(width, height);
        const out = imgData.data;

        if (kind === 3 || data.length === width * height * 4) {
          // RGBA
          out.set(data);
        } else if (kind === 2 || data.length === width * height * 3) {
          // RGB -> RGBA
          let s = 0, d = 0;
          const len = width * height;
          for (let i = 0; i < len; i++) {
            out[d++] = data[s++];
            out[d++] = data[s++];
            out[d++] = data[s++];
            out[d++] = 255;
          }
        } else if (kind === 1 || data.length === width * height) {
          // Grayscale -> RGBA
          let s = 0, d = 0;
          const len = width * height;
          for (let i = 0; i < len; i++) {
            const v = data[s++];
            out[d++] = v;
            out[d++] = v;
            out[d++] = v;
            out[d++] = 255;
          }
        } else {
          const limit = Math.min(data.length, out.length);
          for (let i = 0; i < limit; i++) out[i] = data[i];
        }
        ctx.putImageData(imgData, 0, 0);
      } else {
        return null;
      }

      return await new Promise((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve(new Uint8Array(buf));
        }, 'image/png');
      });
    } catch (err) {
      console.warn('Could not convert imageObj to PNG:', err);
      return null;
    }
  }
  return null;
}

// Retrieve PDF.js object by name
function getPdfObject(page, name) {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (obj) => {
      if (!resolved) {
        resolved = true;
        resolve(obj || null);
      }
    };
    const timer = setTimeout(() => finish(null), 1200);

    try {
      if (page.objs && typeof page.objs.get === 'function') {
        page.objs.get(name, (obj) => {
          clearTimeout(timer);
          finish(obj);
        });
        return;
      }
    } catch (e) {}

    try {
      if (page.commonObjs && typeof page.commonObjs.get === 'function') {
        page.commonObjs.get(name, (obj) => {
          clearTimeout(timer);
          finish(obj);
        });
        return;
      }
    } catch (e) {}

    clearTimeout(timer);
    finish(null);
  });
}

// Escape XML strings and sanitize illegal XML 1.0 control characters
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert PDF to formatted, 100% editable Microsoft Word (.docx) document
 * with precise layout reconstruction, flow fidelity, divider lines,
 * natural paragraph wrapping, side-by-side metadata, tables, and images.
 * 
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {Object|Function} [optionsOrProgress]
 * @param {Function} [maybeProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function pdfToDocx(pdfBuffer, optionsOrProgress = {}, maybeProgress = null) {
  let options = {};
  let onProgress = null;

  if (typeof optionsOrProgress === 'function') {
    onProgress = optionsOrProgress;
    options = {};
  } else {
    options = optionsOrProgress || {};
    onProgress = maybeProgress;
  }

  const useOcr = Boolean(options.useOcr);
  const ocrLang = options.ocrLang || 'eng';
  const forceOcr = Boolean(options.forceOcr);

  onProgress?.(1, 10, 'Loading PDF document');
  const pdfDoc = await loadPDFDocument(pdfBuffer);
  const total = pdfDoc.numPages;

  let ocrWorker = null;
  const getWorker = async () => {
    if (!ocrWorker) {
      onProgress?.(2, 10, `Initializing OCR Engine (${ocrLang.toUpperCase()})...`);
      try {
        ocrWorker = await createWorker(ocrLang);
      } catch (err) {
        console.warn('Could not initialize OCR worker:', err);
      }
    }
    return ocrWorker;
  };

  const images = []; // { id, relId, filename, bytes, widthPt, heightPt }
  const hyperlinks = []; // { relId, url }
  const hyperlinkUrlToRelId = new Map();

  function getOrCreateHyperlinkRel(url) {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (!cleanUrl) return null;
    if (hyperlinkUrlToRelId.has(cleanUrl)) {
      return hyperlinkUrlToRelId.get(cleanUrl);
    }
    const relId = `rIdLink${hyperlinks.length + 1}`;
    hyperlinks.push({ relId, url: cleanUrl });
    hyperlinkUrlToRelId.set(cleanUrl, relId);
    return relId;
  }

  let nextImageId = 1;
  const docPages = []; // Page structure data

  try {
    for (let pageNum = 1; pageNum <= total; pageNum++) {
      onProgress?.(pageNum, total, `Processing page ${pageNum} of ${total}`);
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width || 595.28;
      const pageHeight = viewport.height || 841.89;

      // 1. Extract Annotations / Hyperlinks
      let linkAnnotations = [];
      try {
        const annotations = await page.getAnnotations();
        linkAnnotations = (annotations || []).filter(
          a => a.subtype === 'Link' && (a.url || a.unsafeUrl)
        );
      } catch (e) {
        console.warn('Could not get page annotations:', e);
      }

      // 2. Extract Operator List (Lines, Dividers, and Images)
      let ops = null;
      try {
        ops = await page.getOperatorList();
      } catch (e) {
        console.warn('Could not get operator list:', e);
      }

      const rawLines = [];
      const pendingImages = [];

      if (ops && ops.fnArray) {
        let ctm = [1, 0, 0, 1, 0, 0];
        const ctmStack = [];
        let pendingPath = null;

        for (let idx = 0; idx < ops.fnArray.length; idx++) {
          const fn = ops.fnArray[idx];
          const args = ops.argsArray[idx];

          if (fn === pdfjsLib.OPS.save) {
            ctmStack.push([...ctm]);
          } else if (fn === pdfjsLib.OPS.restore) {
            if (ctmStack.length > 0) ctm = ctmStack.pop();
          } else if (fn === pdfjsLib.OPS.transform) {
            ctm = multMatrix(ctm, args);
          } else if (fn === pdfjsLib.OPS.constructPath) {
            pendingPath = { args, ctm: [...ctm] };
          } else if (
            fn === pdfjsLib.OPS.stroke ||
            fn === pdfjsLib.OPS.fill ||
            fn === pdfjsLib.OPS.eoFill ||
            fn === pdfjsLib.OPS.fillStroke
          ) {
            if (pendingPath && pendingPath.args) {
              const bbox = pendingPath.args[2];
              if (bbox && bbox.length >= 4) {
                const p1 = transformPoint(pendingPath.ctm, bbox[0], bbox[1]);
                const p2 = transformPoint(pendingPath.ctm, bbox[2], bbox[3]);
                const left = Math.min(p1[0], p2[0]);
                const right = Math.max(p1[0], p2[0]);
                const bottom = Math.min(p1[1], p2[1]);
                const top = Math.max(p1[1], p2[1]);
                const width = right - left;
                const height = top - bottom;

                // Horizontal line / divider check
                if (width >= 40 && height <= 5) {
                  const yMid = (bottom + top) / 2;
                  rawLines.push({
                    type: 'line',
                    y: yMid,
                    topDist: Math.max(0, pageHeight - yMid),
                    width,
                    left,
                    right
                  });
                }
              }

              // Also check explicit line coordinates in args[1]
              const coords = pendingPath.args[1];
              if (coords && coords.length >= 4) {
                for (let c = 0; c < coords.length - 3; c += 4) {
                  const ptA = transformPoint(pendingPath.ctm, coords[c], coords[c + 1]);
                  const ptB = transformPoint(pendingPath.ctm, coords[c + 2], coords[c + 3]);
                  const diffY = Math.abs(ptA[1] - ptB[1]);
                  const diffX = Math.abs(ptA[0] - ptB[0]);
                  if (diffY <= 4 && diffX >= 40) {
                    const yMid = (ptA[1] + ptB[1]) / 2;
                    rawLines.push({
                      type: 'line',
                      y: yMid,
                      topDist: Math.max(0, pageHeight - yMid),
                      width: diffX,
                      left: Math.min(ptA[0], ptB[0]),
                      right: Math.max(ptA[0], ptB[0])
                    });
                  }
                }
              }
            }
            pendingPath = null;
          } else if (
            fn === pdfjsLib.OPS.paintImageXObject ||
            fn === pdfjsLib.OPS.paintInlineImageXObject ||
            fn === pdfjsLib.OPS.paintImageMaskXObject
          ) {
            const imgName = args[0];
            const curCtm = [...ctm];
            const displayWidth = Math.hypot(curCtm[0], curCtm[1]);
            const displayHeight = Math.hypot(curCtm[2], curCtm[3]);
            const posX = curCtm[4];
            const posY = curCtm[5];

            if (displayWidth >= 16 && displayHeight >= 16) {
              pendingImages.push({
                name: imgName,
                x: posX,
                y: posY,
                topDist: Math.max(0, pageHeight - (posY + displayHeight)),
                displayWidth,
                displayHeight
              });
            }
          }
        }
      }

      // Deduplicate lines
      const deduplicatedLines = [];
      for (const line of rawLines) {
        const duplicate = deduplicatedLines.find(
          dl => Math.abs(dl.y - line.y) < 6 && Math.abs(dl.left - line.left) < 25
        );
        if (!duplicate) {
          deduplicatedLines.push(line);
        }
      }

      // Resolve images asynchronously
      const pageImages = [];
      for (const pImg of pendingImages) {
        const imgObj = await getPdfObject(page, pImg.name);
        if (imgObj) {
          const pngBytes = await imageObjToPngUint8(imgObj);
          if (pngBytes && pngBytes.length > 50) {
            const imgId = nextImageId++;
            const maxW = Math.min(pageWidth - 72, 468);
            const w = Math.min(maxW, pImg.displayWidth || imgObj.width || 300);
            const h = (pImg.displayWidth ? (pImg.displayHeight / pImg.displayWidth) : (imgObj.height / imgObj.width)) * w;

            const imgItem = {
              id: imgId,
              relId: `rIdImg${imgId}`,
              filename: `media/image${imgId}.png`,
              bytes: pngBytes,
              widthPt: w,
              heightPt: h
            };
            images.push(imgItem);

            pageImages.push({
              type: 'image',
              topDist: pImg.topDist,
              imgItem,
              align: (pImg.x > pageWidth * 0.45) ? 'right' : ((pImg.x > pageWidth * 0.25) ? 'center' : 'left'),
              x: pImg.x
            });
          }
        }
      }

      // 3. Extract Text Content & Group by Coordinates
      const textContent = await page.getTextContent();
      const items = textContent.items || [];
      const needsOcr = forceOcr || (useOcr && items.length < 5) || items.length === 0;

      const pageBlocks = [];

      // Calculate content bounding box to determine page margins
      let minContentX = pageWidth * 0.1;
      let maxContentX = pageWidth * 0.9;
      let minContentY = pageHeight * 0.1;
      let maxContentY = pageHeight * 0.9;

      if (items.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const item of items) {
          if (!item.str || !item.str.trim()) continue;
          const x = item.transform[4];
          const y = item.transform[5];
          const w = item.width || (item.str.length * 6);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x + w);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y + 12);
        }
        if (minX < maxX && minY < maxY) {
          minContentX = Math.max(18, minX);
          maxContentX = Math.min(pageWidth - 18, maxX);
          minContentY = Math.max(18, minY);
          maxContentY = Math.min(pageHeight - 18, maxY);
        }
      }

      if (needsOcr) {
        onProgress?.(pageNum, total, `Running OCR text recognition on page ${pageNum}...`);
        const worker = await getWorker();
        const ocrText = await extractOcrTextFromPage(page, {
          language: ocrLang,
          enhanceImage: true,
          worker
        });

        const lines = (ocrText || '')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        let yOffset = 40;
        for (const line of lines) {
          const isHead = line.length < 60 && (line === line.toUpperCase() || line.startsWith('#'));
          pageBlocks.push({
            type: 'paragraph',
            topDist: yOffset,
            text: line.replace(/^#+\s*/, ''),
            isHeading: isHead,
            fontSize: isHead ? 15 : 11,
            align: 'left',
            indentPt: 0
          });
          yOffset += isHead ? 28 : 16;
        }
      } else {
        // Digital PDF: Group items into physical visual lines
        const sortedItems = [...items].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 3.5) return yDiff;
          return a.transform[4] - b.transform[4];
        });

        const rawLines = [];
        let currentLineItems = [];
        let currentBaselineY = null;

        for (const item of sortedItems) {
          const str = item.str || '';
          if (!str.trim()) continue;

          const y = item.transform[5];
          if (currentBaselineY === null || Math.abs(currentBaselineY - y) <= 3.5) {
            currentLineItems.push(item);
            currentBaselineY = y;
          } else {
            if (currentLineItems.length > 0) {
              rawLines.push({ y: currentBaselineY, items: currentLineItems });
            }
            currentLineItems = [item];
            currentBaselineY = y;
          }
        }
        if (currentLineItems.length > 0) {
          rawLines.push({ y: currentBaselineY, items: currentLineItems });
        }

        // Parse each visual line into structured clusters
        const parsedLines = [];
        for (const line of rawLines) {
          const lineY = line.y;
          const topDist = Math.max(0, pageHeight - lineY);
          const lineItems = [...line.items].sort((a, b) => a.transform[4] - b.transform[4]);

          const clusters = [];
          let currentCluster = null;

          for (const item of lineItems) {
            const str = item.str || '';
            const itemX = item.transform[4];
            const itemWidth = item.width || (str.length * 6);
            const itemEndX = itemX + itemWidth;
            const fontSize = Math.round(Math.hypot(item.transform[0], item.transform[1])) || 11;

            let itemLinkUrl = null;
            for (const annot of linkAnnotations) {
              if (annot.rect && annot.rect.length >= 4) {
                const [lx1, ly1, lx2, ly2] = annot.rect;
                if (itemX >= lx1 - 5 && itemX <= lx2 + 5 && lineY >= ly1 - 5 && lineY <= ly2 + 5) {
                  itemLinkUrl = annot.url || annot.unsafeUrl;
                  break;
                }
              }
            }

            if (!currentCluster) {
              currentCluster = {
                text: str,
                startX: itemX,
                endX: itemEndX,
                fontSize,
                linkUrl: itemLinkUrl
              };
            } else if ((itemX - currentCluster.endX) > 36) {
              // Large gap (> 36 pt) -> distinct column cluster
              clusters.push(currentCluster);
              currentCluster = {
                text: str,
                startX: itemX,
                endX: itemEndX,
                fontSize,
                linkUrl: itemLinkUrl
              };
            } else {
              currentCluster.text += (currentCluster.text ? ' ' : '') + str;
              currentCluster.endX = Math.max(currentCluster.endClusterX || currentCluster.endX, itemEndX);
              currentCluster.fontSize = Math.max(currentCluster.fontSize, fontSize);
              if (itemLinkUrl) currentCluster.linkUrl = itemLinkUrl;
            }
          }
          if (currentCluster) clusters.push(currentCluster);

          if (clusters.length === 0) continue;

          const joinedText = clusters.map(c => c.text).join(' ').trim();
          if (!joinedText) continue;

          // ASCII divider line check
          if (joinedText.length >= 4 && /^[-—_=_*]{4,}$/.test(joinedText)) {
            deduplicatedLines.push({
              type: 'line',
              y: lineY,
              topDist,
              width: pageWidth - 100,
              left: minContentX,
              right: maxContentX
            });
            continue;
          }

          parsedLines.push({
            y: lineY,
            topDist,
            startX: clusters[0].startX,
            endX: clusters[clusters.length - 1].endX,
            fontSize: clusters[0].fontSize || 11,
            clusters,
            fullText: joinedText
          });
        }

        // STEP A: Multi-Row Table Detection
        // Only form a table if 2 or more consecutive lines have >= 2 aligned columns!
        const processedBlocks = [];
        let i = 0;

        while (i < parsedLines.length) {
          const currentLine = parsedLines[i];

          // Check if this line starts a multi-column table (must have 2+ rows sharing column alignments)
          if (currentLine.clusters.length >= 2) {
            const potentialTableRows = [currentLine];
            let nextIdx = i + 1;

            while (nextIdx < parsedLines.length) {
              const nextLine = parsedLines[nextIdx];
              const prevLine = potentialTableRows[potentialTableRows.length - 1];
              const rowGap = prevLine.y - nextLine.y;

              // Check if next row aligns with this table
              if (
                nextLine.clusters.length >= 2 &&
                rowGap > 0 &&
                rowGap <= 32 &&
                Math.abs(nextLine.clusters.length - prevLine.clusters.length) <= 1
              ) {
                // Verify column positions align within 24 pt
                const colMatch = potentialTableRows[0].clusters.every((c, cIdx) => {
                  const nc = nextLine.clusters[cIdx];
                  return !nc || Math.abs(c.startX - nc.startX) < 30;
                });

                if (colMatch) {
                  potentialTableRows.push(nextLine);
                  nextIdx++;
                  continue;
                }
              }
              break;
            }

            // Real table confirmed (2+ rows)
            if (potentialTableRows.length >= 2) {
              // Calculate actual column widths from coordinates
              const numCols = Math.max(...potentialTableRows.map(r => r.clusters.length));
              const colBoundaries = [];

              for (let c = 0; c < numCols; c++) {
                let colMinX = Infinity;
                let colMaxX = -Infinity;
                for (const r of potentialTableRows) {
                  const cell = r.clusters[c];
                  if (cell) {
                    colMinX = Math.min(colMinX, cell.startX);
                    colMaxX = Math.max(colMaxX, cell.endX);
                  }
                }
                colBoundaries.push({ minX: colMinX, maxX: colMaxX });
              }

              processedBlocks.push({
                type: 'table',
                topDist: potentialTableRows[0].topDist,
                rows: potentialTableRows.map(r => r.clusters),
                numCols,
                colBoundaries
              });

              i = nextIdx;
              continue;
            }
          }

          // Not a multi-row table: Single line
          processedBlocks.push({
            type: 'singleLine',
            line: currentLine
          });
          i++;
        }

        // STEP B: Paragraph Merging & Line Formatting
        // Reconstruct wrapped paragraphs so text flows smoothly without artificial line breaks
        let pIdx = 0;
        while (pIdx < processedBlocks.length) {
          const blk = processedBlocks[pIdx];

          if (blk.type === 'table') {
            pageBlocks.push(blk);
            pIdx++;
            continue;
          }

          const cur = blk.line;
          const text = cur.fullText;
          const fontSize = cur.fontSize || 11;

          // Check if single line with 2 clusters (e.g. Title on left, Date on right)
          if (cur.clusters.length === 2 && (cur.clusters[1].startX - cur.clusters[0].endX) > 60) {
            pageBlocks.push({
              type: 'tabbedLine',
              topDist: cur.topDist,
              leftCluster: cur.clusters[0],
              rightCluster: cur.clusters[1],
              fontSize
            });
            pIdx++;
            continue;
          }

          // Bullet list item check
          const bulletMatch = text.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+(.*)$/);
          if (bulletMatch) {
            let bulletBody = bulletMatch[2];
            let nextLineIdx = pIdx + 1;

            // Merge any continuation lines of this bullet item
            while (nextLineIdx < processedBlocks.length) {
              const nextBlk = processedBlocks[nextLineIdx];
              if (nextBlk.type !== 'singleLine') break;
              const nextL = nextBlk.line;
              const yGap = cur.y - nextL.y;

              // Continuation line of bullet: same indent, normal line gap, no new bullet
              if (
                yGap > 0 &&
                yGap <= fontSize * 1.65 &&
                !nextL.fullText.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+/) &&
                Math.abs(nextL.startX - cur.startX) < 24
              ) {
                bulletBody += ' ' + nextL.fullText;
                nextLineIdx++;
              } else {
                break;
              }
            }

            pageBlocks.push({
              type: 'list',
              topDist: cur.topDist,
              bullet: bulletMatch[1],
              text: bulletBody,
              fontSize,
              indentPt: Math.max(0, cur.startX - minContentX)
            });

            pIdx = nextLineIdx;
            continue;
          }

          // Heading check
          const isHeading = fontSize >= 14 || (fontSize >= 13 && text.length < 60 && text === text.toUpperCase());
          if (isHeading) {
            pageBlocks.push({
              type: 'heading',
              topDist: cur.topDist,
              text,
              fontSize,
              level: fontSize >= 16 ? 1 : 2,
              align: (Math.abs((cur.startX + cur.endX) / 2 - pageWidth / 2) < 25) ? 'center' : 'left',
              indentPt: Math.max(0, cur.startX - minContentX)
            });
            pIdx++;
            continue;
          }

          // Normal Paragraph: Merge consecutive wrapped lines belonging to the same paragraph
          let mergedText = cur.fullText;
          let lastLine = cur;
          let nextPIdx = pIdx + 1;

          while (nextPIdx < processedBlocks.length) {
            const nextBlk = processedBlocks[nextPIdx];
            if (nextBlk.type !== 'singleLine') break;

            const nextL = nextBlk.line;
            const yGap = lastLine.y - nextL.y;
            const isNextHeading = nextL.fontSize >= 14 || (nextL.fontSize >= 13 && nextL.fullText.length < 50 && nextL.fullText === nextL.fullText.toUpperCase());
            const isNextBullet = Boolean(nextL.fullText.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+/));

            // Merge condition: close line pitch, similar left margin, not heading or bullet
            if (
              yGap > 0 &&
              yGap <= fontSize * 1.65 &&
              !isNextHeading &&
              !isNextBullet &&
              Math.abs(lastLine.startX - nextL.startX) < 14
            ) {
              mergedText += ' ' + nextL.fullText;
              lastLine = nextL;
              nextPIdx++;
            } else {
              break;
            }
          }

          // Detect alignment
          let align = 'left';
          const midX = (cur.startX + cur.endX) / 2;
          if (Math.abs(midX - pageWidth / 2) < 25 && (cur.endX - cur.startX) < pageWidth * 0.6) {
            align = 'center';
          } else if (cur.startX > pageWidth * 0.55 && (cur.endX - cur.startX) < pageWidth * 0.4) {
            align = 'right';
          }

          pageBlocks.push({
            type: 'paragraph',
            topDist: cur.topDist,
            text: mergedText,
            fontSize,
            align,
            indentPt: Math.max(0, cur.startX - minContentX)
          });

          pIdx = nextPIdx;
        }
      }

      // Combine all page components: lines, images, blocks
      const allPageElements = [
        ...deduplicatedLines,
        ...pageImages,
        ...pageBlocks
      ];

      allPageElements.sort((a, b) => a.topDist - b.topDist);

      docPages.push({
        pageNum,
        pageWidth,
        pageHeight,
        minContentX,
        maxContentX,
        minContentY,
        maxContentY,
        elements: allPageElements
      });
    }
  } finally {
    if (ocrWorker) {
      try { await ocrWorker.terminate(); } catch (err) {}
      ocrWorker = null;
    }
  }

  onProgress?.(total, total, 'Compiling layout-faithful Microsoft Word (.docx)...');

  // Helper to render text runs with hyperlinks
  function renderRuns(text, fontSize, isBold = false) {
    const szVal = fontSize
      ? `<w:sz w:val="${Math.round(fontSize * 2)}"/><w:szCs w:val="${Math.round(fontSize * 2)}"/>`
      : '<w:sz w:val="22"/><w:szCs w:val="22"/>';
    const bVal = isBold ? '<w:b/><w:bCs/>' : '';

    const urlRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+)/g;
    let lastIdx = 0;
    let match;
    let resultXml = '';

    while ((match = urlRegex.exec(text)) !== null) {
      const preceding = text.slice(lastIdx, match.index);
      if (preceding) {
        resultXml += `<w:r><w:rPr>${szVal}${bVal}</w:rPr><w:t xml:space="preserve">${escapeXml(preceding)}</w:t></w:r>`;
      }

      const foundUrl = match[0];
      const relId = getOrCreateHyperlinkRel(foundUrl);
      resultXml += `
        <w:hyperlink r:id="${relId}">
          <w:r>
            <w:rPr>
              <w:rStyle w:val="Hyperlink"/>
              ${szVal}
              <w:color w:val="0563C1"/>
              <w:u w:val="single"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(foundUrl)}</w:t>
          </w:r>
        </w:hyperlink>
      `;
      lastIdx = urlRegex.lastIndex;
    }

    const remaining = text.slice(lastIdx);
    if (remaining) {
      resultXml += `<w:r><w:rPr>${szVal}${bVal}</w:rPr><w:t xml:space="preserve">${escapeXml(remaining)}</w:t></w:r>`;
    }

    return resultXml || `<w:r><w:rPr>${szVal}${bVal}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  // Construct WordprocessingML XML body
  let bodyXml = '';

  for (let pIdx = 0; pIdx < docPages.length; pIdx++) {
    const pg = docPages[pIdx];

    for (const elem of pg.elements) {
      if (elem.type === 'line') {
        // Divider line with accurate left and right indentation matching PDF
        const leftIndentDxa = Math.max(0, Math.round((elem.left - pg.minContentX) * 20));
        const rightIndentDxa = Math.max(0, Math.round((pg.maxContentX - elem.right) * 20));

        bodyXml += `
          <w:p>
            <w:pPr>
              <w:ind w:left="${leftIndentDxa}" w:right="${rightIndentDxa}"/>
              <w:pBdr>
                <w:bottom w:val="single" w:sz="12" w:space="1" w:color="CCCCCC"/>
              </w:pBdr>
              <w:spacing w:before="60" w:after="80"/>
            </w:pPr>
            <w:r><w:t xml:space="preserve"></w:t></w:r>
          </w:p>
        `;
      } else if (elem.type === 'image') {
        // DrawingML Image
        const img = elem.imgItem;
        const emuWidth = Math.round(img.widthPt * 12700);
        const emuHeight = Math.round(img.heightPt * 12700);
        const jcVal = elem.align || 'center';

        bodyXml += `
          <w:p>
            <w:pPr>
              <w:jc w:val="${jcVal}"/>
              <w:spacing w:before="80" w:after="100" w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
              <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                  <wp:extent cx="${emuWidth}" cy="${emuHeight}"/>
                  <wp:effectExtent l="0" t="0" r="0" b="0"/>
                  <wp:docPr id="${img.id}" name="Picture ${img.id}"/>
                  <wp:cNvGraphicFramePr>
                    <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                  </wp:cNvGraphicFramePr>
                  <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                      <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:nvPicPr>
                          <pic:cNvPr id="${img.id}" name="Picture ${img.id}"/>
                          <pic:cNvPicPr/>
                        </pic:nvPicPr>
                        <pic:blipFill>
                          <a:blip r:embed="${img.relId}"/>
                          <a:stretch><a:fillRect/></a:stretch>
                        </pic:blipFill>
                        <pic:spPr>
                          <a:xfrm>
                            <a:off x="0" y="0"/>
                            <a:ext cx="${emuWidth}" cy="${emuHeight}"/>
                          </a:xfrm>
                          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                        </pic:spPr>
                      </pic:pic>
                    </a:graphicData>
                  </a:graphic>
                </wp:inline>
              </w:drawing>
            </w:r>
          </w:p>
        `;
      } else if (elem.type === 'tabbedLine') {
        // Two-column metadata line (e.g. Header Left & Date Right) on the EXACT same line
        const leftText = elem.leftCluster.text;
        const rightText = elem.rightCluster.text;
        const rightTabPosDxa = Math.round((elem.rightCluster.startX - pg.minContentX) * 20);

        bodyXml += `
          <w:p>
            <w:pPr>
              <w:tabs>
                <w:tab w:val="right" w:pos="${rightTabPosDxa}"/>
              </w:tabs>
              <w:spacing w:before="40" w:after="60" w:line="240" w:lineRule="auto"/>
            </w:pPr>
            ${renderRuns(leftText, elem.fontSize, false)}
            <w:r><w:tab/></w:r>
            ${renderRuns(rightText, elem.fontSize, false)}
          </w:p>
        `;
      } else if (elem.type === 'table') {
        // Real multi-row table with actual column widths from PDF coordinates
        const numCols = elem.numCols || 2;
        let tableRowsXml = '';

        elem.rows.forEach((row, rIdx) => {
          const isHead = (rIdx === 0 && elem.rows.length > 1);
          let cellsXml = '';

          for (let c = 0; c < numCols; c++) {
            const cell = row[c] || { text: '' };
            const safeText = escapeXml(cell.text || '');

            // Calculate precise column width in dxa
            let colWidthDxa = 2400;
            if (elem.colBoundaries && elem.colBoundaries[c]) {
              const b = elem.colBoundaries[c];
              colWidthDxa = Math.max(1200, Math.round((b.maxX - b.minX + 15) * 20));
            }

            const bgShd = isHead ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : '';

            cellsXml += `
              <w:tc>
                <w:tcPr>
                  <w:tcW w:w="${colWidthDxa}" w:type="dxa"/>
                  ${bgShd}
                </w:tcPr>
                <w:p>
                  <w:pPr>
                    <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
                  </w:pPr>
                  <w:r>
                    <w:rPr>
                      ${isHead ? '<w:b/><w:bCs/>' : ''}
                      <w:sz w:val="20"/><w:szCs w:val="20"/>
                      <w:color w:val="${isHead ? '0F172A' : '334155'}"/>
                    </w:rPr>
                    <w:t xml:space="preserve">${safeText}</w:t>
                  </w:r>
                </w:p>
              </w:tc>
            `;
          }

          tableRowsXml += `
            <w:tr>
              <w:trPr>
                <w:cantSplit/>
                ${isHead ? '<w:tblHeader/>' : ''}
              </w:trPr>
              ${cellsXml}
            </w:tr>
          `;
        });

        bodyXml += `
          <w:tbl>
            <w:tblPr>
              <w:tblW w:w="0" w:type="auto"/>
              <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="none"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="none"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
                <w:insideV w:val="none"/>
              </w:tblBorders>
              <w:tblCellMar>
                <w:top w:w="100" w:type="dxa"/>
                <w:left w:w="140" w:type="dxa"/>
                <w:bottom w:w="100" w:type="dxa"/>
                <w:right w:w="140" w:type="dxa"/>
              </w:tblCellMar>
            </w:tblPr>
            ${tableRowsXml}
          </w:tbl>
          <w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>
        `;
      } else if (elem.type === 'heading') {
        const hStyle = elem.level === 1 ? 'Heading1' : 'Heading2';
        const jcVal = elem.align !== 'left' ? `<w:jc w:val="${elem.align}"/>` : '';

        bodyXml += `
          <w:p>
            <w:pPr>
              <w:pStyle w:val="${hStyle}"/>
              <w:spacing w:before="180" w:after="80" w:line="240" w:lineRule="auto"/>
              ${jcVal}
            </w:pPr>
            ${renderRuns(elem.text, elem.fontSize, true)}
          </w:p>
        `;
      } else if (elem.type === 'list') {
        bodyXml += `
          <w:p>
            <w:pPr>
              <w:ind w:left="480" w:hanging="240"/>
              <w:spacing w:before="30" w:after="50" w:line="240" w:lineRule="auto"/>
            </w:pPr>
            <w:r>
              <w:rPr>
                <w:b/><w:bCs/>
                <w:sz w:val="${Math.round(elem.fontSize * 2)}"/>
                <w:color w:val="475569"/>
              </w:rPr>
              <w:t xml:space="preserve">${escapeXml(elem.bullet)} </w:t>
            </w:r>
            ${renderRuns(elem.text, elem.fontSize, false)}
          </w:p>
        `;
      } else if (elem.type === 'paragraph') {
        // Smooth continuous paragraph with natural wrapping and accurate indentation
        const jcVal = elem.align !== 'left' ? `<w:jc w:val="${elem.align}"/>` : '';
        const indVal = (elem.indentPt && elem.indentPt > 18)
          ? `<w:ind w:left="${Math.round(elem.indentPt * 20)}"/>`
          : '';

        bodyXml += `
          <w:p>
            <w:pPr>
              <w:pStyle w:val="Normal"/>
              <w:spacing w:after="80" w:line="240" w:lineRule="auto"/>
              ${indVal}
              ${jcVal}
            </w:pPr>
            ${renderRuns(elem.text, elem.fontSize || 11, false)}
          </w:p>
        `;
      }
    }

    // Page break between pages
    if (pIdx < docPages.length - 1) {
      bodyXml += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    }
  }

  // Calculate overall page dimensions from PDF
  const firstPg = docPages[0] || {
    pageWidth: 595.28,
    pageHeight: 841.89,
    minContentX: 54,
    maxContentX: 541,
    minContentY: 54,
    maxContentY: 787
  };

  const pageWidthDxa = Math.round(firstPg.pageWidth * 20);
  const pageHeightDxa = Math.round(firstPg.pageHeight * 20);
  const isLandscape = firstPg.pageWidth > firstPg.pageHeight;

  // Accurate margin calculation based on actual PDF content layout
  const marginLeftDxa = Math.max(360, Math.min(1080, Math.round(firstPg.minContentX * 20)));
  const marginRightDxa = Math.max(360, Math.min(1080, Math.round((firstPg.pageWidth - firstPg.maxContentX) * 20)));
  const marginTopDxa = Math.max(360, Math.min(1080, Math.round((firstPg.pageHeight - firstPg.maxContentY) * 20)));
  const marginBottomDxa = Math.max(360, Math.min(1080, Math.round(firstPg.minContentY * 20)));

  // OpenXML Package Manifests
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

  const imageRelsXml = images.map(img =>
    `<Relationship Id="${img.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${img.filename}"/>`
  ).join('\n  ');

  const hyperlinkRelsXml = hyperlinks.map(lnk =>
    `<Relationship Id="${lnk.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(lnk.url)}" TargetMode="External"/>`
  ).join('\n  ');

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rIdFontTable" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
  ${imageRelsXml}
  ${hyperlinkRelsXml}
</Relationships>`;

  const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Converted Document</dc:title>
  <dc:creator>PDF Web</dc:creator>
  <cp:lastModifiedBy>PDF Web</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-01-01T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-01-01T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;

  const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Template>Normal.dotm</Template>
  <TotalTime>1</TotalTime>
  <Pages>${total}</Pages>
  <Words>500</Words>
  <Characters>3000</Characters>
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <Lines>100</Lines>
  <Paragraphs>50</Paragraphs>
  <ScaleCrop>false</ScaleCrop>
  <Company></Company>
  <LinksUpToDate>false</LinksUpToDate>
  <CharactersWithSpaces>3500</CharactersWithSpaces>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>`;

  const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`;

  const fontTableXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:font w:name="Calibri">
    <w:panose1 w:val="020F0502020204030204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
  </w:font>
  <w:font w:name="Arial">
    <w:panose1 w:val="020B0604020202020204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
  </w:font>
  <w:font w:name="Times New Roman">
    <w:panose1 w:val="02020603050405020304"/>
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
    <w:pitch w:val="variable"/>
  </w:font>
</w:fonts>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Times New Roman"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:color w:val="1E293B"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="80" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:bCs/>
      <w:sz w:val="32"/>
      <w:szCs w:val="32"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="140" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:bCs/>
      <w:sz w:val="26"/>
      <w:szCs w:val="26"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:style>
  <w:style w:type="character" w:styleId="Hyperlink">
    <w:name w:val="Hyperlink"/>
    <w:basedOn w:val="DefaultParagraphFont"/>
    <w:uiPriority w:val="99"/>
    <w:unhideWhenUsed/>
    <w:rPr>
      <w:color w:val="0563C1" w:themeColor="hyperlink"/>
      <w:u w:val="single"/>
    </w:rPr>
  </w:style>
</w:styles>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="${pageWidthDxa}" w:h="${pageHeightDxa}" ${isLandscape ? 'w:orient="landscape"' : ''}/>
      <w:pgMar w:top="${marginTopDxa}" w:right="${marginRightDxa}" w:bottom="${marginBottomDxa}" w:left="${marginLeftDxa}" w:header="360" w:footer="360" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', rootRelsXml);
  zip.file('word/_rels/document.xml.rels', docRelsXml);
  zip.file('word/document.xml', documentXml);
  zip.file('word/styles.xml', stylesXml);
  zip.file('word/settings.xml', settingsXml);
  zip.file('word/fontTable.xml', fontTableXml);
  zip.file('docProps/core.xml', coreXml);
  zip.file('docProps/app.xml', appXml);

  // Add all extracted media images
  for (const img of images) {
    zip.file(`word/${img.filename}`, img.bytes);
  }

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Convert Microsoft Word (.docx) document to PDF.
 * Crash-proof Unicode and symbol support, handles headings, divider lines,
 * tables, page breaks, and embedded images.
 * 
 * @param {ArrayBuffer|Uint8Array} docxBuffer
 * @param {function} [onProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function docxToPdf(docxBuffer, onProgress) {
  onProgress?.(1, 10, 'Opening Word document...');

  // 1. Detect legacy Word 97-2003 .doc binary format (OLE Compound File header D0 CF 11 E0)
  const bytes = new Uint8Array(docxBuffer instanceof ArrayBuffer ? docxBuffer : docxBuffer.buffer);
  if (bytes.length >= 4 && bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
    throw new Error('This file is in legacy Microsoft Word 97-2003 (.doc) binary format. Please save it as Word Document (.docx) in Microsoft Word and upload again.');
  }

  // 2. Open ZIP package
  let zip;
  try {
    zip = await JSZip.loadAsync(docxBuffer);
  } catch (e) {
    throw new Error('Could not open file as a Word (.docx) document. Please ensure the file is a valid .docx document.');
  }

  // 3. Locate word/document.xml
  let docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    const matches = zip.file(/word\/document\.xml$/i);
    if (matches && matches.length > 0) docXmlFile = matches[0];
  }
  if (!docXmlFile) {
    throw new Error('Invalid Word document: word/document.xml not found.');
  }

  onProgress?.(3, 10, 'Reading document layout and structure...');
  const xmlText = await docXmlFile.async('text');

  // Unicode sanitizer to prevent pdf-lib WinAnsi font crashes
  function sanitizeForPdf(str) {
    if (!str) return '';
    return str
      .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u2013\u2014\u2015]/g, '-')
      .replace(/[\u2022\u25CF\u25CB\u25AA\u25AB\u2023]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u2192\u2794\u279C\u21D2]/g, '->')
      .replace(/[\u2190\u21D0]/g, '<-')
      .replace(/[\u2713\u2714]/g, '[v]')
      .replace(/[\u2717\u2718]/g, '[x]')
      .replace(/\u20AC/g, 'EUR')
      .replace(/\u00A3/g, 'GBP')
      .replace(/\u00A5/g, 'JPY')
      .replace(/\u20B9/g, 'INR')
      .replace(/\u2122/g, '(TM)')
      .replace(/\u00A9/g, '(C)')
      .replace(/\u00AE/g, '(R)')
      .replace(/\u00A0/g, ' ')
      .replace(/[\u2000-\u200B\u202F\u205F]/g, ' ')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
  }

  function safeWidth(font, text, size) {
    const clean = sanitizeForPdf(text);
    try {
      return font.widthOfTextAtSize(clean, size);
    } catch (e) {
      const ascii = clean.replace(/[^\x20-\x7E]/g, ' ');
      try {
        return font.widthOfTextAtSize(ascii, size);
      } catch (e2) {
        return clean.length * size * 0.55;
      }
    }
  }

  function safeDraw(page, text, font, size, x, y, color) {
    const clean = sanitizeForPdf(text);
    try {
      page.drawText(clean, { x, y, size, font, color });
    } catch (e) {
      const ascii = clean.replace(/[^\x20-\x7E]/g, ' ');
      try {
        page.drawText(ascii, { x, y, size, font, color });
      } catch (e2) {}
    }
  }

  onProgress?.(5, 10, 'Parsing paragraphs, tables, and components...');
  const docElements = [];

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const allNodes = xmlDoc.querySelectorAll('w\\:p, p, w\\:tbl, tbl');

    for (const node of allNodes) {
      const tag = node.localName || node.nodeName.replace(/^.*:/, '');

      if (tag === 'p') {
        // Skip paragraphs nested inside table cells
        if (node.closest('w\\:tc, tc')) continue;

        // Page break check
        if (node.querySelector('w\\:br[w\\:type="page"], br[type="page"]')) {
          docElements.push({ type: 'pageBreak' });
          continue;
        }

        // Horizontal rule / bottom border check
        if (node.querySelector('w\\:pBdr, pBdr, w\\:bottom, bottom')) {
          docElements.push({ type: 'line' });
        }

        // Text runs
        const textRuns = [];
        const tNodes = node.querySelectorAll('w\\:t, t, w\\:tab, tab');
        for (const t of tNodes) {
          const tTag = t.localName || t.nodeName.replace(/^.*:/, '');
          if (tTag === 'tab') {
            textRuns.push('    ');
          } else {
            textRuns.push(t.textContent || '');
          }
        }
        const fullText = textRuns.join('').trim();

        if (fullText) {
          const isHeading = node.querySelector('w\\:pStyle[w\\:val*="Heading"], pStyle[val*="Heading"]') !== null;
          const isBold = node.querySelector('w\\:b, b') !== null;
          const szNode = node.querySelector('w\\:sz, sz');
          const fontSizeHalfPt = szNode ? parseInt(szNode.getAttribute('w:val') || szNode.getAttribute('val') || '22', 10) : 22;
          const fontSize = Math.max(9, Math.min(32, Math.round(fontSizeHalfPt / 2)));

          docElements.push({
            type: 'paragraph',
            text: fullText,
            isHeading,
            fontSize,
            isBold
          });
        }
      } else if (tag === 'tbl') {
        if (node.parentElement && node.parentElement.closest('w\\:tc, tc')) continue;

        const rows = node.querySelectorAll('w\\:tr, tr');
        const tableData = [];

        for (const r of rows) {
          const cells = r.querySelectorAll('w\\:tc, tc');
          const rowData = [];

          for (const c of cells) {
            const cellTexts = [];
            const tNodes = c.querySelectorAll('w\\:t, t');
            for (const t of tNodes) {
              cellTexts.push(t.textContent || '');
            }
            rowData.push(cellTexts.join(' ').trim());
          }
          if (rowData.some(Boolean)) {
            tableData.push(rowData);
          }
        }

        if (tableData.length > 0) {
          docElements.push({
            type: 'table',
            rows: tableData
          });
        }
      }
    }
  } else {
    // Regex fallback
    const pRegex = /<w:p(?:\s+[^>]*)?>([\s\S]*?)<\/w:p>/gi;
    let match;
    while ((match = pRegex.exec(xmlText)) !== null) {
      const pContent = match[1];
      if (/<w:br[^>]*w:type="page"/i.test(pContent)) {
        docElements.push({ type: 'pageBreak' });
        continue;
      }
      if (/<w:pBdr/i.test(pContent)) {
        docElements.push({ type: 'line' });
      }
      const tRegex = /<w:t(?:\s+[^>]*)?>([^<]*)<\/w:t>/gi;
      let tMatch;
      let pText = '';
      while ((tMatch = tRegex.exec(pContent)) !== null) {
        pText += tMatch[1];
      }
      if (pText.trim()) {
        const isHeading = /w:val="Heading/i.test(pContent);
        docElements.push({
          type: 'paragraph',
          text: pText.trim(),
          isHeading,
          fontSize: isHeading ? 15 : 11,
          isBold: isHeading || /<w:b[\s\/>]/i.test(pContent)
        });
      }
    }
  }

  // 6. Generate PDF pages
  onProgress?.(7, 10, 'Generating PDF pages...');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // Standard A4
  const pageHeight = 841.89;
  const margin = 54;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 15;
  const headingLineHeight = 22;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  function wrapText(text, font, size, maxWidth) {
    const words = text.split(/\s+/);
    const lines = [];
    let curLine = '';

    for (const w of words) {
      const testLine = curLine ? `${curLine} ${w}` : w;
      if (safeWidth(font, testLine, size) <= maxWidth) {
        curLine = testLine;
      } else {
        if (curLine) lines.push(curLine);
        curLine = w;
      }
    }
    if (curLine) lines.push(curLine);
    return lines;
  }

  for (const elem of docElements) {
    if (elem.type === 'pageBreak') {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
    } else if (elem.type === 'line') {
      if (currentY - 15 < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - margin;
      }
      currentY -= 6;
      currentPage.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      });
      currentY -= 10;
    } else if (elem.type === 'paragraph') {
      const isHead = elem.isHeading;
      const isBold = elem.isBold || isHead;
      const font = isBold ? fontBold : fontRegular;
      const fontSize = isHead ? (elem.fontSize || 15) : (elem.fontSize || 10.5);
      const lHeight = isHead ? headingLineHeight : Math.round(fontSize * 1.35);

      const wrapped = wrapText(elem.text, font, fontSize, contentWidth);

      for (const line of wrapped) {
        if (currentY - lHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        safeDraw(
          currentPage,
          line,
          font,
          fontSize,
          margin,
          currentY - fontSize,
          isHead ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2)
        );

        currentY -= lHeight;
      }
      currentY -= isHead ? 6 : 4;
    } else if (elem.type === 'table') {
      const rows = elem.rows;
      const colCount = Math.max(1, ...rows.map(r => r.length));
      const colWidth = contentWidth / colCount;

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        const isHeader = (r === 0);
        const font = isHeader ? fontBold : fontRegular;
        const fontSize = isHeader ? 10 : 9;
        const rowHeight = 20;

        if (currentY - rowHeight < margin) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin;
        }

        // Draw light row separator line
        currentPage.drawLine({
          start: { x: margin, y: currentY },
          end: { x: pageWidth - margin, y: currentY },
          thickness: 0.5,
          color: rgb(0.88, 0.9, 0.94)
        });

        for (let c = 0; c < colCount; c++) {
          const cellText = row[c] || '';
          if (cellText) {
            safeDraw(
              currentPage,
              cellText.slice(0, 40),
              font,
              fontSize,
              margin + c * colWidth + 4,
              currentY - fontSize - 4,
              isHeader ? rgb(0.08, 0.1, 0.15) : rgb(0.25, 0.3, 0.35)
            );
          }
        }
        currentY -= rowHeight;
      }
      currentY -= 8;
    }
  }

  onProgress?.(10, 10, 'Finalizing PDF...');
  return pdfDoc.save({ useObjectStreams: true });
}
