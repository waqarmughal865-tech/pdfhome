/**
 * Edit PDF Text — find & replace text inside a PDF, in the browser.
 * Locates each match with PDF.js, covers it with a white patch,
 * and draws the replacement text at the same position with pdf-lib.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';

export function renderEditPdfText(container) {
  let file = null;
  let fileBytes = null;
  let editing = false;
  let progress = 0;
  let progressLabel = '';
  let editedBytes = null;
  let replaceCount = 0;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    if (!validateFileType(selectedFile, [PDF_MIME])) { showError('Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.ok) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    editedBytes = null;
    replaceCount = 0;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function editText() {
    if (!fileBytes || editing) return;
    const find = container.querySelector('#edt-find').value;
    const replace = container.querySelector('#edt-replace').value;
    if (!find) { showError('Enter the text you want to find.'); return; }
    hideError();
    editing = true;
    editedBytes = null;
    replaceCount = 0;
    progress = 0;
    progressLabel = 'Finding matches…';
    render();
    try {
      const pdfJsDoc = await loadPDFDocument(fileBytes);
      const numPages = pdfJsDoc.numPages;
      const matches = [];
      for (let p = 1; p <= numPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const tc = await page.getTextContent();
        for (const item of tc.items) {
          if (!item.str || !item.str.includes(find)) continue;
          const t = item.transform || [1, 0, 0, 1, 0, 0];
          const fontH = Math.hypot(t[2], t[3]) || 12;
          const strLen = item.str.length || 1;
          const charW = (item.width || fontH * 0.5 * strLen) / strLen;
          let idx = item.str.indexOf(find);
          while (idx !== -1) {
            matches.push({
              pageIndex: p - 1,
              x: t[4] + idx * charW,
              y: t[5],
              width: find.length * charW,
              fontSize: fontH
            });
            idx = item.str.indexOf(find, idx + 1);
          }
        }
        if (typeof page.cleanup === 'function') page.cleanup();
        progress = Math.round((p / numPages) * 60);
        progressLabel = `Scanning page ${p} of ${numPages}…`;
        updateProgress();
        if (p % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }
      await pdfJsDoc.destroy();

      if (!matches.length) {
        showError(`"${find}" was not found in this PDF. Matching is case-sensitive.`);
        editing = false;
        render();
        return;
      }

      progressLabel = 'Replacing text…';
      updateProgress();
      const pdfDoc = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      for (const m of matches) {
        const page = pages[m.pageIndex];
        if (!page) continue;
        page.drawRectangle({
          x: m.x - 1, y: m.y - m.fontSize * 0.3,
          width: m.width + 2, height: m.fontSize * 1.35,
          color: rgb(1, 1, 1), borderWidth: 0
        });
        page.drawText(replace, {
          x: m.x, y: m.y,
          size: m.fontSize, font, color: rgb(0, 0, 0),
          maxWidth: Math.max(m.width * 2, 10)
        });
      }
      progress = 90;
      updateProgress();
      editedBytes = await pdfDoc.save();
      replaceCount = matches.length;
      progress = 100;
    } catch (err) {
      showError(classifyError(err) || 'Edit failed.');
    }
    editing = false;
    render();
  }

  function updateProgress() {
    const bar = container.querySelector('#edt-progress-bar');
    const label = container.querySelector('#edt-progress-label');
    if (bar) bar.style.width = progress + '%';
    if (label) label.textContent = progressLabel;
  }

  function download() {
    if (!editedBytes) return;
    const blob = new Blob([editedBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-edited.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#edt-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#edt-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const done = !!editedBytes;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Edit PDF Text</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Find and replace text directly inside your PDF — 100% private
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="edt-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="edt-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="edt-input" accept=".pdf,application/pdf" />
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
                    <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">${formatFileSize(file.size)}</div>
                  </div>

                  ${editing ? `
                    <div style="margin-top:var(--space-3)">
                      <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:6px" id="edt-progress-label">${progressLabel}</div>
                      <div style="height:8px; background:var(--color-bg-secondary); border-radius:99px; overflow:hidden">
                        <div id="edt-progress-bar" style="height:100%; width:${progress}%; background:var(--color-primary); border-radius:99px; transition:width .2s"></div>
                      </div>
                    </div>
                  ` : `
                    <div>
                      <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:6px" for="edt-find">Find text</label>
                      <input id="edt-find" type="text" placeholder="e.g. Acme Corp"
                        style="width:100%; font-size:var(--text-sm); padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text-primary); margin-bottom:var(--space-2)" />
                      <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:6px" for="edt-replace">Replace with</label>
                      <input id="edt-replace" type="text" placeholder="e.g. Globex Inc"
                        style="width:100%; font-size:var(--text-sm); padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text-primary)" />
                      <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:6px 0 0">Case-sensitive. Replacement keeps the original position and size.</p>
                    </div>
                    ${done ? `
                      <button class="btn btn-primary btn-lg" id="edt-download" style="width:100%">
                        ${icon('download', 18)} Download Edited PDF
                      </button>
                    ` : `
                      <button class="btn btn-primary btn-lg" id="edt-go" style="width:100%">
                        ${icon('edit', 18)} Replace Text
                      </button>
                    `}
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="edt-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite">
              ${done ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                  <h3 class="worksite-empty__title">Text replaced!</h3>
                  <p class="worksite-empty__subtitle">${replaceCount} occurrence${replaceCount === 1 ? '' : 's'} replaced.</p>
                  <button class="btn btn-primary" id="edt-download2">${icon('download', 16)} Download Edited PDF</button>
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('edit', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Enter find & replace text, then click "Replace Text"' : 'Upload a PDF to edit its text'}</h3>
                  <p class="worksite-empty__subtitle">
                    Fix typos, update names or dates — replacements keep the original position and approximate size.
                    For scanned PDFs with no text layer, run OCR first.
                  </p>
                  ${!file ? `<label class="btn btn-secondary btn-sm" for="edt-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>` : ''}
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#edt-input');
    const drop = container.querySelector('#edt-drop');
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
    container.querySelector('#edt-go')?.addEventListener('click', editText);
    container.querySelector('#edt-download')?.addEventListener('click', download);
    container.querySelector('#edt-download2')?.addEventListener('click', download);
  }

  render();
}
