/**
 * Redact PDF — permanently black out sensitive text (names, numbers, addresses).
 * Finds text via PDF.js (through loadPDFDocument), draws opaque black boxes
 * over every match with pdf-lib. All client-side.
 */

import { PDFDocument, rgb } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';

export function renderRedactPdf(container) {
  let file = null;
  let fileBytes = null;
  let redacting = false;
  let progress = 0;
  let progressLabel = '';
  let redactedBytes = null;
  let matchCount = 0;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    const typeCheck = validateFileType(selectedFile, [PDF_MIME]);
    if (!typeCheck.valid) { showError(typeCheck.message || 'Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.valid) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    redactedBytes = null;
    matchCount = 0;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function redact() {
    if (!fileBytes || redacting) return;
    const terms = container.querySelector('#red-terms').value.split('\n').map(t => t.trim()).filter(Boolean);
    if (!terms.length) { showError('Please enter at least one word or phrase to redact.'); return; }
    hideError();
    redacting = true;
    redactedBytes = null;
    matchCount = 0;
    progress = 0;
    progressLabel = 'Scanning pages…';
    render();
    try {
      // loadPDFDocument clones the buffer internally, so fileBytes stays intact for pdf-lib
      const pdfJsDoc = await loadPDFDocument(fileBytes);
      const numPages = pdfJsDoc.numPages;
      const matches = [];
      for (let p = 1; p <= numPages; p++) {
        const page = await pdfJsDoc.getPage(p);
        const tc = await page.getTextContent();
        for (const item of tc.items) {
          if (!item.str) continue;
          const t = item.transform || [1, 0, 0, 1, 0, 0];
          const fontH = Math.hypot(t[2], t[3]) || 12;
          const strLen = item.str.length || 1;
          const charW = (item.width || fontH * 0.5 * strLen) / strLen;
          const lower = item.str.toLowerCase();
          for (const term of terms) {
            const tl = term.toLowerCase();
            let idx = lower.indexOf(tl);
            while (idx !== -1) {
              matches.push({
                pageIndex: p - 1,
                x: t[4] + idx * charW - 1,
                y: t[5] - fontH * 0.25,
                width: tl.length * charW + 2,
                height: fontH * 1.25
              });
              idx = lower.indexOf(tl, idx + 1);
            }
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
        showError('No matches found. Check the spelling — matching ignores case but needs the exact text.');
        redacting = false;
        render();
        return;
      }

      progressLabel = 'Blacking out matches…';
      updateProgress();
      const pdfDoc = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      for (const m of matches) {
        const page = pages[m.pageIndex];
        if (!page) continue;
        page.drawRectangle({
          x: m.x, y: m.y, width: m.width, height: m.height,
          color: rgb(0, 0, 0), borderColor: rgb(0, 0, 0), borderWidth: 0.5
        });
      }
      progress = 90;
      updateProgress();
      redactedBytes = await pdfDoc.save();
      matchCount = matches.length;
      progress = 100;
    } catch (err) {
      showError(classifyError(err) || 'Redaction failed.');
    }
    redacting = false;
    render();
  }

  function updateProgress() {
    const bar = container.querySelector('#red-progress-bar');
    const label = container.querySelector('#red-progress-label');
    if (bar) bar.style.width = progress + '%';
    if (label) label.textContent = progressLabel;
  }

  function download() {
    if (!redactedBytes) return;
    const blob = new Blob([redactedBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-redacted.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#red-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#red-error');
    if (el) el.style.display = 'none';
  }

  function render() {
    const done = !!redactedBytes;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Redact PDF</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Permanently black out sensitive text — 100% private, in your browser
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="red-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="red-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="red-input" accept=".pdf,application/pdf" />
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

                  ${redacting ? `
                    <div style="margin-top:var(--space-3)">
                      <div style="font-size:var(--text-xs); color:var(--color-text-secondary); margin-bottom:6px" id="red-progress-label">${progressLabel}</div>
                      <div style="height:8px; background:var(--color-bg-secondary); border-radius:99px; overflow:hidden">
                        <div id="red-progress-bar" style="height:100%; width:${progress}%; background:var(--color-primary); border-radius:99px; transition:width .2s"></div>
                      </div>
                    </div>
                  ` : `
                    <div>
                      <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:6px" for="red-terms">
                        Text to redact <span style="font-weight:var(--weight-normal); color:var(--color-text-tertiary)">(one per line)</span>
                      </label>
                      <textarea id="red-terms" rows="3" placeholder="John Smith&#10;+92 300 1234567&#10;House 12, Street 4"
                        style="width:100%; font-size:var(--text-sm); padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text-primary); resize:vertical"></textarea>
                    </div>
                    ${done ? `
                      <button class="btn btn-primary btn-lg" id="red-download" style="width:100%">
                        ${icon('download', 18)} Download Redacted PDF
                      </button>
                    ` : `
                      <button class="btn btn-primary btn-lg" id="red-go" style="width:100%">
                        ${icon('shieldCheck', 18)} Redact PDF
                      </button>
                    `}
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="red-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite">
              ${done ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                  <h3 class="worksite-empty__title">Redaction complete!</h3>
                  <p class="worksite-empty__subtitle">${matchCount} match${matchCount === 1 ? '' : 'es'} permanently blacked out.</p>
                  <button class="btn btn-primary" id="red-download2">${icon('download', 16)} Download Redacted PDF</button>
                </div>
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('shieldCheck', 32)}</div>
                  <h3 class="worksite-empty__title">${file ? 'Enter text to redact, then click "Redact PDF"' : 'Upload a PDF to redact sensitive text'}</h3>
                  <p class="worksite-empty__subtitle">
                    Every occurrence is covered with a solid black box baked into the file.
                    For scanned PDFs with no text layer, run OCR first.
                  </p>
                  ${!file ? `<label class="btn btn-secondary btn-sm" for="red-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>` : ''}
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#red-input');
    const drop = container.querySelector('#red-drop');
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
    container.querySelector('#red-go')?.addEventListener('click', redact);
    container.querySelector('#red-download')?.addEventListener('click', download);
    container.querySelector('#red-download2')?.addEventListener('click', download);
  }

  render();
}
