/**
 * PDF to Text Tool — extract the embedded text layer from a PDF into a .txt file.
 * Uses PDF.js getTextContent (instant, no OCR). For scanned/image PDFs, use the OCR tool instead.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';

export function renderPdfToText(container) {
  let file = null;
  let pdfDoc = null;
  let pageCount = 0;
  let extractedText = '';
  let extracting = false;
  let progress = 0;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    if (!validateFileType(selectedFile, [PDF_MIME])) {
      showError('Please select a valid PDF file.');
      return;
    }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.ok) {
      showError(sizeCheck.message || 'File is too large.');
      return;
    }
    hideError();
    file = selectedFile;
    extractedText = '';
    progress = 0;
    try {
      const buffer = await readFileAsArrayBuffer(file);
      pdfDoc = await loadPDFDocument(buffer);
      pageCount = pdfDoc.numPages;
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      pdfDoc = null;
    }
    render();
  }

  async function extractText() {
    if (!pdfDoc || extracting) return;
    extracting = true;
    extractedText = '';
    progress = 0;
    render();
    try {
      const pageTexts = [];
      for (let p = 1; p <= pageCount; p++) {
        const page = await pdfDoc.getPage(p);
        const tc = await page.getTextContent();
        // Group items into lines by Y position for readable output
        const lines = [];
        let curLine = [];
        let lastY = null;
        for (const item of tc.items) {
          const y = item.transform ? Math.round(item.transform[5]) : 0;
          if (lastY !== null && Math.abs(y - lastY) > 2 && curLine.length) {
            lines.push(curLine.join(' '));
            curLine = [];
          }
          if (item.str) curLine.push(item.str);
          lastY = y;
        }
        if (curLine.length) lines.push(curLine.join(' '));
        pageTexts.push(lines.join('\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
        progress = Math.round((p / pageCount) * 100);
        const bar = container.querySelector('#p2t-progress-bar');
        const label = container.querySelector('#p2t-progress-label');
        if (bar) bar.style.width = progress + '%';
        if (label) label.textContent = `Extracting page ${p} of ${pageCount}…`;
        // Let the UI breathe on large documents
        if (p % 5 === 0) await new Promise(r => setTimeout(r, 0));
      }
      extractedText = pageTexts
        .map((t, i) => (pageCount > 1 ? `----- Page ${i + 1} -----\n${t}` : t))
        .join('\n\n');
    } catch (err) {
      showError(classifyError(err) || 'Text extraction failed.');
    }
    extracting = false;
    render();
  }

  function downloadText() {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}.txt`);
  }

  function copyText() {
    if (!extractedText) return;
    navigator.clipboard?.writeText(extractedText).then(() => {
      const btn = container.querySelector('#p2t-copy');
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      }
    }).catch(() => showError('Copy failed — select the text manually.'));
  }

  function showError(msg) {
    const el = container.querySelector('#p2t-error');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  }

  function hideError() {
    const el = container.querySelector('#p2t-error');
    if (el) el.style.display = 'none';
  }

  function wordCount(t) {
    const m = t.trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  function render() {
    const hasText = extractedText.length > 0;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">PDF to Text</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Extract selectable text from any PDF into a clean .txt file — instant, no OCR needed
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Actions Panel -->
            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="p2t-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="p2t-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="p2t-input" accept=".pdf,application/pdf" />
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

                  ${extracting ? `
                    <div style="margin-top:var(--space-3)">
                      <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:6px" id="p2t-progress-label">Extracting…</div>
                      <div style="height:8px; background:var(--color-bg-secondary); border-radius:99px; overflow:hidden">
                        <div id="p2t-progress-bar" style="height:100%; width:${progress}%; background:var(--color-primary); border-radius:99px; transition:width .2s"></div>
                      </div>
                    </div>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="p2t-extract" style="width:100%">
                      ${icon('fileText', 18)} Extract Text
                    </button>
                  `}

                  ${hasText ? `
                    <div style="display:flex; gap:var(--space-2)">
                      <button class="btn btn-secondary" id="p2t-download" style="flex:1">
                        ${icon('download', 16)} Download .txt
                      </button>
                      <button class="btn btn-ghost" id="p2t-copy" style="flex:1">
                        Copy Text
                      </button>
                    </div>
                    <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); text-align:center">
                      ${wordCount(extractedText).toLocaleString()} words · ${extractedText.length.toLocaleString()} characters
                    </div>
                  ` : ''}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="p2t-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <!-- RIGHT SIDE: Preview -->
            <main class="tool-worksite" id="p2t-worksite">
              ${hasText ? `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-3)">
                  <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:0">Extracted Text</h3>
                  <span style="font-size:var(--text-xs); color:var(--color-text-tertiary)">${pageCount} page${pageCount === 1 ? '' : 's'}</span>
                </div>
                <textarea readonly style="width:100%; min-height:480px; font-size:var(--text-sm); line-height:1.6; font-family:ui-monospace, monospace; padding:var(--space-4); border:1px solid var(--color-border); border-radius:var(--radius-lg); background:var(--color-bg); color:var(--color-text-primary); resize:vertical">${extractedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('fileText', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Click "Extract Text" to begin' : 'Upload a PDF to extract its text'}</h3>
                  <p class="worksite-empty__subtitle">
                    Pulls the selectable text layer straight out of your PDF — perfect for reports, ebooks, and articles.
                    For scanned or photographed PDFs with no text layer, use the OCR tool instead.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="p2t-input" style="cursor:pointer">
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
    const input = container.querySelector('#p2t-input');
    const drop = container.querySelector('#p2t-drop');
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
    container.querySelector('#p2t-extract')?.addEventListener('click', extractText);
    container.querySelector('#p2t-download')?.addEventListener('click', downloadText);
    container.querySelector('#p2t-copy')?.addEventListener('click', copyText);
  }

  render();
}
