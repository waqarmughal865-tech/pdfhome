/**
 * PDF Page Editor Engine — client-side PDF editing operations:
 * - Watermark & Transparent Signature Overlay (with 9-anchor positioning, opacity, scale, and page exclusion)
 * - Header & Footer Page Numbering ("Page X of Y", custom start, cover exclusion)
 * - PDF Margin Cropping (setCropBox / setMediaBox)
 * - Password Locking & Encryption (client-side RC4 128-bit standard encryption)
 * - Page Reordering, Rotation & Deletion
 */

import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFRawStream, PDFHexString, PDFString, PDFDict, PDFArray } from 'pdf-lib';
import { encryptPDF, RC4, md5, hexToBytes, bytesToHex } from '@pdfsmaller/pdf-encrypt-lite';
import { loadPDFDocument, renderPageToCanvas } from './renderer.js';

/**
 * Ensure independent Uint8Array copy.
 */
function getSafeBuffer(buffer) {
  if (!buffer) throw new Error('No PDF data provided');
  if (buffer instanceof Uint8Array) return buffer.slice();
  if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer.slice(0));
  return new Uint8Array(buffer);
}

/**
 * Apply Image or Text Watermark / Signature to PDF pages.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {Object} options
 * @param {'image'|'text'} options.type
 * @param {ArrayBuffer|Uint8Array} [options.imageData] - Raw PNG, JPG, or WebP bytes
 * @param {string} [options.mimeType] - 'image/png' | 'image/jpeg' | 'image/webp'
 * @param {string} [options.text] - Watermark text
 * @param {string} [options.anchor] - 'center'|'top-left'|'top-center'|'top-right'|'middle-left'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right'
 * @param {number} [options.opacity] - 0.1 to 1.0 (default 0.7)
 * @param {number} [options.scale] - 0.1 to 1.5 (default 0.4)
 * @param {number} [options.rotation] - degrees (default 0)
 * @param {number} [options.margin] - margin from edge in pt (default 30)
 * @param {Set<number>|Array<number>} [options.excludePages] - 1-based page numbers to skip
 * @returns {Promise<Uint8Array>}
 */
