// src/pdf/ocr-engine.js
// 100% Client-side Picture/Scanned Text PDF to High Quality Searchable Text PDF
import { createWorker } from 'tesseract.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Enhance an image canvas for scanned documents:
 * Increases contrast, sharpens edges, and removes gray paper noise.
 * @param {HTMLCanvasElement} canvas 
 * @param {Object} options { enhanceContrast, removeNoise }
 */
export function enhanceScannedCanvas(canvas, { enhanceContrast = true, removeNoise = true } = {}) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Contrast enhancement factor
  const contrast = enhanceContrast ? 25 : 0;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Grayscale luminance
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (enhanceContrast) {
      gray = factor * (gray - 128) + 128;
    }

    if (removeNoise) {
      // Whiten off-white paper background (scanner noise)
      if (gray > 200) {
        gray = Math.min(255, gray + 30);
      }
      // Darken dark text strokes
      if (gray < 90) {
        gray = Math.max(0, gray - 20);
      }
    }

    gray = Math.min(255, Math.max(0, gray));

    // Store back enhanced rgb
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Convert Picture/Scanned Text PDF to a High-Quality Searchable Text PDF.
 * @param {Uint8Array} pdfBytes 
 * @param {Object} options { mode: 'searchable' | 'digital', enhanceImage: boolean, language: string }
 * @param {Function} onProgress 
 * @returns {Promise<Uint8Array>}
 */
export async function convertPicturePdfToTextPdf(
  pdfBytes,
  { mode = 'searchable', enhanceImage = true, language = 'eng' } = {},
  onProgress = () => {}
) {
  onProgress(5, 'Loading scanned document...');
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  onProgress(10, `Initializing OCR Engine (${language.toUpperCase()})...`);
  let worker = null;
  try {
    worker = await createWorker(language);
  } catch (err) {
    console.warn('Worker init error, fallback to recognize:', err);
  }

  const outDoc = await PDFDocument.create();
  const fontHelvetica = await outDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await outDoc.embedFont(StandardFonts.HelveticaBold);

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pageProgressBase = 10 + Math.round(((pageNum - 1) / numPages) * 80);
    onProgress(pageProgressBase, `Processing page ${pageNum} of ${numPages} (Rendering scan)...`);

    const page = await pdfDoc.getPage(pageNum);
    // Render at 2.0x scale for crisp OCR recognition and sharp output
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const origViewport = page.getViewport({ scale: 1.0 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    if (enhanceImage) {
      enhanceScannedCanvas(canvas, { enhanceContrast: true, removeNoise: true });
    }

    onProgress(pageProgressBase + 8, `Extracting text via OCR on page ${pageNum}...`);

    let ocrResult = null;
    try {
      if (worker) {
        const ret = await worker.recognize(canvas);
        ocrResult = ret.data;
      }
    } catch (ocrErr) {
      console.error(`OCR failed on page ${pageNum}:`, ocrErr);
    }

    const pdfPageWidth = origViewport.width;
    const pdfPageHeight = origViewport.height;

    if (mode === 'searchable') {
      // 1. SEARCHABLE HIGH QUALITY PDF
      // Embed enhanced scan image as base, then overlay invisible selectable text layer
      const imageBlob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      const imageBuffer = await imageBlob.arrayBuffer();
      const embeddedImg = await outDoc.embedJpg(imageBuffer);

      const newPage = outDoc.addPage([pdfPageWidth, pdfPageHeight]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: pdfPageWidth,
        height: pdfPageHeight
      });

      // Overlay invisible text layer so words can be highlighted, selected, copied, and searched with Ctrl+F
      if (ocrResult && ocrResult.words && ocrResult.words.length > 0) {
        const ratioX = pdfPageWidth / canvas.width;
        const ratioY = pdfPageHeight / canvas.height;

        for (const word of ocrResult.words) {
          if (!word.text || !word.bbox) continue;
          const cleanText = word.text.trim();
          if (!cleanText) continue;

          // Convert canvas bbox (top-left origin) to PDF coordinates (bottom-left origin)
          const boxX = word.bbox.x0 * ratioX;
          const boxW = Math.max(8, (word.bbox.x1 - word.bbox.x0) * ratioX);
          const boxH = Math.max(8, (word.bbox.y1 - word.bbox.y0) * ratioY);
          const boxY = pdfPageHeight - (word.bbox.y1 * ratioY);

          // Calculate font size to approximate box height
          const fontSize = Math.max(6, Math.min(36, boxH * 0.85));

          try {
            newPage.drawText(cleanText, {
              x: boxX,
              y: boxY,
              size: fontSize,
              font: fontHelvetica,
              // Invisible text layer: zero opacity enables full text selection and search
              opacity: 0.001,
              color: rgb(0, 0, 0)
            });
          } catch (tErr) {
            // Ignore glyph embedding errors for unusual symbols
          }
        }
      }
    } else {
      // 2. CLEAN DIGITAL TEXT PDF
      // Re-typeset extracted text cleanly with vector typography
      const newPage = outDoc.addPage([pdfPageWidth, pdfPageHeight]);

      newPage.drawRectangle({
        x: 0,
        y: 0,
        width: pdfPageWidth,
        height: pdfPageHeight,
        color: rgb(1, 1, 1)
      });

      const lines = ocrResult ? ocrResult.lines : [];
      let curY = pdfPageHeight - 50;

      if (lines && lines.length > 0) {
        for (const line of lines) {
          const text = (line.text || '').trim();
          if (!text) continue;

          if (curY < 50) break;

          // Check if looks like a heading
          const isHeading = (line.baseline?.y && line.line_height > 24) || text.length < 40 && text === text.toUpperCase();
          const fontSize = isHeading ? 16 : 11;
          const font = isHeading ? fontBold : fontHelvetica;

          try {
            newPage.drawText(text.slice(0, 110), {
              x: 50,
              y: curY,
              size: fontSize,
              font: font,
              color: rgb(0.12, 0.15, 0.2)
            });
          } catch (e) {}

          curY -= (fontSize * 1.4);
        }
      } else {
        newPage.drawText('Scanned Page ' + pageNum + ' (No text detected)', {
          x: 50,
          y: pdfPageHeight / 2,
          size: 14,
          font: fontHelvetica,
          color: rgb(0.5, 0.5, 0.5)
        });
      }
    }
  }

  if (worker) {
    await worker.terminate();
  }

  onProgress(95, 'Finalizing high-quality PDF document...');
  const resultBytes = await outDoc.save();
  onProgress(100, 'Searchable PDF generation complete!');
  return resultBytes;
}

/**
 * Extract recognized plain text from a PDF page canvas using OCR.
 * @param {PDFPageProxy} page - PDF.js page proxy
 * @param {Object} options
 * @param {string} [options.language='eng']
 * @param {boolean} [options.enhanceImage=true]
 * @param {Object} [options.worker=null]
 * @returns {Promise<string>}
 */
export async function extractOcrTextFromPage(page, { language = 'eng', enhanceImage = true, worker = null } = {}) {
  const scale = 2.0;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  if (enhanceImage) {
    enhanceScannedCanvas(canvas, { enhanceContrast: true, removeNoise: true });
  }

  let ownWorker = false;
  let activeWorker = worker;
  if (!activeWorker) {
    activeWorker = await createWorker(language);
    ownWorker = true;
  }

  try {
    const ret = await activeWorker.recognize(canvas);
    return ret?.data?.text || '';
  } catch (err) {
    console.warn('extractOcrTextFromPage error:', err);
    return '';
  } finally {
    if (ownWorker && activeWorker) {
      try { await activeWorker.terminate(); } catch (e) {}
    }
  }
}

