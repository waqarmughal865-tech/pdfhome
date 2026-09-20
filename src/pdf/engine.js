/**
 * PDF Engine — core PDF operations using pdf-lib.
 * Pure functions: ArrayBuffer in → ArrayBuffer out.
 * No network calls. No side effects. No DOM access.
 */

import { PDFDocument, degrees } from 'pdf-lib';

/**
 * Ensure the buffer is a valid, non-detached Uint8Array copy.
 */
function getSafeBytes(buffer) {
  if (!buffer) throw new Error('No PDF data provided.');
  if (buffer instanceof Uint8Array) {
    return buffer.slice();
  }
  if (buffer instanceof ArrayBuffer) {
    if (buffer.byteLength === 0) {
      throw new Error('PDF buffer is empty or detached.');
    }
    return new Uint8Array(buffer.slice(0));
  }
  return new Uint8Array(buffer);
}

/**
 * Merge multiple PDFs into one.
 * @param {ArrayBuffer[]} buffers - Array of PDF file buffers
 * @param {function} [onProgress] - Progress callback (index, total)
 * @returns {Promise<Uint8Array>} Merged PDF bytes
 */
export async function mergePDFs(buffers, onProgress) {
  const merged = await PDFDocument.create();

  for (let i = 0; i < buffers.length; i++) {
    try {
      const bytes = getSafeBytes(buffers[i]);
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(page => merged.addPage(page));
    } catch (err) {
      throw new Error(`Failed to process PDF #${i + 1}: ${err.message}`);
    }
    onProgress?.(i + 1, buffers.length);
  }

  return merged.save({ useObjectStreams: true });
}

/**
 * Merge mixed content (PDFs, individual PDF pages, and Images) in any custom order.
 * @param {{ type: 'pdf'|'pdf-page'|'image', buffer: ArrayBuffer, pageIndex?: number, mimeType?: string, name?: string }[]} items
 * @param {function} [onProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function mergeMixedItems(items, onProgress) {
  const merged = await PDFDocument.create();

  // Determine reference page dimensions from the first PDF in the queue (if any)
  // Default to standard A4 (595.28 x 841.89 points)
  let refWidth = 595.28;
  let refHeight = 841.89;

  for (const it of items) {
    if ((it.type === 'pdf' || it.type === 'pdf-page') && it.buffer) {
      try {
        const bytes = getSafeBytes(it.buffer);
        const tempDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        if (tempDoc.getPageCount() > 0) {
          const p = tempDoc.getPage(it.pageIndex ?? 0);
          refWidth = p.getWidth();
          refHeight = p.getHeight();
          break;
        }
      } catch (e) {}
    }
  }

  const standardPortraitWidth = Math.min(refWidth, refHeight);
  const standardPortraitHeight = Math.max(refWidth, refHeight);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      if (item.type === 'image') {
        let img;
        const bytes = getSafeBytes(item.buffer);
        const isPng = item.mimeType === 'image/png' || item.name?.toLowerCase().endsWith('.png');
        try {
          if (isPng) {
            img = await merged.embedPng(bytes);
          } else {
            img = await merged.embedJpg(bytes);
          }
        } catch (embedErr) {
          // Fallback: try the alternative format
          try {
            img = isPng ? await merged.embedJpg(bytes) : await merged.embedPng(bytes);
          } catch (e2) {
            throw embedErr;
          }
        }

        // Align page size with PDF document dimensions (or standard A4)
        const isLandscape = img.width > img.height;
        const pageWidth = isLandscape ? standardPortraitHeight : standardPortraitWidth;
        const pageHeight = isLandscape ? standardPortraitWidth : standardPortraitHeight;

        const page = merged.addPage([pageWidth, pageHeight]);
        const scale = Math.min(pageWidth / img.width, pageHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        page.drawImage(img, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      } else if (item.type === 'pdf-page') {
        const bytes = getSafeBytes(item.buffer);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const [copiedPage] = await merged.copyPages(doc, [item.pageIndex]);
        merged.addPage(copiedPage);
      } else {
        const bytes = getSafeBytes(item.buffer);
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
    } catch (err) {
      throw new Error(`Failed to process item #${i + 1} (${item.name || item.type}): ${err.message}`);
    }
    onProgress?.(i + 1, items.length);
  }

  return merged.save({ useObjectStreams: true });
}

/**
 * Extract specific pages from a PDF.
 * @param {ArrayBuffer} buffer - PDF file buffer
 * @param {number[]} pageNumbers - 1-based page numbers to extract
 * @returns {Promise<Uint8Array>} New PDF with selected pages
 */
export async function extractPages(buffer, pageNumbers) {
  const bytes = getSafeBytes(buffer);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  // Convert 1-based to 0-based indices
  const indices = pageNumbers.map(n => n - 1);
  const pages = await newDoc.copyPages(srcDoc, indices);
  pages.forEach(page => newDoc.addPage(page));

  return newDoc.save({ useObjectStreams: true });
}

