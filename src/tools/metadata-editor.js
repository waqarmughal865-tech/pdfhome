/**
 * Metadata Editor — view and edit a PDF's document properties
 * (title, author, subject, keywords, creator, producer). All client-side.
 */

import { PDFDocument } from 'pdf-lib';
import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadBlob } from '../utils/download.js';
import { classifyError } from '../utils/error-handler.js';

const FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'author', label: 'Author' },
  { key: 'subject', label: 'Subject' },
  { key: 'keywords', label: 'Keywords', hint: '(comma separated)' },
  { key: 'creator', label: 'Creator' },
  { key: 'producer', label: 'Producer' },
];

export function renderMetadataEditor(container) {
  let file = null;
  let fileBytes = null;
  let saving = false;
  let savedBytes = null;

  async function handleFile(selectedFile) {
    if (!selectedFile) return;
    const typeCheck = validateFileType(selectedFile, [PDF_MIME]);
    if (!typeCheck.valid) { showError(typeCheck.message || 'Please select a valid PDF file.'); return; }
    const sizeCheck = checkFileSize(selectedFile);
    if (!sizeCheck.valid) { showError(sizeCheck.message || 'File is too large.'); return; }
    hideError();
    file = selectedFile;
    savedBytes = null;
    try {
      fileBytes = await readFileAsArrayBuffer(file);
      const probe = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const current = {};
      try { current.title = probe.getTitle() || ''; } catch (e) { current.title = ''; }
      try { current.author = probe.getAuthor() || ''; } catch (e) { current.author = ''; }
      try { current.subject = probe.getSubject() || ''; } catch (e) { current.subject = ''; }
      try { const kw = probe.getKeywords(); current.keywords = Array.isArray(kw) ? kw.join(', ') : (kw || ''); } catch (e) { current.keywords = ''; }
      try { current.creator = probe.getCreator() || ''; } catch (e) { current.creator = ''; }
      try { current.producer = probe.getProducer() || ''; } catch (e) { current.producer = ''; }
      render(current);
      return;
    } catch (err) {
      showError(classifyError(err) || 'Could not read this PDF file.');
      file = null;
      fileBytes = null;
    }
    render();
  }

  async function save() {
    if (!fileBytes || saving) return;
    saving = true;
    savedBytes = null;
    render(readInputs());
    try {
      const pdfDoc = await PDFDocument.load(fileBytes.slice(0), { ignoreEncryption: true });
      const v = readInputs();
      if (v.title) pdfDoc.setTitle(v.title);
      if (v.author) pdfDoc.setAuthor(v.author);
      if (v.subject) pdfDoc.setSubject(v.subject);
      if (v.keywords) pdfDoc.setKeywords(v.keywords.split(',').map(s => s.trim()).filter(Boolean));
      if (v.creator) pdfDoc.setCreator(v.creator);
      if (v.producer) pdfDoc.setProducer(v.producer);
      savedBytes = await pdfDoc.save();
    } catch (err) {
      showError(classifyError(err) || 'Save failed.');
    }
    saving = false;
    render(readInputs());
  }

  function readInputs() {
    const v = {};
    for (const f of FIELDS) {
      const el = container.querySelector('#meta-' + f.key);
      v[f.key] = el ? el.value : '';
    }
    return v;
  }

  function download() {
    if (!savedBytes) return;
    const blob = new Blob([savedBytes], { type: 'application/pdf' });
    downloadBlob(blob, `${getBasename(sanitizeFilename(file.name))}-metadata.pdf`);
  }

  function showError(msg) {
    const el = container.querySelector('#meta-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }
  function hideError() {
    const el = container.querySelector('#meta-error');
    if (el) el.style.display = 'none';
  }

  function render(prefill) {
    const done = !!savedBytes;
    const val = (k) => prefill && prefill[k] ? String(prefill[k]).replace(/"/g, '&quot;') : '';
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h2 class="tool-page__title">Metadata Editor</h2>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Edit your PDF's title, author, subject and keywords — 100% private
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="meta-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="meta-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="meta-input" accept=".pdf,application/pdf" />
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

                  ${saving ? `
                    <div style="font-size:var(--text-xs); color:var(--color-text-secondary); text-align:center">Saving…</div>
                  ` : done ? `
                    <button class="btn btn-primary btn-lg" id="meta-download" style="width:100%">
                      ${icon('download', 18)} Download Updated PDF
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-lg" id="meta-go" style="width:100%">
                      ${icon('check', 18)} Save Metadata
                    </button>
                  `}

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="meta-error" style="display:none; font-size:var(--text-sm); color:#dc2626; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius-md); padding:var(--space-3)"></div>
            </aside>

            <main class="tool-worksite">
              ${file ? `
                ${done ? `
                  <div class="worksite-empty">
                    <div class="worksite-empty__icon">${icon('checkCircle', 32)}</div>
                    <h3 class="worksite-empty__title">Metadata saved!</h3>
                    <p class="worksite-empty__subtitle">Your PDF's document properties have been updated.</p>
                    <button class="btn btn-primary" id="meta-download2">${icon('download', 16)} Download Updated PDF</button>
                  </div>
                ` : `
                  <div style="max-width:640px; margin:0 auto; width:100%">
                    <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:0 0 var(--space-4)">Document Properties</h3>
                    ${FIELDS.map(f => `
                      <div style="margin-bottom:var(--space-3)">
                        <label style="display:block; font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary); margin-bottom:6px" for="meta-${f.key}">
                          ${f.label} ${f.hint ? `<span style="font-weight:var(--weight-normal); color:var(--color-text-tertiary)">${f.hint}</span>` : ''}
                        </label>
                        <input id="meta-${f.key}" type="text" value="${val(f.key)}" placeholder="—"
                          style="width:100%; font-size:var(--text-sm); padding:var(--space-2) var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md); background:var(--color-bg); color:var(--color-text-primary)" />
                      </div>
                    `).join('')}
                    <p style="font-size:var(--text-xs); color:var(--color-text-tertiary)">
                      These hidden details help search engines and document managers identify your PDF.
                      Visible page content is not changed.
                    </p>
                  </div>
                `}
              ` : `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('sliders', 32)}</div>
                  <h3 class="worksite-empty__title">Upload a PDF to edit its details</h3>
                  <p class="worksite-empty__subtitle">
                    View and update the hidden title, author, subject, keywords, creator and producer
                    stored inside your PDF.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="meta-input" style="cursor:pointer">${icon('upload', 14)} Select PDF to Begin</label>
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    const input = container.querySelector('#meta-input');
    const drop = container.querySelector('#meta-drop');
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
    container.querySelector('#meta-go')?.addEventListener('click', save);
    container.querySelector('#meta-download')?.addEventListener('click', download);
    container.querySelector('#meta-download2')?.addEventListener('click', download);
  }

  render();
}
