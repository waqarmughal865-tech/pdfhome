/**
 * Extract Images Tool — pull embedded images (photos, illustrations, diagrams)
 * out of a PDF and download them as PNG files (individually or as a ZIP).
 * Uses PDF.js operator lists + page objects. 100% client-side.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';
import JSZip from 'jszip';

const MIN_DIMENSION = 32; // skip tiny icons/decorations below this size

export function renderExtractImages(container) {
  let file = null;
  let pdfDoc = null;
  let pageCount = 0;
  let images = []; // { id, page, width, height, blob, thumbUrl, name }
  let scanning = false;
  let progress = 0;
  let scanned = false;

  function getPdfObject(page, name) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (obj) => {
        if (!done) { done = true; resolve(obj || null); }
      };
      const timer = setTimeout(() => finish(null), 1500);
      try {
        if (page.objs && typeof page.objs.get === 'function') {
          page.objs.get(name, (obj) => { clearTimeout(timer); finish(obj); });
        } else {
          clearTimeout(timer); finish(null);
        }
      } catch (e) { clearTimeout(timer); finish(null); }
    });
  }

  async function imageToPngBlob(imgObj) {
    if (!imgObj) return null;
    // Case 1: ImageBitmap (or object wrapping one)
    const bitmap = (typeof ImageBitmap !== 'undefined' && imgObj instanceof ImageBitmap)
      ? imgObj
      : (imgObj.bitmap && typeof ImageBitmap !== 'undefined' && imgObj.bitmap instanceof ImageBitmap)
        ? imgObj.bitmap : null;
    const width = imgObj.width || (bitmap && bitmap.width);
    const height = imgObj.height || (bitmap && bitmap.height);
    if (!width || !height) return null;
    if (width < MIN_DIMENSION || height < MIN_DIMENSION) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      if (bitmap) {
        ctx.drawImage(bitmap, 0, 0);
      } else if (imgObj.data) {
        const { data, kind } = imgObj;
        const imgData = ctx.createImageData(width, height);
        const out = imgData.data;
        const px = width * height;
        if (kind === 3 || data.length >= px * 4) {
          out.set(data.subarray(0, px * 4));
        } else if (kind === 2 || data.length >= px * 3) {
          for (let i = 0, s = 0, d = 0; i < px; i++, s += 3, d += 4) {
            out[d] = data[s]; out[d + 1] = data[s + 1]; out[d + 2] = data[s + 2]; out[d + 3] = 255;
          }
        } else {
          // grayscale / other: expand single channel
          for (let i = 0, d = 0; i < px && i < data.length; i++, d += 4) {
            const v = data[i];
            out[d] = v; out[d + 1] = v; out[d + 2] = v; out[d + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else {
        return null;
      }

      return await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });
    } catch (e) {
      return null;
    }
  }

  // Simple content hash to deduplicate the same image reused across pages
  function hashBytes(u8) {
    let h = 5381;
    const n = Math.min(u8.length, 4096);
    for (let i = 0; i < n; i += 4) h = ((h << 5) + h + u8[i]) | 0;
    return (h >>> 0).toString(36);
  }

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    if (!validateFileType(selectedFile, [PDF_MIME])) { showError('Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.ok) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    // Revoke old thumbnails
    images.forEach(im => { try { URL.revokeObjectURL(im.thumbUrl); } catch (e) {} });
    file = selectedFile;
    images = [];
    scanned = false;
    progress = 0;
    try {
      const buffer = await readFileAsArrayBuffer(file);
      pdfDoc = await loadPDFDocument(buffer);
      pageCount = pdfDoc.numPages;
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null; pdfDoc = null;
    }
    render();
  }

  async function scanImages() {
    if (!pdfDoc || scanning) return;
    scanning = true;
    images = [];
    scanned = false;
    progress = 0;
    render();
    try {
      const { OPS } = await import('pdfjs-dist');
      const seen = new Set();
      let idCounter = 0;
      for (let p = 1; p <= pageCount; p++) {
        const page = await pdfDoc.getPage(p);
        const opList = await page.getOperatorList();
        const names = [];
        for (let i = 0; i < opList.fnArray.length; i++) {
          const fn = opList.fnArray[i];
          if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject || fn === OPS.paintImageMaskXObject) {
            const args = opList.argsArray[i];
            if (args && args[0]) names.push(args[0]);
          }
        }
        // Resolve sequentially per page to keep memory bounded
        for (const name of names) {
          try {
            const imgObj = await getPdfObject(page, name);
            const blob = await imageToPngBlob(imgObj);
            if (blob && blob.size > 200) {
              const buf = new Uint8Array(await blob.arrayBuffer());
              const key = `${buf.length}:${hashBytes(buf)}`;
              if (!seen.has(key)) {
                seen.add(key);
                idCounter++;
                images.push({
                  id: idCounter,
                  page: p,
                  width: imgObj.width || 0,
                  height: imgObj.height || 0,
                  blob,
                  thumbUrl: URL.createObjectURL(blob),
                  name: `${getBasename(sanitizeFilename(file.name))}-p${p}-img${idCounter}.png`
                });
              }
            }
          } catch (e) { /* skip unresolvable image */ }
        }
        try { await page.cleanup(); } catch (e) {}
        progress = Math.round((p / pageCount) * 100);
        const bar = container.querySelector('#xi-progress-bar');
        const label = container.querySelector('#xi-progress-label');
        if (bar) bar.style.width = progress + '%';
        if (label) label.textContent = `Scanning page ${p} of ${pageCount}… (${images.length} found)`;
        if (p % 2 === 0) await new Promise(r => setTimeout(r, 0));
      }
    } catch (err) {
      showError(classifyError(err) || 'Image scan failed.');
    }
    scanning = false;
    scanned = true;
    render();
  }

  async function downloadAllZip() {
    if (!images.length) return;
    const btn = container.querySelector('#xi-zip');
    if (btn) { btn.disabled = true; btn.innerHTML = 'Preparing ZIP…'; }
    try {
      const zip = new JSZip();
      for (const im of images) {
        zip.file(im.name, await im.blob.arrayBuffer());
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${getBasename(sanitizeFilename(file.name))}-images.zip`);
    } catch (e) {
      showError('ZIP creation failed. Try downloading images individually.');
    }
    render();
  }

  function showError(msg) {
    const el = container.querySelector('#xi-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function hideError() {
    const el = container.querySelector('#xi-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const found = images.length;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Extract Images</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Pull embedded photos & illustrations out of any PDF — book images, diagrams, logos
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Actions Panel -->
            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="xi-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="xi-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="xi-input" accept=".pdf,application/pdf" />
              </div>

              ${file ? `
                <div class="tool-sidebar__card">
                  <div>
                    <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                      Active Document
                    </span>
                    <div style="font-weight:var(--weight-medium); font-size:var(--text-sm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:4px">
                      ${sanitizeFilename(file.name)}
                    </div>
                    <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
                      <strong>${pageCount}</strong> pages · ${formatFileSize(file.size)}
                    </div>
                  </div>

                  ${scanning ? `
                    <div style="margin-top:var(--space-3)">
                      <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:6px" id="xi-progress-label">Scanning…</div>
                      <div style="height:8px; background:var(--color-bg-secondary); border-radius:99px; overflow:hidden">
                        <div id="xi-progress-bar" style="height:100%; width:${progress}%; background:var(--color-primary); border-radius:99px; transition:width .2s"></div>
                      </div>
                    </div>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="xi-scan" style="width:100%">
                      ${icon('image', 18)} ${scanned ? 'Scan Again' : 'Extract Images'}
                    </button>
                  `}

                  ${scanned && found > 0 ? `
                    <button class="btn btn-secondary btn-lg" id="xi-zip" style="width:100%">
                      ${icon('download', 18)} Download All as ZIP (${found})
                    </button>
                  ` : ''}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="xi-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <!-- RIGHT SIDE: Results -->
            <main class="tool-worksite" id="xi-worksite">
              ${scanned ? (found > 0 ? `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-3)">
                  <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:0">Found ${found} image${found === 1 ? '' : 's'}</h3>
                  <span style="font-size:var(--text-xs); color:var(--color-text-tertiary)">Click any image to download PNG</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:var(--space-3)">
                  ${images.map(im => `
                    <button data-img-id="${im.id}" class="xi-thumb" style="border:1px solid var(--color-border); border-radius:var(--radius-lg); overflow:hidden; background:var(--color-bg-secondary); cursor:pointer; padding:0; text-align:left">
                      <img src="${im.thumbUrl}" alt="Embedded image ${im.id} from page ${im.page}" style="width:100%; height:120px; object-fit:contain; background:#fff; display:block" loading="lazy" />
                      <div style="padding:6px 8px; font-size:var(--text-xs); color:var(--color-text-secondary); display:flex; justify-content:space-between; align-items:center">
                        <span>Page ${im.page} · ${im.width}×${im.height}</span>
                        <span style="color:var(--color-primary)">${icon('download', 14)}</span>
                      </div>
                    </button>
                  `).join('')}
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('image', 32)}</div>
                  <h3 class="worksite-empty__title">No embedded images found</h3>
                  <p class="worksite-empty__subtitle">
                    This PDF has no extractable embedded pictures (it may contain only text or vector graphics).
                    To save pages as pictures instead, use the PDF to JPG tool.
                  </p>
                </div>
              `) : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('image', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Click "Extract Images" to scan' : 'Upload a PDF to extract its images'}</h3>
                  <p class="worksite-empty__subtitle">
                    Finds every embedded photo, illustration, and diagram inside your PDF — like pictures in a book —
                    and lets you download them as original-quality PNG files.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="xi-input" style="cursor:pointer">
                    ${icon('upload', 14)} Select PDF to Begin
                  </label>
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    // Bind events
    const input = container.querySelector('#xi-input');
    const drop = container.querySelector('#xi-drop');
    if (input) input.addEventListener('change', (e) => handleFile(e.target.files[0]));
    if (drop) {
      drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('drop-zone--active'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('drop-zone--active'));
      drop.addEventListener('drop', (e) => {
        e.preventDefault();
        drop.classList.remove('drop-zone--active');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      });
    }
    container.querySelector('#xi-scan')?.addEventListener('click', scanImages);
    container.querySelector('#xi-zip')?.addEventListener('click', downloadAllZip);
    container.querySelectorAll('.xi-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const im = images.find(x => String(x.id) === btn.getAttribute('data-img-id'));
        if (im) downloadBlob(im.blob, im.name);
      });
    });
  }

  render();
}