export async function applyWatermark(pdfBuffer, options = {}) {
  const bytes = getSafeBuffer(pdfBuffer);
  const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
  const total = doc.getPageCount();

  const {
    type = 'image',
    imageData,
    mimeType = 'image/png',
    text = 'CONFIDENTIAL',
    anchor = 'center',
    customPosition = null,
    opacity = 0.7,
    scale = 0.4,
    rotation = 0,
    margin = 30,
    excludePages = new Set(),
  } = options;

  const excluded = excludePages instanceof Set ? excludePages : new Set(excludePages || []);

  let embeddedImage = null;
  let imgDims = { width: 0, height: 0 };
  let font = null;

  if (type === 'image') {
    if (!imageData) {
      // Nothing to watermark if no image data is passed
      return doc.save({ useObjectStreams: true });
    }
    // Embed PNG or JPG
    const isPng = mimeType === 'image/png' || (!mimeType.includes('jpeg') && !mimeType.includes('jpg'));
    if (isPng) {
      try {
        embeddedImage = await doc.embedPng(imageData);
      } catch (e) {
        embeddedImage = await doc.embedJpg(imageData);
      }
    } else {
      try {
        embeddedImage = await doc.embedJpg(imageData);
      } catch (e) {
        embeddedImage = await doc.embedPng(imageData);
      }
    }
    imgDims = embeddedImage.scale(scale);
  } else {
    font = await doc.embedFont(StandardFonts.HelveticaBold);
  }

  for (let i = 1; i <= total; i++) {
    if (excluded.has(i)) continue;

    const page = doc.getPage(i - 1);
    const { width: pWidth, height: pHeight } = page.getSize();

    if (type === 'image' && embeddedImage) {
      const w = imgDims.width;
      const h = imgDims.height;
      let x = (pWidth - w) / 2;
      let y = (pHeight - h) / 2;

      if (customPosition && typeof customPosition.xPct === 'number' && typeof customPosition.yPct === 'number') {
        x = customPosition.xPct * pWidth;
        y = pHeight - (customPosition.yPct * pHeight) - h;
      } else {
        switch (anchor) {
          case 'top-left':
            x = margin;
            y = pHeight - h - margin;
            break;
          case 'top-center':
            x = (pWidth - w) / 2;
            y = pHeight - h - margin;
            break;
          case 'top-right':
            x = pWidth - w - margin;
            y = pHeight - h - margin;
            break;
          case 'middle-left':
            x = margin;
            y = (pHeight - h) / 2;
            break;
          case 'center':
            x = (pWidth - w) / 2;
            y = (pHeight - h) / 2;
            break;
          case 'middle-right':
            x = pWidth - w - margin;
            y = (pHeight - h) / 2;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-center':
            x = (pWidth - w) / 2;
            y = margin;
            break;
          case 'bottom-right':
            x = pWidth - w - margin;
            y = margin;
            break;
        }
      }

      page.drawImage(embeddedImage, {
        x,
        y,
        width: w,
        height: h,
        opacity: Math.max(0.05, Math.min(1.0, opacity)),
        rotate: degrees(rotation),
      });
    } else {
      // Text watermark
      const textSize = Math.round(36 * scale);
      const textWidth = font.widthOfTextAtSize(text, textSize);
      const textHeight = font.heightAtSize(textSize);

      let x = (pWidth - textWidth) / 2;
      let y = (pHeight - textHeight) / 2;

      if (customPosition && typeof customPosition.xPct === 'number' && typeof customPosition.yPct === 'number') {
        x = customPosition.xPct * pWidth;
        y = pHeight - (customPosition.yPct * pHeight) - textHeight;
      } else {
        switch (anchor) {
          case 'top-left':
            x = margin;
            y = pHeight - textHeight - margin;
            break;
          case 'top-center':
            x = (pWidth - textWidth) / 2;
            y = pHeight - textHeight - margin;
            break;
          case 'top-right':
            x = pWidth - textWidth - margin;
            y = pHeight - textHeight - margin;
            break;
          case 'middle-left':
            x = margin;
            y = (pHeight - textHeight) / 2;
            break;
          case 'center':
            x = (pWidth - textWidth) / 2;
            y = (pHeight - textHeight) / 2;
            break;
          case 'middle-right':
            x = pWidth - textWidth - margin;
            y = (pHeight - textHeight) / 2;
            break;
          case 'bottom-left':
            x = margin;
            y = margin;
            break;
          case 'bottom-center':
            x = (pWidth - textWidth) / 2;
            y = margin;
            break;
          case 'bottom-right':
            x = pWidth - textWidth - margin;
            y = margin;
            break;
        }
      }

      page.drawText(text, {
        x,
        y,
        size: textSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
        opacity: Math.max(0.05, Math.min(1.0, opacity)),
        rotate: degrees(rotation),
      });
    }
  }

  return doc.save({ useObjectStreams: true });
}

/**
 * Apply Page Numbers to PDF pages.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {Object} options
 * @param {'bottom-center'|'bottom-right'|'bottom-left'|'top-center'|'top-right'|'top-left'} [options.position]
 * @param {'page_x_of_y'|'x_of_y'|'x'} [options.format]
 * @param {number} [options.startNumber]
 * @param {number} [options.margin]
 * @param {number} [options.fontSize]
 * @param {boolean} [options.excludeFirstPage]
 * @returns {Promise<Uint8Array>}
 */
