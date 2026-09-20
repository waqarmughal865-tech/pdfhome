/**
 * PDF Renderer — render PDF pages to Canvas/Images using PDF.js.
 * Client-side only. No network calls for PDF data.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export async function loadPDFDocument(buffer) {
  // CRITICAL: Clone the buffer data before passing to PDF.js!
  // PDF.js transfers the underlying ArrayBuffer to its Web Worker, which detaches
  // the original buffer in the main thread and makes its byteLength = 0.
  // By passing an independent Uint8Array copy, the original buffer remains intact for pdf-lib!
  let data;
  if (buffer instanceof Uint8Array) {
    data = new Uint8Array(buffer.slice());
  } else if (buffer instanceof ArrayBuffer) {
    data = new Uint8Array(buffer.slice(0));
  } else {
    data = new Uint8Array(buffer);
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/cmaps/',
    cMapPacked: true,
  });
  return loadingTask.promise;
}

/**
 * Render a single page to a Canvas element.
 * If a target canvas is provided, renders directly onto it.
 * Otherwise, creates and returns a new canvas.
 * @param {PDFDocumentProxy} pdfDoc
 * @param {number} pageNum - 1-based
 * @param {number|Object} [optionsOrScale=1] - scale number or { scale, rotation }
 * @param {HTMLCanvasElement} [targetCanvas=null]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderPageToCanvas(pdfDoc, pageNum, optionsOrScale = 1, targetCanvas = null) {
  let scale = 1;
  let rotation = 0;
  if (typeof optionsOrScale === 'number') {
    scale = optionsOrScale;
  } else if (optionsOrScale && typeof optionsOrScale === 'object') {
    scale = optionsOrScale.scale || 1;
    rotation = optionsOrScale.rotation || 0;
  }

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale, rotation });

  const canvas = targetCanvas || document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Cancel any existing render task on this canvas
  if (canvas._renderTask) {
    try {
      canvas._renderTask.cancel();
    } catch (e) {}
    canvas._renderTask = null;
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const renderTask = page.render({ canvasContext: ctx, viewport });
  canvas._renderTask = renderTask;

  try {
    await renderTask.promise;
  } catch (err) {
    if (err?.name !== 'RenderingCancelledException') {
      throw err;
    }
  } finally {
    if (canvas._renderTask === renderTask) {
      canvas._renderTask = null;
    }
  }

  return canvas;
}

/**
 * Render a page to a Blob (image file).
 * @param {PDFDocumentProxy} pdfDoc
 * @param {number} pageNum - 1-based
 * @param {'image/jpeg'|'image/png'} format
 * @param {number} quality - 0 to 1 for JPEG
 * @param {number} [scale=2]
 * @returns {Promise<Blob>}
 */
export async function renderPageToBlob(pdfDoc, pageNum, format = 'image/jpeg', quality = 0.92, scale = 2) {
  const canvas = await renderPageToCanvas(pdfDoc, pageNum, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      format,
      quality
    );
  });
}

/**
 * Generate a small thumbnail canvas for a page.
 * @param {PDFDocumentProxy} pdfDoc
 * @param {number} pageNum - 1-based
 * @param {number} [targetWidth=140]
 * @param {number} [rotation=0]
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function generateThumbnail(pdfDoc, pageNum, targetWidth = 140, rotation = 0) {
  const page = await pdfDoc.getPage(pageNum);
  const unscaledViewport = page.getViewport({ scale: 1, rotation });

  const scale = targetWidth / unscaledViewport.width;
  const viewport = page.getViewport({ scale, rotation });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

/**
 * Render all pages to Blobs with progress.
 * @param {PDFDocumentProxy} pdfDoc
 * @param {'image/jpeg'|'image/png'} format
 * @param {number} quality
 * @param {number} scale
 * @param {function} onProgress
 * @returns {Promise<Blob[]>}
 */
export async function renderAllPagesToBlobs(pdfDoc, format, quality, scale, onProgress) {
  const total = pdfDoc.numPages;
  const blobs = [];

  for (let i = 1; i <= total; i++) {
    const blob = await renderPageToBlob(pdfDoc, i, format, quality, scale);
    blobs.push(blob);
    onProgress?.(i, total);
  }

  return blobs;
}
