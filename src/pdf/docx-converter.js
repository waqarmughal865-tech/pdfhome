import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { loadPDFDocument } from './renderer.js';

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

// CRC32 table for pure-JS PNG encoding
const pngCrcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  pngCrcTable[n] = c;
}
function pngCrc32(buf, start = 0, len = buf.length - start) {
  let c = 0xffffffff;
  for (let i = start; i < start + len; i++) {
    c = pngCrcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function pngAdler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

// Pure-JS PNG encoder that never fails even without canvas/DOM
async function encodeRawRgbaToPng(width, height, rawData, kind) {
  if (!rawData || width <= 0 || height <= 0) return null;
  const rowLen = width * 4;
  const uncompressed = new Uint8Array(height * (1 + rowLen));
  let src = 0;
  let dst = 0;

  for (let y = 0; y < height; y++) {
    uncompressed[dst++] = 0; // Filter: None
    if (kind === 2 || (rawData && rawData.length === width * height * 3)) {
      // RGB -> RGBA
      for (let x = 0; x < width; x++) {
        uncompressed[dst++] = rawData[src++];
        uncompressed[dst++] = rawData[src++];
        uncompressed[dst++] = rawData[src++];
        uncompressed[dst++] = 255;
      }
    } else if (kind === 3 || (rawData && rawData.length === width * height * 4)) {
      // RGBA
      for (let x = 0; x < rowLen; x++) {
        uncompressed[dst++] = rawData[src++];
      }
    } else {
      // Grayscale -> RGBA
      for (let x = 0; x < width; x++) {
        const v = rawData[src++];
        uncompressed[dst++] = v;
        uncompressed[dst++] = v;
        uncompressed[dst++] = v;
        uncompressed[dst++] = 255;
      }
    }
  }

  // Deflate compressed scanlines using bundled JSZip
  const zip = new JSZip();
  zip.file('d', uncompressed, { compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const zipBytes = await zip.generateAsync({ type: 'uint8array' });

  const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  const fnLen = view.getUint16(26, true);
  const extraLen = view.getUint16(28, true);
  const compSize = view.getUint32(18, true);
  const compOffset = 30 + fnLen + extraLen;
  const deflatedStream = zipBytes.subarray(compOffset, compOffset + compSize);

  // Zlib stream: header [0x78, 0x9c], deflated payload, Adler-32 checksum
  const zlibData = new Uint8Array(2 + deflatedStream.length + 4);
  zlibData[0] = 0x78;
  zlibData[1] = 0x9c;
  zlibData.set(deflatedStream, 2);
  const adler = pngAdler32(uncompressed);
  const zView = new DataView(zlibData.buffer, zlibData.byteOffset, zlibData.byteLength);
  zView.setUint32(2 + deflatedStream.length, adler, false);

  // Assemble full PNG: Signature + IHDR + IDAT + IEND
  const idatLen = zlibData.length;
  const totalPngLen = 8 + 25 + (12 + idatLen) + 12;
  const png = new Uint8Array(totalPngLen);
  let p = 0;

  // PNG Signature
  png.set([137, 80, 78, 71, 13, 10, 26, 10], p);
  p += 8;

  const pView = new DataView(png.buffer, png.byteOffset, png.byteLength);

  // IHDR chunk
  pView.setUint32(p, 13, false); p += 4;
  const ihdrStart = p;
  png.set([0x49, 0x48, 0x44, 0x52], p); p += 4; // "IHDR"
  pView.setUint32(p, width, false); p += 4;
  pView.setUint32(p, height, false); p += 4;
  png[p++] = 8; // 8 bits per channel
  png[p++] = 6; // RGBA color type
  png[p++] = 0; // Compression (deflate)
  png[p++] = 0; // Filter (standard)
  png[p++] = 0; // Interlace (none)
  const ihdrCrc = pngCrc32(png, ihdrStart, 17);
  pView.setUint32(p, ihdrCrc, false); p += 4;

  // IDAT chunk
  pView.setUint32(p, idatLen, false); p += 4;
  const idatStart = p;
  png.set([0x49, 0x44, 0x41, 0x54], p); p += 4; // "IDAT"
  png.set(zlibData, p); p += idatLen;
  const idatCrc = pngCrc32(png, idatStart, 4 + idatLen);
  pView.setUint32(p, idatCrc, false); p += 4;

  // IEND chunk
  pView.setUint32(p, 0, false); p += 4;
  const iendStart = p;
  png.set([0x49, 0x45, 0x4e, 0x44], p); p += 4; // "IEND"
  const iendCrc = pngCrc32(png, iendStart, 4);
  pView.setUint32(p, iendCrc, false); p += 4;

  return png;
}

// Convert PDF.js image object to PNG Uint8Array via offscreen canvas or pure-JS PNG encoder
async function imageObjToPngUint8(imgObj) {
  if (!imgObj || !imgObj.width || !imgObj.height) return null;
  const { width, height, data, kind } = imgObj;

  // Try browser canvas if available
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
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
            out.set(data);
          } else if (kind === 2 || data.length === width * height * 3) {
            let s = 0, d = 0;
            const len = width * height;
            for (let i = 0; i < len; i++) {
              out[d++] = data[s++];
              out[d++] = data[s++];
              out[d++] = data[s++];
              out[d++] = 255;
            }
          } else if (kind === 1 || data.length === width * height) {
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
        }

        const pngBytes = await new Promise((resolve) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            const buf = await blob.arrayBuffer();
            resolve(new Uint8Array(buf));
          }, 'image/png');
        });

        if (pngBytes && pngBytes.length > 50) return pngBytes;
      }
    } catch (err) {
      console.warn('Canvas toBlob fallback to pure-JS PNG encoder:', err);
    }
  }

  // Pure-JS PNG encoding fallback (guaranteed to succeed for raw image pixel data)
  if (data) {
    try {
      const purePng = await encodeRawRgbaToPng(width, height, data, kind);
      if (purePng && purePng.length > 50) return purePng;
    } catch (err) {
      console.warn('Pure-JS PNG encoder failed:', err);
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

// Parse raw PDF text items into structured visual lines with cluster separation
function parseItemsIntoLines(items, pageHeight, linkAnnotations = []) {
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
      const isBold = (item.fontName || '').toLowerCase().includes('bold') || (item.fontName || '').toLowerCase().includes('f1');

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
          isBold,
          linkUrl: itemLinkUrl
        };
      } else if ((itemX - currentCluster.endX) > 28) {
        clusters.push(currentCluster);
        currentCluster = {
          text: str,
          startX: itemX,
          endX: itemEndX,
          fontSize,
          isBold,
          linkUrl: itemLinkUrl
        };
      } else {
        const gap = itemX - currentCluster.endX;
        if (gap > 1.2) {
          currentCluster.text += ' ' + str;
        } else {
          currentCluster.text += str;
        }
        currentCluster.endX = Math.max(currentCluster.endX, itemEndX);
        currentCluster.fontSize = Math.max(currentCluster.fontSize, fontSize);
        if (isBold) currentCluster.isBold = true;
        if (itemLinkUrl) currentCluster.linkUrl = itemLinkUrl;
      }
    }
    if (currentCluster) clusters.push(currentCluster);
    if (clusters.length === 0) continue;

    const joinedText = clusters.map(c => c.text).join(' ').trim();
    if (!joinedText) continue;

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

  return parsedLines;
}