export async function applyPageNumbers(pdfBuffer, options = {}) {
  const bytes = getSafeBuffer(pdfBuffer);
  const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const total = doc.getPageCount();

  const {
    position = 'bottom-center',
    format = 'page_x_of_y',
    startNumber = 1,
    margin = 24,
    fontSize = 10,
    excludeFirstPage = false,
  } = options;

  for (let i = 0; i < total; i++) {
    if (excludeFirstPage && i === 0) continue;

    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const currentNum = startNumber + i;

    let numText = `${currentNum}`;
    if (format === 'page_x_of_y') {
      numText = `Page ${currentNum} of ${total}`;
    } else if (format === 'x_of_y') {
      numText = `${currentNum} / ${total}`;
    }

    const textWidth = font.widthOfTextAtSize(numText, fontSize);
    let x = (width - textWidth) / 2;
    let y = margin;

    switch (position) {
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        y = margin;
        break;
      case 'top-left':
        x = margin;
        y = height - margin - fontSize;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin - fontSize;
        break;
    }

    page.drawText(numText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  return doc.save({ useObjectStreams: true });
}

/**
 * Apply Margin Crop to PDF pages.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {Object} options
 * @param {{ top: number, bottom: number, left: number, right: number }} options.insets
 * @param {Set<number>|Array<number>|'all'} [options.targetPages]
 * @returns {Promise<Uint8Array>}
 */
export async function applyCrop(pdfBuffer, options = {}) {
  const bytes = getSafeBuffer(pdfBuffer);
  const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
  const total = doc.getPageCount();

  const {
    insets = { top: 0, bottom: 0, left: 0, right: 0 },
    pageCrops = null,
    targetPages = 'all',
  } = options;

  const targets = targetPages === 'all' 
    ? null 
    : (targetPages instanceof Set ? targetPages : new Set(targetPages));

  for (let i = 1; i <= total; i++) {
    if (targets && !targets.has(i)) continue;

    const page = doc.getPage(i - 1);
    const box = page.getMediaBox();

    const curInsets = (pageCrops && pageCrops[i]) ? pageCrops[i] : insets;
    const top = curInsets.top || 0;
    const bottom = curInsets.bottom || 0;
    const left = curInsets.left || 0;
    const right = curInsets.right || 0;

    if (top === 0 && bottom === 0 && left === 0 && right === 0) continue;

    const newX = box.x + left;
    const newY = box.y + bottom;
    const newWidth = Math.max(60, box.width - left - right);
    const newHeight = Math.max(60, box.height - top - bottom);

    page.setCropBox(newX, newY, newWidth, newHeight);
    page.setMediaBox(newX, newY, newWidth, newHeight);
  }

  return doc.save({ useObjectStreams: true });
}

/**
 * Lock and encrypt a PDF with a user password.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {string} password
 * @returns {Promise<Uint8Array>}
 */
export async function lockPDF(pdfBuffer, password) {
  if (!password || password.trim().length === 0) {
    throw new Error('Please specify a password to lock the document.');
  }

  const bytes = getSafeBuffer(pdfBuffer);
  // Re-save with clean pdf-lib object streams first
  const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
  const cleanBytes = await doc.save({ useObjectStreams: true });

  // Encrypt with standard 128-bit RC4 PDF encryption
  const encrypted = await encryptPDF(cleanBytes, password.trim(), {
    ownerPassword: password.trim(),
    userPassword: password.trim(),
  });

  return new Uint8Array(encrypted);
}

// ==========================================
// UNLOCK & DECRYPT PDF OPERATIONS
// ==========================================

const PADDING_BYTES = new Uint8Array([
  0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
  0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
  0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
  0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A
]);

function padPasswordBytes(password) {
  const enc = new TextEncoder().encode(password);
  const padded = new Uint8Array(32);
  if (enc.length >= 32) {
    padded.set(enc.slice(0, 32));
  } else {
    padded.set(enc);
    padded.set(PADDING_BYTES.slice(0, 32 - enc.length), enc.length);
  }
  return padded;
}

function computeDecryptionKey(userPassword, ownerKey, permissions, fileId) {
  const paddedPwd = padPasswordBytes(userPassword);
  const hashInput = new Uint8Array(paddedPwd.length + ownerKey.length + 4 + fileId.length);
  let offset = 0;
  hashInput.set(paddedPwd, offset);
  offset += paddedPwd.length;
  hashInput.set(ownerKey, offset);
  offset += ownerKey.length;
  hashInput[offset++] = permissions & 0xFF;
  hashInput[offset++] = (permissions >> 8) & 0xFF;
  hashInput[offset++] = (permissions >> 16) & 0xFF;
  hashInput[offset++] = (permissions >> 24) & 0xFF;
  hashInput.set(fileId, offset);

  let hash = md5(hashInput);
  for (let i = 0; i < 50; i++) {
    hash = md5(hash.slice(0, 16));
  }
  return hash.slice(0, 16);
}

function decryptCipherData(data, objectNum, generationNum, encryptionKey) {
  const keyInput = new Uint8Array(encryptionKey.length + 5);
  keyInput.set(encryptionKey);
  keyInput[encryptionKey.length] = objectNum & 0xFF;
  keyInput[encryptionKey.length + 1] = (objectNum >> 8) & 0xFF;
  keyInput[encryptionKey.length + 2] = (objectNum >> 16) & 0xFF;
  keyInput[encryptionKey.length + 3] = generationNum & 0xFF;
  keyInput[encryptionKey.length + 4] = (generationNum >> 8) & 0xFF;

  const objectKey = md5(keyInput);
  const rc4 = new RC4(objectKey.slice(0, Math.min(encryptionKey.length + 5, 16)));
  return rc4.process(data);
}

/**
 * Check whether a PDF buffer has encryption protection.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @returns {Promise<boolean>}
 */
export async function isPDFEncrypted(pdfBuffer) {
  try {
    const bytes = getSafeBuffer(pdfBuffer);
    const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
    return Boolean(doc.isEncrypted || doc.context?.trailerInfo?.Encrypt);
  } catch (e) {
    const msg = (e.message || '').toLowerCase();
    return msg.includes('encrypt') || msg.includes('password');
  }
}

/**
 * Unlock and decrypt a password-protected PDF.
 * Strips all encryption restrictions and returns a clean, unencrypted PDF.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {string} password - User or owner password
 * @returns {Promise<Uint8Array>}
 */
export async function unlockPDF(pdfBuffer, password = '') {
  const bytes = getSafeBuffer(pdfBuffer);
  const trimmedPassword = (password || '').trim();

  // 1. Authenticate password using PDF.js
  let pdfDocProxy = null;
  try {
    pdfDocProxy = await loadPDFDocument(bytes.slice(), { password: trimmedPassword });
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('password') || err.name === 'PasswordException' || err.code === 1) {
      throw new Error('Incorrect password. Please verify the document password and try again.');
    }
    throw new Error(err.message || 'Failed to open protected PDF.');
  }

  // 2. Primary: Lossless in-place RC4 stream decryption
  try {
    const doc = await PDFDocument.load(bytes.slice(), { ignoreEncryption: true });
    const trailer = doc.context?.trailerInfo;
    const encryptRef = trailer?.Encrypt;

    if (!encryptRef) {
      // Document does not have an Encrypt trailer
      return doc.save({ useObjectStreams: true });
    }

    const encryptDict = doc.context.lookup(encryptRef);
    if (encryptDict && encryptDict instanceof PDFDict) {
      const filter = encryptDict.get(PDFName.of('Filter'));
      const filterName = filter && typeof filter.asString === 'function' ? filter.asString() : '';
      const v = encryptDict.get(PDFName.of('V'))?.asNumber?.() || 0;

      // Standard revision 2/3 (RC4 40/128-bit)
      if (filterName === '/Standard' && (v === 1 || v === 2)) {
        const oObj = encryptDict.get(PDFName.of('O'));
        const pObj = encryptDict.get(PDFName.of('P'));
        if (oObj && pObj) {
          const O = oObj instanceof PDFHexString ? hexToBytes(oObj.value) : oObj.asBytes();
          const P = pObj.asNumber();
          const idArray = trailer.ID;
          const firstId = idArray ? (idArray.get ? idArray.get(0) : idArray[0]) : null;
          const fileId = firstId ? (firstId instanceof PDFHexString ? hexToBytes(firstId.value) : firstId.asBytes()) : new Uint8Array(16);

          const encKey = computeDecryptionKey(trimmedPassword, O, P, fileId);

          // Decrypt object streams
          const indirectObjects = doc.context.enumerateIndirectObjects();
          for (const [ref, obj] of indirectObjects) {
            if (ref.objectNumber === encryptRef.objectNumber) continue;
            if (obj instanceof PDFRawStream && obj.contents) {
              obj.contents = decryptCipherData(obj.contents, ref.objectNumber, ref.generationNumber || 0, encKey);
            }
          }

          // Strip encryption dictionary from trailer
          delete trailer.Encrypt;

          const decryptedBytes = await doc.save({ useObjectStreams: true });

          // Validate that the decrypted file opens without password
          const testTask = await loadPDFDocument(decryptedBytes.slice());
          if (testTask && testTask.numPages > 0) {
            return decryptedBytes;
          }
        }
      }
    }
  } catch (inPlaceErr) {
    console.warn('In-place RC4 decryption fell back to universal reconstruction:', inPlaceErr);
  }

  // 3. Fallback: Universal High-Definition Reconstruction (for AES-256 / complex encryption)
  try {
    const numPages = pdfDocProxy.numPages;
    const cleanDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const renderScale = 2.0; // High-DPI for crisp text and graphics

      const canvas = document.createElement('canvas');
      await renderPageToCanvas(pdfDocProxy, i, { scale: renderScale }, canvas);

      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      const binary = atob(base64);
      const pngBytes = new Uint8Array(binary.length);
      for (let k = 0; k < binary.length; k++) {
        pngBytes[k] = binary.charCodeAt(k);
      }

      const embeddedImg = await cleanDoc.embedPng(pngBytes);
      const newPage = cleanDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return cleanDoc.save({ useObjectStreams: true });
  } catch (reconstructErr) {
    throw new Error('Failed to decrypt document: ' + (reconstructErr.message || 'Unknown decryption error.'));
  }
}
