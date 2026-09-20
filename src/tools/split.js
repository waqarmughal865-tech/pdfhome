/**
 * Split PDF Tool — split all pages, extract by range, or selected pages.
 * Supports Shift+Click range selection, flicker-free selection, and output renaming.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer, downloadMultipleBlobs } from '../utils/download.js';
import { extractPages, splitAllPages } from '../pdf/engine.js';
import { loadPDFDocument, generateThumbnail } from '../pdf/renderer.js';
import { parsePageRanges } from '../utils/page-range-parser.js';
import { classifyError } from '../utils/error-handler.js';

export function renderSplit(container) {
  let file = null;
  let pdfDoc = null;
  let pdfBuffer = null;
  let pageCount = 0;
  let selectedPages = new Set();
  let lastClickedPage = null;
  let splitMode = 'all'; // 'all' | 'range' | 'selected'

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">Split PDF</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Split all pages, extract custom ranges, or select individual pages visually
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Split Controls Panel -->
            <aside class="tool-sidebar">
              <!-- Compact Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="split-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="split-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="split-input" accept=".pdf,application/pdf" />
              </div>

              ${file ? `
                <!-- File Info & Split Mode Card -->
                <div class="tool-sidebar__card">
                  <div>
                    <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                      Active Document
                    </span>
                    <div style="font-weight:var(--weight-medium); font-size:var(--text-sm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:4px">
                      ${sanitizeFilename(file.name)}
                    </div>
                    <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
                      ${formatFileSize(file.size)} · <strong>${pageCount}</strong> pages
                    </div>
                  </div>

                  <div style="border-top:1px solid var(--color-border); padding-top:var(--space-3)">
                    <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:var(--space-2)">
                      Split Mode:
                    </label>
                    <div class="tabs" id="split-mode-tabs" style="display:flex; width:100%">
                      <button class="tab ${splitMode === 'all' ? 'tab--active' : ''}" data-mode="all" style="flex:1; text-align:center; padding:6px 4px; font-size:var(--text-xs)">All</button>
                      <button class="tab ${splitMode === 'range' ? 'tab--active' : ''}" data-mode="range" style="flex:1; text-align:center; padding:6px 4px; font-size:var(--text-xs)">Range</button>
                      <button class="tab ${splitMode === 'selected' ? 'tab--active' : ''}" data-mode="selected" style="flex:1; text-align:center; padding:6px 4px; font-size:var(--text-xs)">Select</button>
                    </div>
                  </div>

                  <div id="split-range-controls" style="${splitMode === 'range' ? '' : 'display:none'}">
                    <label style="display:block; font-size:var(--text-xs); color:var(--color-text-tertiary); margin-bottom:var(--space-1)">
                      Page Ranges (e.g. 1-3, 5):
                    </label>
                    <input class="input" id="split-range-input" type="text" placeholder="e.g. 1-3, 5, 8-10" style="width:100%" />
                    <span style="display:block; font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:4px">
                      Valid pages: 1–${pageCount}
                    </span>
                  </div>

                  <div id="split-selected-controls" style="${splitMode === 'selected' ? '' : 'display:none'}">
                    <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:var(--space-2)">
                      <strong id="split-sel-count">${selectedPages.size}</strong> of ${pageCount} pages selected
                    </div>
                    <div style="display:flex; gap:var(--space-2)">
                      <button class="btn btn-secondary btn-sm" id="split-select-all" style="flex:1; font-size:var(--text-xs)">Select All</button>
                      <button class="btn btn-ghost btn-sm" id="split-clear-all" style="flex:1; font-size:var(--text-xs)">Clear</button>
                    </div>
                  </div>

                  <button class="btn btn-primary btn-lg" id="split-btn" style="width:100%">
                    ${icon('scissors', 18)} <span id="split-btn-text">${getButtonText()}</span>
                  </button>

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="split-progress" style="display:none"></div>
              <div id="split-error" style="display:none"></div>
            </aside>

            <!-- RIGHT SIDE: Work Site -->
            <main class="tool-worksite" id="split-worksite">
              ${!file ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('scissors', 32)}</div>
                  <h3 class="worksite-empty__title">Your Workspace is Ready</h3>
                  <p class="worksite-empty__subtitle">
                    Upload your PDF document using the panel on the left.
                    All pages will appear here in high-resolution interactive thumbnails where you can click or Shift+click to select, extract, or split.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="split-input" style="cursor:pointer">
                    ${icon('upload', 14)} Choose PDF to Begin
                  </label>
                </div>
              ` : `
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2); border-bottom:1px solid var(--color-border); padding-bottom:var(--space-3)">
                  <div>
                    <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:0">
                      Document Pages Overview
                    </h2>
                    <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:2px 0 0">
                      Click thumbnails to select. Hold <kbd style="background:var(--color-bg-tertiary);padding:2px 4px;border-radius:4px;border:1px solid var(--color-border)">Shift</kbd> to select page ranges.
                    </p>
                  </div>
                  <span style="font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-accent); background:var(--color-accent-subtle); padding:4px 8px; border-radius:var(--radius-sm)">
                    ${pageCount} Pages Total
                  </span>
                </div>

                <div class="thumbnails" id="split-thumbnails" style="margin-top:var(--space-2)"></div>

                <div id="split-result" style="display:none; margin-top:var(--space-4)"></div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;
    setupListeners();
    if (pdfDoc) renderThumbnails();
  }

  function getButtonText() {
    if (splitMode === 'all') return `Split All ${pageCount} Pages`;
    if (splitMode === 'range') return 'Extract Range';
    return `Extract ${selectedPages.size} Pages`;
  }

  function updateButtonAndCounters() {
    const btnText = document.getElementById('split-btn-text');
    if (btnText) btnText.textContent = getButtonText();
    const selCount = document.getElementById('split-sel-count');
    if (selCount) selCount.textContent = selectedPages.size;
  }

  function updateThumbnailElement(pageNum) {
    const el = document.querySelector(`.thumbnail[data-page="${pageNum}"]`);
    if (!el) return;
    const isSelected = selectedPages.has(pageNum);
    el.classList.toggle('thumbnail--selected', isSelected);
    const cb = el.querySelector('.thumbnail__checkbox');
    if (cb) {
      cb.innerHTML = isSelected ? icon('check', 12) : '';
    }
  }

  function setupListeners() {
    // Drop zone
    const dropZone = document.getElementById('split-drop');
    const fileInput = document.getElementById('split-input');
    if (dropZone) {
      dropZone.addEventListener('click', (e) => {
        if (e.target === fileInput || e.target.closest('label')) return;
        fileInput.click();
      });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); handleFile(e.dataTransfer.files[0]); });
    }
    if (fileInput) {
      fileInput.addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
    }

    // Worksite drop support
    const worksite = document.getElementById('split-worksite');
    if (worksite) {
      worksite.addEventListener('dragover', (e) => { e.preventDefault(); worksite.style.borderColor = 'var(--color-accent)'; });
      worksite.addEventListener('dragleave', () => { worksite.style.borderColor = ''; });
      worksite.addEventListener('drop', (e) => {
        e.preventDefault();
        worksite.style.borderColor = '';
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });
    }

    // Change file
    const changeBtn = document.getElementById('split-change');
    if (changeBtn) {
      changeBtn.addEventListener('click', () => {
        file = null; pdfDoc = null; pdfBuffer = null; selectedPages.clear(); lastClickedPage = null;
        render();
      });
    }

    // Mode tabs (no full re-render, preserves thumbnail DOM!)
    document.querySelectorAll('#split-mode-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        splitMode = tab.dataset.mode;
        document.querySelectorAll('#split-mode-tabs .tab').forEach(t => t.classList.remove('tab--active'));
        tab.classList.add('tab--active');

        const rangeCtrl = document.getElementById('split-range-controls');
        const selCtrl = document.getElementById('split-selected-controls');
        if (rangeCtrl) rangeCtrl.style.display = splitMode === 'range' ? '' : 'none';
        if (selCtrl) selCtrl.style.display = splitMode === 'selected' ? '' : 'none';

        // Update thumbnail checkboxes display
        document.querySelectorAll('.thumbnail__checkbox').forEach(cb => {
          cb.style.display = splitMode === 'selected' ? 'flex' : 'none';
        });

        updateButtonAndCounters();
      });
    });

    // Select All / Deselect All
    document.getElementById('split-select-all')?.addEventListener('click', () => {
      for (let i = 1; i <= pageCount; i++) selectedPages.add(i);
      for (let i = 1; i <= pageCount; i++) updateThumbnailElement(i);
      updateButtonAndCounters();
    });

    document.getElementById('split-clear-all')?.addEventListener('click', () => {
      selectedPages.clear();
      for (let i = 1; i <= pageCount; i++) updateThumbnailElement(i);
      updateButtonAndCounters();
    });

    // Split button
    const splitBtn = document.getElementById('split-btn');
    if (splitBtn) splitBtn.addEventListener('click', doSplit);
  }

  async function handleFile(f) {
    if (!f) return;
    if (!validateFileType(f, [PDF_MIME])) {
      showError('Invalid File', `"${sanitizeFilename(f.name)}" is not a PDF file.`);
      return;
    }
    const sizeCheck = checkFileSize(f);
    if (!sizeCheck.ok) { showError('File Too Large', sizeCheck.message); return; }

    file = f;
    try {
      pdfBuffer = await readFileAsArrayBuffer(file);
      pdfDoc = await loadPDFDocument(pdfBuffer);
      pageCount = pdfDoc.numPages;
      selectedPages.clear();
      lastClickedPage = null;
      render();
    } catch (err) {
      const { title, message } = classifyError(err);
      file = null;
      render();
      showError(title, message);
    }
  }

  async function renderThumbnails() {
    const grid = document.getElementById('split-thumbnails');
    if (!grid || !pdfDoc) return;
    grid.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
      const div = document.createElement('div');
      div.className = `thumbnail ${selectedPages.has(i) ? 'thumbnail--selected' : ''}`;
      div.dataset.page = i;
      div.innerHTML = `
        <span class="thumbnail__page-num">${i}</span>
        <span class="thumbnail__checkbox" style="display:${splitMode === 'selected' ? 'flex' : 'none'}">
          ${selectedPages.has(i) ? icon('check', 12) : ''}
        </span>
      `;

      // Non-destructive selection with Shift+Click range support!
      div.addEventListener('click', (e) => {
        if (splitMode !== 'selected') return;

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
          if (selectedPages.has(i)) {
            selectedPages.delete(i);
          } else {
            selectedPages.add(i);
          }
          updateThumbnailElement(i);
        }

        lastClickedPage = i;
        updateButtonAndCounters();
      });

      grid.appendChild(div);

      // Render thumbnail canvas asynchronously
      generateThumbnail(pdfDoc, i).then(canvas => {
        div.insertBefore(canvas, div.firstChild);
      }).catch(() => {});
    }
  }

  async function doSplit() {
    const progressEl = document.getElementById('split-progress');
    const resultEl = document.getElementById('split-result');
    const splitBtn = document.getElementById('split-btn');
    splitBtn.disabled = true;
    progressEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
      if (!pdfBuffer || pdfBuffer.byteLength === 0) {
        if (file) pdfBuffer = await readFileAsArrayBuffer(file);
      }
      let results;
      let defaultFilenames;
      const baseName = getBasename(sanitizeFilename(file.name));

      if (splitMode === 'all') {
        progressEl.innerHTML = `
          <div class="progress">
            <p class="progress__label">Splitting PDF...</p>
            <div class="progress__bar-track"><div class="progress__bar-fill" id="split-bar" style="width:0%"></div></div>
            <p class="progress__detail" id="split-detail">Preparing...</p>
            <p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p>
          </div>
        `;
        results = await splitAllPages(pdfBuffer, (cur, tot) => {
          const bar = document.getElementById('split-bar');
          const detail = document.getElementById('split-detail');
          if (bar) bar.style.width = `${Math.round((cur / tot) * 100)}%`;
          if (detail) detail.textContent = `Page ${cur} of ${tot}`;
        });
        defaultFilenames = results.map((_, i) => `${baseName}_page_${i + 1}.pdf`);
      } else if (splitMode === 'range') {
        const rangeInput = document.getElementById('split-range-input');
        const { pages, error } = parsePageRanges(rangeInput?.value || '', pageCount);
        if (error) { showError('Invalid Range', error); splitBtn.disabled = false; progressEl.style.display = 'none'; return; }
        if (pages.length === 0) { showError('No Pages', 'Please enter a page range.'); splitBtn.disabled = false; progressEl.style.display = 'none'; return; }

        progressEl.innerHTML = `<div class="progress"><p class="progress__label">Extracting pages...</p><div class="progress__bar-track"><div class="progress__bar-fill progress__bar-fill--indeterminate"></div></div><p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p></div>`;
        const result = await extractPages(pdfBuffer, pages);
        results = [result];
        defaultFilenames = [`${baseName}_pages_${pages.join('-')}.pdf`];
      } else {
        // Selected pages
        if (selectedPages.size === 0) { showError('No Pages', 'Please select at least one page.'); splitBtn.disabled = false; progressEl.style.display = 'none'; return; }
        const pages = Array.from(selectedPages).sort((a, b) => a - b);

        progressEl.innerHTML = `<div class="progress"><p class="progress__label">Extracting pages...</p><div class="progress__bar-track"><div class="progress__bar-fill progress__bar-fill--indeterminate"></div></div><p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p></div>`;
        const result = await extractPages(pdfBuffer, pages);
        results = [result];
        defaultFilenames = [`${baseName}_split.pdf`];
      }

      progressEl.style.display = 'none';
      resultEl.style.display = 'block';

      const isSingle = results.length === 1;
      const initialName = isSingle ? defaultFilenames[0] : `${baseName}_split_pages`;

      resultEl.innerHTML = `
        <div class="result-card">
          <div class="result-card__icon">${icon('checkCircle', 28)}</div>
          <h3 class="result-card__title">Split Complete!</h3>
          <p class="result-card__meta">${results.length} file${results.length > 1 ? 's' : ''} generated</p>
          
          <div style="margin: var(--space-4) 0; max-width: 420px; margin-left: auto; margin-right: auto; text-align: left;">
            <label style="display:block; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
              ${isSingle ? 'Output Filename:' : 'Filename Prefix:'}
            </label>
            <div style="display:flex; align-items:center; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:0 var(--space-3)">
              <span style="color:var(--color-text-tertiary); margin-right:var(--space-2)">${icon('edit', 14)}</span>
              <input type="text" id="split-filename-input" class="input" value="${initialName.replace(/\.pdf$/i, '')}" style="border:none; padding:var(--space-2) 0; flex:1" />
              ${isSingle ? '<span style="color:var(--color-text-tertiary); font-size:var(--text-sm)">.pdf</span>' : ''}
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="split-download">
            ${icon('download', 18)} Download ${results.length > 1 ? 'All Files' : 'PDF'}
          </button>
        </div>
      `;

      document.getElementById('split-download').addEventListener('click', () => {
        const inputName = document.getElementById('split-filename-input')?.value.trim();
        let finalFilenames = defaultFilenames;

        if (inputName) {
          const cleanName = sanitizeFilename(inputName);
          if (isSingle) {
            finalFilenames = [`${cleanName}.pdf`];
          } else {
            finalFilenames = results.map((_, i) => `${cleanName}_page_${i + 1}.pdf`);
          }
        }

        const blobs = results.map(r => new Blob([r], { type: 'application/pdf' }));
        downloadMultipleBlobs(blobs, finalFilenames);
      });
    } catch (err) {
      progressEl.style.display = 'none';
      const { title, message } = classifyError(err);
      showError(title, message);
      splitBtn.disabled = false;
    }
  }

  function showError(title, message) {
    const el = document.getElementById('split-error');
    if (el) {
      el.style.display = 'block';
      el.innerHTML = `<div class="error-display"><span class="error-display__icon">${icon('alertCircle', 20)}</span><div class="error-display__content"><p class="error-display__title">${title}</p><p class="error-display__message">${message}</p></div><button class="error-display__dismiss" onclick="this.closest('.error-display').parentElement.style.display='none'">${icon('x', 16)}</button></div>`;
    }
  }

  render();
}
