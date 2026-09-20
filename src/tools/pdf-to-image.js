/**
 * PDF to Image Tool — convert PDF pages to JPG or PNG.
 * Supports individual click, Shift+Click range, and manual range input box.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob, downloadMultipleBlobs } from '../utils/download.js';
import { loadPDFDocument, renderPageToBlob, generateThumbnail } from '../pdf/renderer.js';
import { parsePageRanges } from '../utils/page-range-parser.js';
import { classifyError } from '../utils/error-handler.js';

export function renderPdfToImage(container) {
  let file = null;
  let pdfDoc = null;
  let pageCount = 0;
  let selectedPages = new Set();
  let lastClickedPage = null;
  let format = 'image/jpeg';
  let quality = 0.92;

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">PDF to Image</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Extract high-resolution JPG or PNG images from individual pages or entire documents
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Options Panel -->
            <aside class="tool-sidebar">
              <!-- Compact Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="p2i-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="p2i-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="p2i-input" accept=".pdf,application/pdf" />
              </div>

              ${file ? `
                <!-- Options & Conversion Card -->
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

                  <div style="border-top:1px solid var(--color-border); padding-top:var(--space-3)">
                    <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:var(--space-2)">
                      Output Format:
                    </label>
                    <div class="tabs" style="display:flex; width:100%">
                      <button class="tab ${format === 'image/jpeg' ? 'tab--active' : ''}" id="p2i-jpg" style="flex:1; text-align:center">JPG</button>
                      <button class="tab ${format === 'image/png' ? 'tab--active' : ''}" id="p2i-png" style="flex:1; text-align:center">PNG</button>
                    </div>
                  </div>

                  <div id="p2i-quality-wrap" class="slider-group" style="${format === 'image/jpeg' ? '' : 'display:none'}">
                    <div style="display:flex; justify-content:space-between; font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:var(--space-1)">
                      <label>Image Quality:</label>
                      <span id="p2i-quality-val">${Math.round(quality * 100)}%</span>
                    </div>
                    <input type="range" class="slider" id="p2i-quality" min="0.1" max="1" step="0.05" value="${quality}" style="width:100%" />
                  </div>

                  <div style="border-top:1px solid var(--color-border); padding-top:var(--space-3)">
                    <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:var(--space-1)">
                      Page Range (e.g. 1-3, 5):
                    </label>
                    <input class="input" id="p2i-range-input" type="text" placeholder="leave empty for all" style="width:100%" />
                    <span id="p2i-pages-info" style="display:block; font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:4px">
                      Pages: 1–${pageCount} (${selectedPages.size} selected)
                    </span>
                  </div>

                  <button class="btn btn-primary btn-lg" id="p2i-convert" style="width:100%">
                    ${icon('image', 18)} <span id="p2i-btn-text">Convert ${selectedPages.size === 0 ? `All ${pageCount}` : `${selectedPages.size}`} Pages</span>
                  </button>

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="p2i-progress" style="display:none"></div>
              <div id="p2i-error" style="display:none"></div>
            </aside>

            <!-- RIGHT SIDE: Work Site -->
            <main class="tool-worksite" id="p2i-worksite">
              ${!file ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('image', 32)}</div>
                  <h3 class="worksite-empty__title">Your Workspace is Ready</h3>
                  <p class="worksite-empty__subtitle">
                    Upload your PDF document using the panel on the left.
                    All pages will appear here in high-resolution interactive previews where you can select specific pages or convert the whole document to images.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="p2i-input" style="cursor:pointer">
                    ${icon('upload', 14)} Choose PDF to Begin
                  </label>
                </div>
              ` : `
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2); border-bottom:1px solid var(--color-border); padding-bottom:var(--space-3)">
                  <div>
                    <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:0">
                      Select Pages to Convert
                    </h2>
                    <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:2px 0 0">
                      Click thumbnails or hold Shift to select ranges. Deselect all to convert every page.
                    </p>
                  </div>
                  <div style="display:flex; gap:var(--space-2)">
                    <button class="btn btn-secondary btn-sm" id="p2i-select-all">Select All</button>
                    <button class="btn btn-ghost btn-sm" id="p2i-clear-sel">Deselect All</button>
                  </div>
                </div>

                <div class="thumbnails" id="p2i-thumbnails" style="margin-top:var(--space-2)"></div>

                <div id="p2i-result" style="display:none; margin-top:var(--space-4)"></div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;
    setupListeners();
    if (pdfDoc) renderThumbnails();
  }

  function formatSelectedToRangeString(pagesSet) {
    if (pagesSet.size === 0) return '';
    const sorted = Array.from(pagesSet).sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let prev = start;

    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      if (cur === prev + 1) {
        prev = cur;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = cur;
        prev = cur;
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(', ');
  }

  function updateButtonAndRangeInput(updateInput = true) {
    const btnText = document.getElementById('p2i-btn-text');
    if (btnText) {
      btnText.textContent = `Convert ${selectedPages.size === 0 ? `All ${pageCount}` : `${selectedPages.size}`} Pages`;
    }

    if (updateInput) {
      const rangeInput = document.getElementById('p2i-range-input');
      if (rangeInput) {
        rangeInput.value = formatSelectedToRangeString(selectedPages);
      }
    }
  }

  function updateThumbnailElement(pageNum) {
    const el = document.querySelector(`#p2i-thumbnails .thumbnail[data-page="${pageNum}"]`);
    if (!el) return;
    const isSelected = selectedPages.has(pageNum);
    el.classList.toggle('thumbnail--selected', isSelected);
    const cb = el.querySelector('.thumbnail__checkbox');
    if (cb) {
      cb.innerHTML = isSelected ? icon('check', 12) : '';
    }
  }

  function setupListeners() {
    const dropZone = document.getElementById('p2i-drop');
    const fileInput = document.getElementById('p2i-input');
    if (dropZone) {
      dropZone.addEventListener('click', (e) => { if (e.target === fileInput || e.target.closest('label')) return; fileInput.click(); });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); handleFile(e.dataTransfer.files[0]); });
    }
    if (fileInput) fileInput.addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });

    // Worksite drop support
    const worksite = document.getElementById('p2i-worksite');
    if (worksite) {
      worksite.addEventListener('dragover', (e) => { e.preventDefault(); worksite.style.borderColor = 'var(--color-accent)'; });
      worksite.addEventListener('dragleave', () => { worksite.style.borderColor = ''; });
      worksite.addEventListener('drop', (e) => {
        e.preventDefault();
        worksite.style.borderColor = '';
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });
    }

    document.getElementById('p2i-change')?.addEventListener('click', () => { file = null; pdfDoc = null; selectedPages.clear(); lastClickedPage = null; render(); });
    
    // Format toggle
    document.getElementById('p2i-jpg')?.addEventListener('click', () => {
      format = 'image/jpeg';
      document.getElementById('p2i-jpg').classList.add('tab--active');
      document.getElementById('p2i-png').classList.remove('tab--active');
      const qw = document.getElementById('p2i-quality-wrap');
      if (qw) qw.style.display = '';
    });

    document.getElementById('p2i-png')?.addEventListener('click', () => {
      format = 'image/png';
      document.getElementById('p2i-png').classList.add('tab--active');
      document.getElementById('p2i-jpg').classList.remove('tab--active');
      const qw = document.getElementById('p2i-quality-wrap');
      if (qw) qw.style.display = 'none';
    });

    const qualitySlider = document.getElementById('p2i-quality');
    if (qualitySlider) {
      qualitySlider.addEventListener('input', (e) => {
        quality = parseFloat(e.target.value);
        const valSpan = document.getElementById('p2i-quality-val');
        if (valSpan) valSpan.textContent = `${Math.round(quality * 100)}%`;
      });
    }

    // Range input change
    const rangeInput = document.getElementById('p2i-range-input');
    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
          selectedPages.clear();
          for (let p = 1; p <= pageCount; p++) updateThumbnailElement(p);
          updateButtonAndRangeInput(false);
          return;
        }

        const { pages, error } = parsePageRanges(val, pageCount);
        if (!error && pages.length > 0) {
          selectedPages = new Set(pages);
          for (let p = 1; p <= pageCount; p++) updateThumbnailElement(p);
          updateButtonAndRangeInput(false);
        }
      });
    }

    // Select all / Deselect all
    document.getElementById('p2i-select-all')?.addEventListener('click', () => {
      for (let i = 1; i <= pageCount; i++) selectedPages.add(i);
      for (let i = 1; i <= pageCount; i++) updateThumbnailElement(i);
      updateButtonAndRangeInput(true);
    });

    document.getElementById('p2i-clear-sel')?.addEventListener('click', () => {
      selectedPages.clear();
      for (let i = 1; i <= pageCount; i++) updateThumbnailElement(i);
      updateButtonAndRangeInput(true);
    });

    document.getElementById('p2i-convert')?.addEventListener('click', doConvert);
  }

  async function handleFile(f) {
    if (!f) return;
    if (!validateFileType(f, [PDF_MIME])) { showError('Invalid File', 'Please select a PDF.'); return; }
    const sc = checkFileSize(f);
    if (!sc.ok) { showError('File Too Large', sc.message); return; }

    file = f;
    try {
      const buffer = await readFileAsArrayBuffer(file);
      pdfDoc = await loadPDFDocument(buffer);
      pageCount = pdfDoc.numPages;
      selectedPages.clear();
      lastClickedPage = null;
      render();
    } catch (err) {
      file = null;
      render();
      showError(classifyError(err).title, classifyError(err).message);
    }
  }

  async function renderThumbnails() {
    const grid = document.getElementById('p2i-thumbnails');
    if (!grid || !pdfDoc) return;
    grid.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
      const div = document.createElement('div');
      div.className = `thumbnail ${selectedPages.has(i) ? 'thumbnail--selected' : ''}`;
      div.dataset.page = i;
      div.innerHTML = `
        <span class="thumbnail__page-num">${i}</span>
        <span class="thumbnail__checkbox">${selectedPages.has(i) ? icon('check', 12) : ''}</span>
      `;

      // Non-destructive click + Shift+Click range
      div.addEventListener('click', (e) => {
        if (e.shiftKey && lastClickedPage !== null) {
          const start = Math.min(lastClickedPage, i);
          const end = Math.max(lastClickedPage, i);
          const shouldSelect = !selectedPages.has(i);
          for (let p = start; p <= end; p++) {
            if (shouldSelect) selectedPages.add(p);
            else selectedPages.delete(p);
            updateThumbnailElement(p);
          }
        } else {
          if (selectedPages.has(i)) selectedPages.delete(i);
          else selectedPages.add(i);
          updateThumbnailElement(i);
        }

        lastClickedPage = i;
        updateButtonAndRangeInput(true);
      });

      grid.appendChild(div);

      generateThumbnail(pdfDoc, i).then(canvas => {
        div.insertBefore(canvas, div.firstChild);
      }).catch(() => {});
    }
  }

  async function doConvert() {
    const progressEl = document.getElementById('p2i-progress');
    const resultEl = document.getElementById('p2i-result');
    const btn = document.getElementById('p2i-convert');
    btn.disabled = true;
    progressEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
      const pagesToConvert = selectedPages.size > 0
        ? Array.from(selectedPages).sort((a, b) => a - b)
        : Array.from({ length: pageCount }, (_, i) => i + 1);

      const ext = format === 'image/png' ? 'png' : 'jpg';
      const baseName = getBasename(sanitizeFilename(file.name));
      const blobs = [];
      const defaultFilenames = [];

      progressEl.innerHTML = `
        <div class="progress">
          <p class="progress__label">Converting to ${ext.toUpperCase()}...</p>
          <div class="progress__bar-track"><div class="progress__bar-fill" id="p2i-bar" style="width:0%"></div></div>
          <p class="progress__detail" id="p2i-detail">Preparing...</p>
          <p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p>
        </div>
      `;

      for (let idx = 0; idx < pagesToConvert.length; idx++) {
        const pageNum = pagesToConvert[idx];
        const blob = await renderPageToBlob(pdfDoc, pageNum, format, quality, 2);
        blobs.push(blob);
        defaultFilenames.push(`${baseName}_page_${pageNum}.${ext}`);

        const pct = Math.round(((idx + 1) / pagesToConvert.length) * 100);
        const bar = document.getElementById('p2i-bar');
        const detail = document.getElementById('p2i-detail');
        if (bar) bar.style.width = `${pct}%`;
        if (detail) detail.textContent = `Page ${idx + 1} of ${pagesToConvert.length}`;
      }

      progressEl.style.display = 'none';
      resultEl.style.display = 'block';

      const isSingle = blobs.length === 1;
      const initialName = isSingle ? defaultFilenames[0] : `${baseName}_images`;

      resultEl.innerHTML = `
        <div class="result-card">
          <div class="result-card__icon">${icon('checkCircle', 28)}</div>
          <h3 class="result-card__title">Conversion Complete!</h3>
          <p class="result-card__meta">${blobs.length} ${ext.toUpperCase()} image${blobs.length > 1 ? 's' : ''} · ${formatFileSize(blobs.reduce((s, b) => s + b.size, 0))} total</p>
          
          <div style="margin: var(--space-4) 0; max-width: 420px; margin-left: auto; margin-right: auto; text-align: left;">
            <label style="display:block; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
              ${isSingle ? 'Image Filename:' : 'Filename Prefix:'}
            </label>
            <div style="display:flex; align-items:center; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:0 var(--space-3)">
              <span style="color:var(--color-text-tertiary); margin-right:var(--space-2)">${icon('edit', 14)}</span>
              <input type="text" id="p2i-filename-input" class="input" value="${initialName.replace(new RegExp(`\\.${ext}$`, 'i'), '')}" style="border:none; padding:var(--space-2) 0; flex:1" />
              <span style="color:var(--color-text-tertiary); font-size:var(--text-sm)">.${ext}</span>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="p2i-download">
            ${icon('download', 18)} Download ${blobs.length > 1 ? 'All Images' : 'Image'}
          </button>
        </div>
      `;

      document.getElementById('p2i-download').addEventListener('click', () => {
        const inputName = document.getElementById('p2i-filename-input')?.value.trim();
        let finalFilenames = defaultFilenames;

        if (inputName) {
          const cleanName = sanitizeFilename(inputName);
          if (isSingle) {
            finalFilenames = [`${cleanName}.${ext}`];
          } else {
            finalFilenames = pagesToConvert.map(p => `${cleanName}_page_${p}.${ext}`);
          }
        }

        downloadMultipleBlobs(blobs, finalFilenames);
      });
    } catch (err) {
      progressEl.style.display = 'none';
      showError(classifyError(err).title, classifyError(err).message);
      btn.disabled = false;
    }
  }

  function showError(title, message) {
    const el = document.getElementById('p2i-error');
    if (el) {
      el.style.display = 'block';
      el.innerHTML = `<div class="error-display"><span class="error-display__icon">${icon('alertCircle', 20)}</span><div class="error-display__content"><p class="error-display__title">${title}</p><p class="error-display__message">${message}</p></div><button class="error-display__dismiss" onclick="this.closest('.error-display').parentElement.style.display='none'">${icon('x', 16)}</button></div>`;
    }
  }

  render();
}
