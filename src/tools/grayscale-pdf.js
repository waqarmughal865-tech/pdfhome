/**
 * Grayscale PDF — convert every page to black & white, in the browser.
 * Renders each page through a canvas with a grayscale filter, then rebuilds
 * the PDF from the rendered images. Text becomes non-selectable images.
 */

import { PDFDocument } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';

export function renderGrayscalePdf(container) {
  let file = null;
  let fileBytes = null;
  let pageCount = 0;
  let converting = false;
  let progress = 0;
  let progressLabel = '';
  let grayBytes = null;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    const typeCheck = validateFileType(selectedFile, [PDF_MIME]);
    if (!typeCheck.valid) { showError(typeCheck.message || 'Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.valid) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    grayBytes = null;
    pageCount = 0;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
      const probe = await loadPDFDocument(fileBytes);
      pageCount = probe.numPages;
      await probe.destroy();
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function convert() {
    if (!fileBytes || converting) return;
    converting = true;
    grayBytes = null;
    progress = 0;
    progressLabel = 'Rendering pages…';
    render();
    try {
      const pdfJsDoc = await loadPDFDocument(fileBytes);
      const numPages = pdfJsDoc.numPages;
      const outDoc = await PDFDocument.create();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      for (let p = 1; p <= numPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        ctx.save();
        try { ctx.filter = 'grayscale(1)'; } catch (e) { /* older browsers: fallback below */ }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        ctx.restore();
        if (typeof page.cleanup === 'function') page.cleanup();

        const pngBytes = await new Promise((resolve, reject) => {
          canvas.toBlob((b) => {
            if (!b) { reject(new Error('Page render failed')); return; }
            b.arrayBuffer().then(resolve, reject);
          }, 'image/png');
        });
        const img = await outDoc.embedPng(pngBytes);
        const pg = outDoc.addPage([img.width / 2, img.height / 2]);
        pg.drawImage(img, { x: 0, y: 0, width: img.width / 2, height: img.height / 2 });

        progress = Math.round((p / numPages) * 90);
        progressLabel = `Converting page ${p} of ${numPages}…`;
        updateProgress();
        await new Promise(r => setTimeout(r, 0));
      }
      await pdfJsDoc.destroy();
      progressLabel = 'Building PDF…';
      updateProgress();
      grayBytes = await outDoc.save();
      progress = 100;
    } catch (err) {
      showError(classifyError(err) || 'Conversion failed.');
    }
    converting = false;
    render();
  }

  function updateProgress() {
    const bar = container.querySelector('#gry-progress-bar');
    const label = container.querySelector('#gry-progress-label');
    if (bar) bar.style.width = progress + '%';
    if (label) label.textContent = progressLabel;
  }

  function download() {
    if (!grayBytes) return;
    const blob = new Blob([grayBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-grayscale.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#gry-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#gry-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const done = !!grayBytes;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Grayscale PDF</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Turn a color PDF black & white — great for printing, 100% private
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="gry-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="gry-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="gry-input" accept=".pdf,application/pdf" />
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

                  ${converting ? `
                    <div style="margin-top:var(--space-3)">
                      <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:6px" id="gry-progress-label">${progressLabel}</div>
                      <div style="height:8px; background:var(--color-bg-secondary); border-radius:99px; overflow:hidden">
                        <div id="gry-progress-bar" style="height:100%; width:${progress}%; background:var(--color-primary); border-radius:99px; transition:width .2s"></div>
                      </div>
                    </div>
                  ` : done ? `
                    <button class="btn btn-primary btn-lg" id="gry-download" style="width:100%">
                      ${icon('download', 18)} Download Grayscale PDF
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="gry-go" style="width:100%">
                      ${icon('image', 18)} Convert to Grayscale
                    </button>
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="gry-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite">
              ${done ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                  <h3 class="worksite-empty__title">Grayscale done!</h3>
                  <p class="worksite-empty__subtitle">${pageCount} page${pageCount === 1 ? '' : 's'} converted to black & white.</p>
                  <button class="btn btn-primary" id="gry-download2">${icon('download', 16)} Download Grayscale PDF</button>
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('image', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Click "Convert to Grayscale" to begin' : 'Upload a PDF to make it black & white'}</h3>
                  <p class="worksite-empty__subtitle">
                    Every page is re-rendered in grayscale at high quality. Note: pages become images,
                    so text will no longer be selectable — run OCR afterwards if you need that.
                  </p>
                  ${!file ? `<label class="btn btn-secondary btn-sm" for="gry-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>` : ''}
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#gry-input');
    const drop = container.querySelector('#gry-drop');
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
    container.querySelector('#gry-go')?.addEventListener('click', convert);
    container.querySelector('#gry-download')?.addEventListener('click', download);
    container.querySelector('#gry-download2')?.addEventListener('click', download);
  }

  render();
}
