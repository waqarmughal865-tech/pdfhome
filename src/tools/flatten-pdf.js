/**
 * Flatten PDF — bake form fields, checkboxes and annotations into static
 * page content so the PDF can no longer be edited. All client-side.
 */

import { PDFDocument } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { classifyError } from '../utils/error-handler.js';

export function renderFlattenPdf(container) {
  let file = null;
  let fileBytes = null;
  let fieldCount = 0;
  let flattening = false;
  let flattenedBytes = null;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    if (!validateFileType(selectedFile, [PDF_MIME])) { showError('Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.ok) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    flattenedBytes = null;
    fieldCount = 0;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
      const probe = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      fieldCount = probe.getForm().getFields().length;
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function flatten() {
    if (!fileBytes || flattening) return;
    flattening = true;
    flattenedBytes = null;
    render();
    try {
      const pdfDoc = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      if (form.getFields().length) form.flatten();
      flattenedBytes = await pdfDoc.save();
    } catch (err) {
      showError(classifyError(err) || 'Flatten failed.');
    }
    flattening = false;
    render();
  }

  function download() {
    if (!flattenedBytes) return;
    const blob = new Blob([flattenedBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-flattened.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#flt-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#flt-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const done = !!flattenedBytes;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Flatten PDF</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Lock form fields and annotations into permanent pages — 100% private
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="flt-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="flt-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="flt-input" accept=".pdf,application/pdf" />
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
                      ${formatFileSize(file.size)} · ${fieldCount ? fieldCount + ' form field' + (fieldCount === 1 ? '' : 's') : 'No form fields'}
                    </div>
                  </div>

                  ${flattening ? `
                    <div style="font-size:var(--text-xs); color:var(--color-text-secondary); text-align:center">Flattening…</div>
                  ` : done ? `
                    <button class="btn btn-primary btn-lg" id="flt-download" style="width:100%">
                      ${icon('download', 18)} Download Flattened PDF
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="flt-go" style="width:100%">
                      ${icon('layers', 18)} Flatten PDF
                    </button>
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="flt-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite">
              ${done ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                  <h3 class="worksite-empty__title">PDF flattened!</h3>
                  <p class="worksite-empty__subtitle">${fieldCount ? fieldCount + ' field' + (fieldCount === 1 ? '' : 's') + ' baked into the pages — nothing is editable anymore.' : 'No form fields were found; the PDF was re-saved as-is.'}</p>
                  <button class="btn btn-primary" id="flt-download2">${icon('download', 16)} Download Flattened PDF</button>
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('layers', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Click "Flatten PDF" to begin' : 'Upload a PDF form to flatten it'}</h3>
                  <p class="worksite-empty__subtitle">
                    Fillable fields, ticked checkboxes and annotations become permanent page content —
                    perfect before sharing a completed form. This cannot be undone, so keep the original too.
                  </p>
                  ${!file ? `<label class="btn btn-secondary btn-sm" for="flt-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>` : ''}
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#flt-input');
    const drop = container.querySelector('#flt-drop');
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
    container.querySelector('#flt-go')?.addEventListener('click', flatten);
    container.querySelector('#flt-download')?.addEventListener('click', download);
    container.querySelector('#flt-download2')?.addEventListener('click', download);
  }

  render();
}
