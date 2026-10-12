/**
 * Unlock PDF — remove password protection from a PDF, entirely in the browser.
 * Loads with ignoreEncryption and re-saves without any security handler.
 */

import { PDFDocument } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { classifyError } from '../utils/error-handler.js';

export function renderUnlockPdf(container) {
  let file = null;
  let fileBytes = null;
  let isEncrypted = false;
  let unlocking = false;
  let unlockedBytes = null;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    const typeCheck = validateFileType(selectedFile, [PDF_MIME]);
    if (!typeCheck.valid) { showError(typeCheck.message || 'Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.valid) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    unlockedBytes = null;
    unlocking = false;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
      const probe = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      isEncrypted = probe.isEncrypted === true;
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function unlock() {
    if (!fileBytes || unlocking) return;
    unlocking = true;
    unlockedBytes = null;
    render();
    try {
      const pdfDoc = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const out = await pdfDoc.save();
      unlockedBytes = out;
    } catch (err) {
      showError(classifyError(err) || 'Unlock failed.');
    }
    unlocking = false;
    render();
  }

  function download() {
    if (!unlockedBytes) return;
    const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-unlocked.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#unl-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#unl-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const done = !!unlockedBytes;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Unlock PDF</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Remove password protection from any PDF — no password needed, 100% private
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="unl-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a locked PDF here or click to browse</p>
                <label class="drop-zone__browse" for="unl-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="unl-input" accept=".pdf,application/pdf" />
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
                      ${formatFileSize(file.size)} · ${isEncrypted ? '🔒 Locked' : '🔓 Not locked'}
                    </div>
                  </div>

                  ${unlocking ? `
                    <div style="font-size:var(--text-xs); color:var(--color-text-secondary); text-align:center">Unlocking…</div>
                  ` : done ? `
                    <button class="btn btn-primary btn-lg" id="unl-download" style="width:100%">
                      ${icon('download', 18)} Download Unlocked PDF
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="unl-go" style="width:100%">
                      ${icon('unlock', 18)} Unlock PDF
                    </button>
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="unl-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite" id="unl-worksite">
              ${done ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                  <h3 class="worksite-empty__title">PDF unlocked!</h3>
                  <p class="worksite-empty__subtitle">Your PDF is no longer password-protected. Printing, copying and editing restrictions are gone.</p>
                  <button class="btn btn-primary" id="unl-download2">${icon('download', 16)} Download Unlocked PDF</button>
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('unlock', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? (isEncrypted ? 'Click "Unlock PDF" to begin' : 'This PDF is not locked') : 'Upload a locked PDF to unlock it'}</h3>
                  <p class="worksite-empty__subtitle">
                    ${file && !isEncrypted
                      ? 'This file has no password protection — unlocking is unnecessary.'
                      : 'Strips the password and all restrictions (printing, copying, editing) in seconds. Only unlock PDFs you own or have rights to.'}
                  </p>
                  ${!file ? `<label class="btn btn-secondary btn-sm" for="unl-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>` : ''}
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#unl-input');
    const drop = container.querySelector('#unl-drop');
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
    container.querySelector('#unl-go')?.addEventListener('click', unlock);
    container.querySelector('#unl-download')?.addEventListener('click', download);
    container.querySelector('#unl-download2')?.addEventListener('click', download);
  }

  render();
}