// Build structured blocks (headings, tables, tabbed metadata, lists, paragraphs) from parsed lines
function buildBlocksFromLines(parsedLines, pageWidth, minContentX, deduplicatedLines = []) {
  const processedBlocks = [];
  let i = 0;

  while (i < parsedLines.length) {
    const currentLine = parsedLines[i];

    // Check multi-row table pattern
    if (currentLine.clusters.length >= 2) {
      const potentialTableRows = [currentLine];
      let nextIdx = i + 1;

      while (nextIdx < parsedLines.length) {
        const nextLine = parsedLines[nextIdx];
        const prevLine = potentialTableRows[potentialTableRows.length - 1];
        const rowGap = prevLine.y - nextLine.y;

        if (
          nextLine.clusters.length >= 2 &&
          rowGap > 0 &&
          rowGap <= 32 &&
          Math.abs(nextLine.clusters.length - prevLine.clusters.length) <= 1
        ) {
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

      if (potentialTableRows.length >= 2) {
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

    // Check ASCII divider line
    if (currentLine.fullText.length >= 4 && /^[-—_=_*]{4,}$/.test(currentLine.fullText)) {
      if (deduplicatedLines) {
        deduplicatedLines.push({
          type: 'line',
          y: currentLine.y,
          topDist: currentLine.topDist,
          width: pageWidth - 100,
          left: minContentX,
          right: pageWidth - minContentX
        });
      }
      i++;
      continue;
    }

    processedBlocks.push({
      type: 'singleLine',
      line: currentLine
    });
    i++;
  }

  // Format single lines into headings, tabbed lines, bullet lists, and paragraphs
  const finalBlocks = [];
  let pIdx = 0;

  while (pIdx < processedBlocks.length) {
    const blk = processedBlocks[pIdx];

    if (blk.type === 'table') {
      finalBlocks.push(blk);
      pIdx++;
      continue;
    }

    const cur = blk.line;
    const text = cur.fullText;
    const fontSize = cur.fontSize || 11;

    // Check if line is a Heading
    const isMainHeading = fontSize >= 16;
    const isSubHeading = (fontSize >= 12 && fontSize < 16) || (fontSize >= 11 && text.length < 40 && text === text.toUpperCase());

    if (isMainHeading || isSubHeading) {
      finalBlocks.push({
        type: 'heading',
        topDist: cur.topDist,
        text,
        fontSize,
        level: isMainHeading ? 1 : 2,
        align: (Math.abs((cur.startX + cur.endX) / 2 - pageWidth / 2) < 25) ? 'center' : 'left',
        indentPt: Math.max(0, cur.startX - minContentX)
      });
      pIdx++;
      continue;
    }

    // Check if single line has 2 distinct clusters (e.g. Date on left, Title on right)
    if (cur.clusters.length === 2 && (cur.clusters[1].startX - cur.clusters[0].endX) > 28) {
      finalBlocks.push({
        type: 'tabbedLine',
        topDist: cur.topDist,
        leftCluster: cur.clusters[0],
        rightCluster: cur.clusters[1],
        fontSize
      });
      pIdx++;
      continue;
    }

    // Check bullet list item
    const bulletMatch = text.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+(.*)$/);
    if (bulletMatch) {
      let bulletBody = bulletMatch[2];
      let nextLineIdx = pIdx + 1;

      while (nextLineIdx < processedBlocks.length) {
        const nextBlk = processedBlocks[nextLineIdx];
        if (nextBlk.type !== 'singleLine') break;
        const nextL = nextBlk.line;
        const yGap = cur.y - nextL.y;
        const isNextHeading = nextL.fontSize >= 12;
        const isNextBullet = Boolean(nextL.fullText.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+/));

        if (
          yGap > 0 &&
          yGap <= fontSize * 1.65 &&
          !isNextHeading &&
          !isNextBullet &&
          Math.abs(nextL.startX - cur.startX) < 18
        ) {
          bulletBody += ' ' + nextL.fullText;
          nextLineIdx++;
        } else {
          break;
        }
      }

      finalBlocks.push({
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

    // Normal paragraph: merge consecutive wrapped lines belonging to same paragraph
    let mergedText = cur.fullText;
    let lastLine = cur;
    let nextPIdx = pIdx + 1;

    while (nextPIdx < processedBlocks.length) {
      const nextBlk = processedBlocks[nextPIdx];
      if (nextBlk.type !== 'singleLine') break;

      const nextL = nextBlk.line;
      const yGap = lastLine.y - nextL.y;
      const isNextHeading = nextL.fontSize >= 12;
      const isNextBullet = Boolean(nextL.fullText.match(/^([•●▪▫–—-]|(?:\d+|[a-zA-Z])[\.\)])\s+/));
      const isNextTabbed = nextL.clusters.length === 2 && (nextL.clusters[1].startX - nextL.clusters[0].endX) > 28;

      if (
        yGap > 0 &&
        yGap <= fontSize * 1.65 &&
        !isNextHeading &&
        !isNextBullet &&
        !isNextTabbed &&
        Math.abs(lastLine.startX - nextL.startX) < 14 &&
        Math.abs((lastLine.fontSize || 11) - (nextL.fontSize || 11)) <= 1.5 &&
        Boolean(lastLine.clusters[0]?.isBold) === Boolean(nextL.clusters[0]?.isBold)
      ) {
        mergedText += ' ' + nextL.fullText;
        lastLine = nextL;
        nextPIdx++;
      } else {
        break;
      }
    }

    let align = 'left';
    const midX = (cur.startX + cur.endX) / 2;
    if (Math.abs(midX - pageWidth / 2) < 25 && (cur.endX - cur.startX) < pageWidth * 0.6) {
      align = 'center';
    } else if (cur.startX > pageWidth * 0.55 && (cur.endX - cur.startX) < pageWidth * 0.4) {
      align = 'right';
    }

    finalBlocks.push({
      type: 'paragraph',
      topDist: cur.topDist,
      text: mergedText,
      fontSize,
      align,
      indentPt: Math.max(0, cur.startX - minContentX)
    });

    pIdx = nextPIdx;
  }

  return finalBlocks;
}

// Multi-column detector: identifies if items split into distinct columns with clean vertical gutters
function detectColumns(items, pageWidth) {
  if (!items || items.length < 16) return { isMultiColumn: false };

  const bucketSize = 5;
  const numBuckets = Math.ceil(pageWidth / bucketSize);
  const density = new Array(numBuckets).fill(0);

  items.forEach(it => {
    const x1 = Math.max(0, Math.floor(it.transform[4]));
    const w = it.width || (it.str.length * 6);
    const x2 = Math.min(pageWidth - 1, Math.ceil(it.transform[4] + w));
    const b1 = Math.floor(x1 / bucketSize);
    const b2 = Math.floor(x2 / bucketSize);
    for (let b = b1; b <= b2 && b < numBuckets; b++) density[b]++;
  });

  let inGutter = false;
  let gutterStart = 0;
  const gutters = [];

  for (let b = 0; b < numBuckets; b++) {
    const x = b * bucketSize;
    const count = density[b];
    if (count === 0 && !inGutter) {
      inGutter = true;
      gutterStart = x;
    } else if (count > 0 && inGutter) {
      inGutter = false;
      const gutterWidth = x - gutterStart;
      if (gutterStart > 35 && x < pageWidth - 35 && gutterWidth >= 20) {
        gutters.push({ start: gutterStart, end: x, width: gutterWidth });
      }
    }
  }

  if (gutters.length === 1) {
    const g = gutters[0];
    const leftItems = items.filter(it => it.transform[4] < g.start + 5);
    const rightItems = items.filter(it => it.transform[4] > g.end - 5);

    if (leftItems.length >= 8 && rightItems.length >= 8) {
      return {
        isMultiColumn: true,
        gutter: g,
        leftItems,
        rightItems
      };
    }
  }

  return { isMultiColumn: false };
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
  let onProgress = null;

  if (typeof optionsOrProgress === 'function') {
    onProgress = optionsOrProgress;
  } else {
    onProgress = maybeProgress;
  }

  onProgress?.(1, 10, 'Loading PDF document');
  const pdfDoc = await loadPDFDocument(pdfBuffer);
  const total = pdfDoc.numPages;

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

      const validItems = items.filter(it => it.str && it.str.trim());
      const colAnalysis = detectColumns(validItems, pageWidth);

      if (colAnalysis.isMultiColumn) {
        const g = colAnalysis.gutter;

        // Determine if there is an actual header spanning across both columns
        // (Only text items that bridge across the gutter)
        const crossColumnTopY = [];
        for (const it of validItems) {
          const x1 = it.transform[4];
          const w = it.width || (it.str.length * 6);
          const x2 = x1 + w;
          if (x1 < g.start + 15 && x2 > g.end - 15) {
            crossColumnTopY.push(it.transform[5]);
          }
        }

        let splitTopY = 0;
        if (crossColumnTopY.length > 0) {
          splitTopY = Math.min(...crossColumnTopY) - 5;
        }

        const headerItems = [];
        const col1Items = [];
        const col2Items = [];

        for (const it of validItems) {
          if (splitTopY > 0 && it.transform[5] > splitTopY) {
            headerItems.push(it);
          } else {
            const midX = it.transform[4] + ((it.width || it.str.length * 6) / 2);
            if (midX < (g.start + g.end) / 2) {
              col1Items.push(it);
            } else {
              col2Items.push(it);
            }
          }
        }

        let headerBlocks = [];
        if (headerItems.length > 0) {
          const headerLines = parseItemsIntoLines(headerItems, pageHeight, linkAnnotations);
          headerBlocks = buildBlocksFromLines(headerLines, pageWidth, minContentX, deduplicatedLines);
        }

        const col1Lines = parseItemsIntoLines(col1Items, pageHeight, linkAnnotations);
        const col1Blocks = buildBlocksFromLines(col1Lines, g.start, minContentX, deduplicatedLines);

        const col2Lines = parseItemsIntoLines(col2Items, pageHeight, linkAnnotations);
        const col2Blocks = buildBlocksFromLines(col2Lines, pageWidth - g.end, g.end, deduplicatedLines);

        // Distribute images into columns or header
        for (const img of pageImages) {
          if (splitTopY > 0 && img.y > splitTopY) {
            headerBlocks.push(img);
          } else {
            const midX = img.x + (img.imgItem.widthPt / 2);
            if (midX < (g.start + g.end) / 2) {
              col1Blocks.push(img);
            } else {
              col2Blocks.push(img);
            }
          }
        }

        // Distribute vector divider lines into columns or header
        const pageLines_vec = [];
        for (const dl of deduplicatedLines) {
          if (splitTopY > 0 && dl.y > splitTopY) {
            headerBlocks.push(dl);
          } else {
            const midX = (dl.left + dl.right) / 2;
            if (midX < (g.start + g.end) / 2 && dl.width < (g.start + 60)) {
              col1Blocks.push({ ...dl, inColumn: true });
            } else if (midX >= (g.start + g.end) / 2 && dl.left >= g.start - 25) {
              col2Blocks.push({ ...dl, inColumn: true });
            } else {
              pageLines_vec.push(dl);
            }
          }
        }

        if (headerBlocks.length > 0) {
          headerBlocks.sort((a, b) => a.topDist - b.topDist);
          pageBlocks.push(...headerBlocks);
        }

        col1Blocks.sort((a, b) => a.topDist - b.topDist);
        col2Blocks.sort((a, b) => a.topDist - b.topDist);

        const col1WidthDxa = Math.max(2000, Math.round((g.start - minContentX + 15) * 20));
        const col2WidthDxa = Math.max(3000, Math.round((maxContentX - g.end + 15) * 20));

        pageBlocks.push({
          type: 'columnLayout',
          topDist: headerBlocks.length > 0 ? (headerBlocks[headerBlocks.length - 1].topDist + 20) : 0,
          columns: [
            { widthDxa: col1WidthDxa, blocks: col1Blocks },
            { widthDxa: col2WidthDxa, blocks: col2Blocks }
          ]
        });

        // Add any remaining full-page lines
        if (pageLines_vec.length > 0) {
          pageBlocks.push(...pageLines_vec);
        }
      } else {
        const parsedLines = parseItemsIntoLines(validItems, pageHeight, linkAnnotations);
        const blocks = buildBlocksFromLines(parsedLines, pageWidth, minContentX, deduplicatedLines);
        pageBlocks.push(...deduplicatedLines);
        pageBlocks.push(...blocks);
        pageBlocks.push(...pageImages);
      }

      pageBlocks.sort((a, b) => a.topDist - b.topDist);

      docPages.push({
        pageNum,
        pageWidth,
        pageHeight,
        minContentX,
        maxContentX,
        minContentY,
        maxContentY,
        elements: pageBlocks
      });
    }
  } catch (err) {
    console.error('Error processing PDF to DOCX:', err);
    throw err;
  }

  onProgress?.(total, total, 'Compiling layout-faithful Microsoft Word (.docx)...');

  // Helper to render text runs with hyperlinks
  function renderRuns(text, fontSize, isBold = false, isItalic = false, color = null) {
    const szVal = fontSize
      ? `<w:sz w:val="${Math.round(fontSize * 2)}"/><w:szCs w:val="${Math.round(fontSize * 2)}"/>`
      : '<w:sz w:val="22"/><w:szCs w:val="22"/>';
    const bVal = isBold ? '<w:b/><w:bCs/>' : '';
    const iVal = isItalic ? '<w:i/><w:iCs/>' : '';
    const cVal = color ? `<w:color w:val="${color}"/>` : '';

    const urlRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let lastIdx = 0;
    let match;
    let resultXml = '';

    while ((match = urlRegex.exec(text)) !== null) {
      const preceding = text.slice(lastIdx, match.index);
      if (preceding) {
        resultXml += `<w:r><w:rPr>${szVal}${bVal}${iVal}${cVal}</w:rPr><w:t xml:space="preserve">${escapeXml(preceding)}</w:t></w:r>`;
      }

      const foundUrl = match[0];
      const targetUrl = (foundUrl.includes('@') && !foundUrl.startsWith('mailto:') && !foundUrl.startsWith('http'))
        ? `mailto:${foundUrl}`
        : foundUrl;
      const relId = getOrCreateHyperlinkRel(targetUrl);
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
      resultXml += `<w:r><w:rPr>${szVal}${bVal}${iVal}${cVal}</w:rPr><w:t xml:space="preserve">${escapeXml(remaining)}</w:t></w:r>`;
    }

    return resultXml || `<w:r><w:rPr>${szVal}${bVal}${iVal}${cVal}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
  }

  // Helper to render an element (block) into WordprocessingML XML
  function renderBlockToXml(elem, pg, availableWidthDxa = 8000) {
    if (elem.type === 'columnLayout') {
      let cellsXml = '';
      let gridXml = '';
      let totalW = 0;
      for (const col of elem.columns) {
        totalW += col.widthDxa;
        gridXml += `<w:gridCol w:w="${col.widthDxa}"/>`;
        let colContentXml = '';
        for (const subElem of col.blocks) {
          colContentXml += renderBlockToXml(subElem, pg, col.widthDxa);
        }
        if (!colContentXml.trim()) {
          colContentXml = '<w:p><w:pPr><w:spacing w:after="60"/></w:pPr></w:p>';
        } else if (!colContentXml.trim().endsWith('</w:p>')) {
          colContentXml += '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr></w:p>';
        }
        cellsXml += `
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="${col.widthDxa}" w:type="dxa"/>
              <w:vAlign w:val="top"/>
            </w:tcPr>
            ${colContentXml}
          </w:tc>
        `;
      }
      return `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="${totalW}" w:type="dxa"/>
            <w:tblLayout w:type="fixed"/>
            <w:tblBorders>
              <w:top w:val="none"/>
              <w:left w:val="none"/>
              <w:bottom w:val="none"/>
              <w:right w:val="none"/>
              <w:insideH w:val="none"/>
              <w:insideV w:val="none"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="0" w:type="dxa"/>
              <w:left w:w="80" w:type="dxa"/>
              <w:bottom w:w="0" w:type="dxa"/>
              <w:right w:w="80" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
          <w:tblGrid>
            ${gridXml}
          </w:tblGrid>
          <w:tr>
            <w:trPr><w:cantSplit/></w:trPr>
            ${cellsXml}
          </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="60"/></w:pPr></w:p>
      `;
    }

    if (elem.type === 'line') {
      if (elem.inColumn) {
        return `
          <w:p>
            <w:pPr>
              <w:pBdr>
                <w:bottom w:val="single" w:sz="12" w:space="1" w:color="CCCCCC"/>
              </w:pBdr>
              <w:spacing w:before="40" w:after="60"/>
            </w:pPr>
            <w:r><w:t xml:space="preserve"></w:t></w:r>
          </w:p>
        `;
      }
      const leftIndentDxa = Math.max(0, Math.round((elem.left - pg.minContentX) * 20));
      const rightIndentDxa = Math.max(0, Math.round((pg.maxContentX - elem.right) * 20));
      return `
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
    }

    if (elem.type === 'image') {
      const img = elem.imgItem;
      let emuWidth = Math.round(img.widthPt * 12700);
      let emuHeight = Math.round(img.heightPt * 12700);
      const maxColEmu = Math.max(800000, Math.round((availableWidthDxa - 160) * 635));
      if (emuWidth > maxColEmu) {
        const ratio = maxColEmu / emuWidth;
        emuWidth = maxColEmu;
        emuHeight = Math.round(emuHeight * ratio);
      }
      const jcVal = elem.align || 'center';
      return `
        <w:p>
          <w:pPr>
            <w:jc w:val="${jcVal}"/>
            <w:spacing w:before="60" w:after="80" w:line="240" w:lineRule="auto"/>
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
    }

    if (elem.type === 'tabbedLine') {
      const leftText = elem.leftCluster.text;
      const rightText = elem.rightCluster.text;
      const tabPosDxa = Math.max(1200, Math.round((elem.rightCluster.startX - elem.leftCluster.startX) * 20));
      return `
        <w:p>
          <w:pPr>
            <w:tabs>
              <w:tab w:val="left" w:pos="${tabPosDxa}"/>
            </w:tabs>
            <w:spacing w:before="30" w:after="40" w:line="240" w:lineRule="auto"/>
          </w:pPr>
          ${renderRuns(leftText, elem.fontSize, elem.leftCluster.isBold || false, false, '64748B')}
          <w:r><w:tab/></w:r>
          ${renderRuns(rightText, elem.fontSize, elem.rightCluster.isBold || false, false, '0F172A')}
        </w:p>
      `;
    }

    if (elem.type === 'table') {
      const numCols = elem.numCols || 2;
      let tableRowsXml = '';
      elem.rows.forEach((row, rIdx) => {
        const isHead = (rIdx === 0 && elem.rows.length > 1);
        let cellsXml = '';
        for (let c = 0; c < numCols; c++) {
          const cell = row[c] || { text: '' };
          const safeText = escapeXml(cell.text || '');
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
      return `
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
    }

    if (elem.type === 'heading') {
      const hStyle = elem.level === 1 ? 'Heading1' : 'Heading2';
      const jcVal = elem.align && elem.align !== 'left' ? `<w:jc w:val="${elem.align}"/>` : '';
      return `
        <w:p>
          <w:pPr>
            <w:pStyle w:val="${hStyle}"/>
            <w:spacing w:before="160" w:after="60" w:line="240" w:lineRule="auto"/>
            ${jcVal}
          </w:pPr>
          ${renderRuns(elem.text, elem.fontSize, true, false, elem.level === 1 ? '0F172A' : '334155')}
        </w:p>
      `;
    }

    if (elem.type === 'list') {
      return `
        <w:p>
          <w:pPr>
            <w:ind w:left="360" w:hanging="200"/>
            <w:spacing w:before="20" w:after="40" w:line="240" w:lineRule="auto"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:b/><w:bCs/>
              <w:sz w:val="${Math.round(elem.fontSize * 2)}"/><w:szCs w:val="${Math.round(elem.fontSize * 2)}"/>
              <w:color w:val="475569"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(elem.bullet)} </w:t>
          </w:r>
          ${renderRuns(elem.text, elem.fontSize, false, false, '334155')}
        </w:p>
      `;
    }

    if (elem.type === 'paragraph') {
      const jcVal = elem.align && elem.align !== 'left' ? `<w:jc w:val="${elem.align}"/>` : '';
      const indVal = (elem.indentPt && elem.indentPt > 18)
        ? `<w:ind w:left="${Math.round(elem.indentPt * 20)}"/>`
        : '';
      return `
        <w:p>
          <w:pPr>
            <w:pStyle w:val="Normal"/>
            <w:spacing w:before="20" w:after="60" w:line="240" w:lineRule="auto"/>
            ${indVal}
            ${jcVal}
          </w:pPr>
          ${renderRuns(elem.text, elem.fontSize || 11, false, false, '334155')}
        </w:p>
      `;
    }

    return '';
  }

  // Construct WordprocessingML XML body
  let bodyXml = '';

  for (let pIdx = 0; pIdx < docPages.length; pIdx++) {
    const pg = docPages[pIdx];

    for (const elem of pg.elements) {
      bodyXml += renderBlockToXml(elem, pg);
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