/**
 * Split a PDF into individual pages.
 * @param {ArrayBuffer} buffer - PDF file buffer
 * @param {function} [onProgress] - Progress callback (index, total)
 * @returns {Promise<Uint8Array[]>} Array of single-page PDF bytes
 */
export async function splitAllPages(buffer, onProgress) {
  const bytes = getSafeBytes(buffer);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();
  const results = [];

  for (let i = 0; i < total; i++) {
    const newDoc = await PDFDocument.create();
    const [page] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(page);
    results.push(await newDoc.save({ useObjectStreams: true }));
    onProgress?.(i + 1, total);
  }

  return results;
}

/**
 * Split a PDF by page ranges.
 * Each range produces a separate PDF.
 * @param {ArrayBuffer} buffer
 * @param {number[][]} ranges - Array of page number arrays (1-based)
 * @returns {Promise<Uint8Array[]>}
 */
export async function splitByRanges(buffer, ranges) {
  const bytes = getSafeBytes(buffer);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const results = [];

  for (const range of ranges) {
    const newDoc = await PDFDocument.create();
    const indices = range.map(n => n - 1);
    const pages = await newDoc.copyPages(srcDoc, indices);
    pages.forEach(page => newDoc.addPage(page));
    results.push(await newDoc.save({ useObjectStreams: true }));
  }

  return results;
}

/**
 * Delete pages from a PDF.
 * @param {ArrayBuffer} buffer
 * @param {number[]} pageNumbers - 1-based page numbers to remove
 * @returns {Promise<Uint8Array>}
 */
export async function deletePages(buffer, pageNumbers) {
  const bytes = getSafeBytes(buffer);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = srcDoc.getPageCount();
  const removeSet = new Set(pageNumbers.map(n => n - 1)); // 0-based
  const keepIndices = [];

  for (let i = 0; i < total; i++) {
    if (!removeSet.has(i)) keepIndices.push(i);
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages.');
  }

  const newDoc = await PDFDocument.create();
  const pages = await newDoc.copyPages(srcDoc, keepIndices);
  pages.forEach(page => newDoc.addPage(page));

  return newDoc.save({ useObjectStreams: true });
}

/**
 * Rotate pages in a PDF.
 * @param {ArrayBuffer} buffer
 * @param {Object} rotations - Map of 1-based page number → rotation degrees (90, 180, 270)
 * @returns {Promise<Uint8Array>}
 */
export async function rotatePages(buffer, rotations) {
  const bytes = getSafeBytes(buffer);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });

  for (const [pageNumStr, angle] of Object.entries(rotations)) {
    const pageIndex = parseInt(pageNumStr, 10) - 1;
    const page = doc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  }

  return doc.save({ useObjectStreams: true });
}

/**
 * Reorder pages in a PDF.
 * @param {ArrayBuffer} buffer
 * @param {number[]} newOrder - Array of 1-based page numbers in desired order
 * @returns {Promise<Uint8Array>}
 */
export async function reorderPages(buffer, newOrder) {
  const bytes = getSafeBytes(buffer);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const indices = newOrder.map(n => n - 1);
  const pages = await newDoc.copyPages(srcDoc, indices);
  pages.forEach(page => newDoc.addPage(page));

  return newDoc.save({ useObjectStreams: true });
}

/**
 * Create a PDF from image blobs/buffers.
 * @param {{ buffer: ArrayBuffer, type: string }[]} images
 * @param {function} [onProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function imagesToPDF(images, onProgress) {
  const doc = await PDFDocument.create();

  // Standard A4 dimensions in PDF points (595.28 x 841.89)
  const a4Width = 595.28;
  const a4Height = 841.89;

  for (let i = 0; i < images.length; i++) {
    const { buffer, type } = images[i];
    let img;

    if (type === 'image/png') {
      img = await doc.embedPng(buffer);
    } else {
      // JPEG and WEBP (will be converted to JPEG via canvas before calling this)
      img = await doc.embedJpg(buffer);
    }

    const isLandscape = img.width > img.height;
    const pageWidth = isLandscape ? a4Height : a4Width;
    const pageHeight = isLandscape ? a4Width : a4Height;

    const page = doc.addPage([pageWidth, pageHeight]);
    const scale = Math.min(pageWidth / img.width, pageHeight / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(img, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });

    onProgress?.(i + 1, images.length);
  }

  return doc.save({ useObjectStreams: true });
}

/**
 * Get basic info about a PDF.
 * @param {ArrayBuffer} buffer
 * @returns {Promise<{ pageCount: number, title: string, author: string }>}
 */
export async function getPDFInfo(buffer) {
  const bytes = getSafeBytes(buffer);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
  };
}
