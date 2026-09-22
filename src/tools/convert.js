/**
 * Central Document Conversion Suite:
 * - PDF ⇄ Word (DOCX) with integrated OCR for scanned/picture documents
 * - PDF ⇄ Excel (XLSX)
 * - PDF ⇄ PowerPoint (PPTX)
 * - Picture / Scanned PDF ➔ High-Quality Searchable Text PDF (OCR)
 * 100% Client-Side Processing in Web Browser
 */

import { icon } from '../components/icons.js';
import { renderAdSlot } from '../components/AdSlot.js';
import { sanitizeFilename, formatFileSize, readFileAsArrayBuffer, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer } from '../utils/download.js';
import { pdfToDocx, docxToPdf } from '../pdf/docx-converter.js';
import { pdfToExcel, excelToPdf } from '../pdf/excel-converter.js';
import { pdfToSlides, slidesToPdf } from '../pdf/slides-converter.js';
import { convertPicturePdfToTextPdf } from '../pdf/ocr-engine.js';
import { updateActiveNav } from '../components/Shell.js';

const CATEGORIES = {
  word: {
    id: 'word',
    name: 'Word (DOCX)',
    badge: 'Word',
    icon: 'fileText',
    officeName: 'Word',
    toOfficeMode: 'pdf-to-docx',
    toPdfMode: 'docx-to-pdf',
    toOfficeTitle: 'PDF to Word (DOCX)',
    toOfficeSub: 'Convert PDF documents into 100% editable Microsoft Word (.docx) files with formatting',
    toPdfTitle: 'Word (DOCX) to PDF',
    toPdfSub: 'Render Microsoft Word (.docx) files into clean, print-ready PDF documents',
    officeAccept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    officeExt: 'docx',
    officeMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  },
  excel: {
    id: 'excel',
    name: 'Excel (XLSX)',
    badge: 'Excel',
    icon: 'fileSpreadsheet',
    officeName: 'Excel',
    toOfficeMode: 'pdf-to-excel',
    toPdfMode: 'excel-to-pdf',
    toOfficeTitle: 'PDF to Excel (XLSX)',
    toOfficeSub: 'Extract data tables, rows, and numbers from PDF into Microsoft Excel (.xlsx) spreadsheets',
    toPdfTitle: 'Excel (XLSX) to PDF',
    toPdfSub: 'Convert Excel spreadsheets (.xlsx) into styled, paginated PDF tables',
    officeAccept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    officeExt: 'xlsx',
    officeMime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  slides: {
    id: 'slides',
    name: 'PowerPoint (PPTX)',
    badge: 'PowerPoint',
    icon: 'presentation',
    officeName: 'PowerPoint',
    toOfficeMode: 'pdf-to-slides',
    toPdfMode: 'slides-to-pdf',
    toOfficeTitle: 'PDF to Slides (PPTX)',
    toOfficeSub: 'Turn PDF pages into Microsoft PowerPoint presentation slides (.pptx)',
    toPdfTitle: 'Slides (PPTX) to PDF',
    toPdfSub: 'Convert PowerPoint (.pptx) presentations into high-resolution widescreen PDF slides',
    officeAccept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    officeExt: 'pptx',
    officeMime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  },
  ocr: {
    id: 'ocr',
    name: 'OCR (Searchable PDF)',
    badge: 'Searchable PDF',
    icon: 'scan',
    officeName: 'Searchable PDF',
    toOfficeMode: 'ocr-pdf',
    toPdfMode: 'ocr-pdf',
    toOfficeTitle: 'Scanned PDF to Searchable Text PDF (OCR)',
    toOfficeSub: 'Extract handwriting & scanned image text from documents into high-quality searchable PDF',
    toPdfTitle: 'Scanned PDF to Searchable Text PDF (OCR)',
    toPdfSub: 'Extract handwriting & scanned image text from documents into high-quality searchable PDF',
    officeAccept: '.pdf,application/pdf',
    officeExt: 'pdf',
    officeMime: 'application/pdf',
    isOcr: true
  }
};

export function renderConvert(container, initialMode = 'pdf-to-docx') {
  // Determine initial category and direction
  let activeCategoryKey = 'word';
  let direction = 'to-office'; // 'to-office' | 'to-pdf'
  let ocrMode = 'searchable'; // 'searchable' | 'digital'
  let ocrEnhance = true;
  let ocrLang = 'eng';

  if (initialMode.includes('excel')) {
    activeCategoryKey = 'excel';
  } else if (initialMode.includes('slides')) {
    activeCategoryKey = 'slides';
  } else if (initialMode === 'ocr-pdf' || initialMode.includes('ocr')) {
    activeCategoryKey = 'ocr';
  } else {
    activeCategoryKey = 'word';
  }

  if (initialMode.endsWith('-to-pdf')) {
    direction = 'to-pdf';
  } else {
    direction = 'to-office';
  }

  let file = null;
  let fileBuffer = null;
  let isConverting = false;
  let progressPercent = 0;
  let progressStatus = '';
  let resultBuffer = null;
  let resultFilename = '';

  function getCurrentConfig() {
    const cat = CATEGORIES[activeCategoryKey] || CATEGORIES.word;
    const isToOffice = (direction === 'to-office');

    if (cat.isOcr) {
      return {
        category: cat,
        modeKey: 'ocr-pdf',
        title: cat.toOfficeTitle,
        subtitle: cat.toOfficeSub,
        inputName: 'Scanned / Picture PDF',
        accept: '.pdf,application/pdf',
        outputExt: 'pdf',
        outputMime: 'application/pdf',
        targetBadge: 'Searchable PDF',
        icon: cat.icon
      };
    }

    return {
      category: cat,
      modeKey: isToOffice ? cat.toOfficeMode : cat.toPdfMode,
      title: isToOffice ? cat.toOfficeTitle : cat.toPdfTitle,
      subtitle: isToOffice ? cat.toOfficeSub : cat.toPdfSub,
      inputName: isToOffice ? 'PDF Document' : `${cat.officeName} Document`,
      accept: isToOffice ? '.pdf,application/pdf' : cat.officeAccept,
      outputExt: isToOffice ? cat.officeExt : 'pdf',
      outputMime: isToOffice ? cat.officeMime : 'application/pdf',
      targetBadge: isToOffice ? cat.badge : 'PDF',
      icon: cat.icon
    };
  }

  function render() {
    const cfg = getCurrentConfig();
    const cat = cfg.category;

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">${cfg.title}</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              ${cfg.subtitle}
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <!-- 1. Document Category Tabs (Word, Excel, PowerPoint, OCR) -->
          <div class="convert-category-bar">
            ${Object.values(CATEGORIES).map(c => `
              <button class="convert-cat-btn ${c.id === activeCategoryKey ? 'active' : ''}" data-cat="${c.id}" type="button">
                ${icon(c.icon, 16)}
                <span>${c.name}</span>
              </button>
            `).join('')}
          </div>

          <div class="tool-layout">

            <!-- LEFT SIDEBAR: Direction Switcher & File Upload -->
            <aside class="tool-sidebar">
              <!-- 2. Direction Switcher / Swap Component -->
              <div class="convert-direction-switcher">
                ${cat.isOcr ? `
                  <div class="conv-dir-pill active" style="flex:1; cursor:default; justify-content:center">
                    <span>Scanned PDF ➔ Searchable PDF (OCR)</span>
                  </div>
                ` : `
                  <button class="conv-dir-pill ${direction === 'to-office' ? 'active' : ''}" id="btn-dir-to-office" type="button">
                    <span>PDF ➔ ${cat.badge}</span>
                  </button>
                  <button class="conv-dir-swap-btn" id="btn-dir-swap" title="Swap Conversion Direction" type="button">
                    ${icon('arrowLeftRight', 14)}
                  </button>
                  <button class="conv-dir-pill ${direction === 'to-pdf' ? 'active' : ''}" id="btn-dir-to-pdf" type="button">
                    <span>${cat.badge} ➔ PDF</span>
                  </button>
                `}
              </div>

              <!-- Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="conv-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Change File' : `Upload ${cfg.inputName}`}</p>
                <p class="drop-zone__subtitle">Drop your ${cat.isOcr || direction === 'to-office' ? 'PDF' : '.' + cat.officeExt} file here or browse</p>
                <label class="drop-zone__browse" for="conv-input">${file ? 'Change File' : 'Choose File'}</label>
                <input type="file" id="conv-input" accept="${cfg.accept}" />
              </div>

              ${file ? `
                <!-- File Details Card -->
                <div class="tool-sidebar__card" style="padding:var(--space-3)">
                  <div style="display:flex; align-items:center; gap:var(--space-2)">
                    <div style="color:var(--color-primary)">${icon(cfg.icon, 24)}</div>
                    <div style="min-width:0; flex:1">
                      <div style="font-weight:var(--weight-semibold); font-size:var(--text-sm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                        ${sanitizeFilename(file.name)}
                      </div>
                      <div style="font-size:11px; color:var(--color-text-tertiary); margin-top:2px">
                        ${formatFileSize(file.size)} · Ready to convert
                      </div>
                    </div>
                  </div>
                </div>



                <!-- 4. Dedicated Settings Card for OCR Category -->
                ${activeCategoryKey === 'ocr' ? `
                  <div class="tool-sidebar__card" style="padding:var(--space-3); display:flex; flex-direction:column; gap:10px">
                    <div style="display:flex; justify-content:space-between; align-items:center">
                      <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
                        OCR Configuration
                      </span>
                      <span style="font-size:10px; color:#16a34a; font-weight:600; background:rgba(34,197,94,0.1); padding:2px 6px; border-radius:4px">
                        Local Engine
                      </span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:4px">
                      <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Document Language:</label>
                      <select id="ocr-lang-select" class="form-input" style="font-size:12px; padding:6px 8px">
                        <option value="eng" ${ocrLang === 'eng' ? 'selected' : ''}>English</option>
                        <option value="spa" ${ocrLang === 'spa' ? 'selected' : ''}>Spanish</option>
                        <option value="fra" ${ocrLang === 'fra' ? 'selected' : ''}>French</option>
                        <option value="deu" ${ocrLang === 'deu' ? 'selected' : ''}>German</option>
                        <option value="ita" ${ocrLang === 'ita' ? 'selected' : ''}>Italian</option>
                        <option value="por" ${ocrLang === 'por' ? 'selected' : ''}>Portuguese</option>
                      </select>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:4px">
                      <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Output PDF Format:</label>
                      <select id="ocr-mode-select" class="form-input" style="font-size:12px; padding:6px 8px">
                        <option value="searchable" ${ocrMode === 'searchable' ? 'selected' : ''}>Searchable PDF (Keep scan + selectable text layer)</option>
                        <option value="digital" ${ocrMode === 'digital' ? 'selected' : ''}>Digital Clean PDF (Re-typeset text into vector document)</option>
                      </select>
                    </div>

                    <label style="display:flex; align-items:center; gap:8px; font-size:11px; cursor:pointer">
                      <input type="checkbox" id="ocr-enhance-toggle" ${ocrEnhance ? 'checked' : ''} style="cursor:pointer" />
                      <span>Enhance contrast & clean scan noise</span>
                    </label>
                  </div>
                ` : ''}

                <!-- Convert Button & Progress Bar -->
                <div style="display:flex; flex-direction:column; gap:var(--space-2)">
                  <button class="btn btn-primary btn-lg" id="conv-start-btn" style="width:100%; justify-content:center" ${isConverting ? 'disabled' : ''}>
                    ${isConverting ? `${icon('loader', 18)} Converting...` : `${icon('arrowLeftRight', 18)} Convert to ${cfg.targetBadge}`}
                  </button>

                  ${isConverting ? `
                    <div style="display:flex; flex-direction:column; gap:4px; margin-top:4px">
                      <div class="progress-bar-wrap" style="height:6px; background:var(--color-surface); border-radius:3px; overflow:hidden; border:1px solid var(--color-border)">
                        <div class="progress-bar-fill" style="height:100%; width:${progressPercent}%; background:var(--color-primary); transition:width 0.2s ease"></div>
                      </div>
                      <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--color-text-tertiary)">
                        <span>${progressStatus || 'Processing document...'}</span>
                        <span>${progressPercent}%</span>
                      </div>
                    </div>
                  ` : ''}

                  <p style="font-size:11px; color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:4px; margin:0">
                    ${icon('shieldCheck', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="conv-error" style="display:none"></div>
            </aside>

            <!-- RIGHT WORKSITE: Result or Empty State -->
            <main class="tool-worksite" id="conv-worksite">
              ${!file ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon(cfg.icon, 48)}</div>
                  <h3 class="worksite-empty__title">${cfg.title}</h3>
                  <p class="worksite-empty__desc">
                    Fast, confidential, and private document conversion. Zero file uploads, zero server queues, and maximum data security.
                  </p>
                </div>
              ` : resultBuffer ? `
                <!-- SUCCESS CARD -->
                <div class="worksite-box" style="padding:var(--space-6); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:420px; gap:var(--space-4)">
                  <div style="width:72px; height:72px; border-radius:50%; background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center">
                    ${icon('check', 36)}
                  </div>
                  <div>
                    <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin:0 0 6px 0">Conversion Complete!</h2>
                    <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0">
                      Your <strong>.${cfg.outputExt.toUpperCase()}</strong> file is ready to open and use.
                    </p>
                  </div>

                  <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-3) var(--space-4); display:flex; align-items:center; gap:var(--space-3); max-width:420px; width:100%">
                    <div style="color:var(--color-primary)">${icon(cfg.icon, 24)}</div>
                    <div style="text-align:left; min-width:0; flex:1">
                      <div style="font-size:var(--text-xs); font-weight:var(--weight-semibold); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                        ${resultFilename}
                      </div>
                      <div style="font-size:11px; color:var(--color-text-tertiary)">
                        ${formatFileSize(resultBuffer.byteLength || resultBuffer.length)} · Searchable & High Quality
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; gap:var(--space-3); margin-top:var(--space-2)">
                    <button class="btn btn-primary btn-lg" id="conv-download-btn" style="min-width:180px; justify-content:center">
                      ${icon('download', 18)} Download File
                    </button>
                    <button class="btn btn-secondary btn-lg" id="conv-restart-btn">
                      Convert Another
                    </button>
                  </div>
                </div>
              ` : `
                <!-- READY TO CONVERT CARD -->
                <div class="worksite-box" style="padding:var(--space-6); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:360px; gap:var(--space-3)">
                  <div style="width:64px; height:64px; border-radius:50%; background:rgba(99,102,241,0.08); color:var(--color-primary); display:flex; align-items:center; justify-content:center">
                    ${icon(cfg.icon, 32)}
                  </div>
                  <h3 style="font-size:var(--text-lg); font-weight:var(--weight-semibold); margin:0">Ready to Convert</h3>
                  <p style="font-size:var(--text-sm); color:var(--color-text-secondary); max-width:460px; margin:0">
                    Click <strong>Convert to ${cfg.targetBadge}</strong> on the left to start. Ultra-fast processing with zero upload queues and client-side privacy.
                  </p>

                  <div style="margin-top:var(--space-4); width:100%; max-width:440px">
                    ${renderAdSlot('rectangle', 'sidebarSquare')}
                  </div>
                </div>
              `}
            </main>

          </div>
        </div>
        ${renderAdSlot('banner', 'workspaceBottom')}
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Category tabs (Word, Excel, PowerPoint, OCR)
    container.querySelectorAll('.convert-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (cat && CATEGORIES[cat] && cat !== activeCategoryKey) {
          activeCategoryKey = cat;
          const newCfg = getCurrentConfig();

          // Retain loaded file if both previous and new category accept PDF
          const isPdf = file && (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf');
          if (!isPdf || !newCfg.accept.includes('.pdf')) {
            file = null;
            fileBuffer = null;
          }
          resultBuffer = null;

          history.replaceState(null, '', `#/${newCfg.modeKey}`);
          updateActiveNav(`#/${newCfg.modeKey}`);
          render();
        }
      });
    });

    // Direction switcher buttons
    container.querySelector('#btn-dir-to-office')?.addEventListener('click', () => {
      if (direction !== 'to-office') {
        direction = 'to-office';
        file = null;
        fileBuffer = null;
        resultBuffer = null;
        const cfg = getCurrentConfig();
        history.replaceState(null, '', `#/${cfg.modeKey}`);
        updateActiveNav(`#/${cfg.modeKey}`);
        render();
      }
    });

    container.querySelector('#btn-dir-to-pdf')?.addEventListener('click', () => {
      if (direction !== 'to-pdf') {
        direction = 'to-pdf';
        file = null;
        fileBuffer = null;
        resultBuffer = null;
        const cfg = getCurrentConfig();
        history.replaceState(null, '', `#/${cfg.modeKey}`);
        updateActiveNav(`#/${cfg.modeKey}`);
        render();
      }
    });

    container.querySelector('#btn-dir-swap')?.addEventListener('click', () => {
      direction = (direction === 'to-office') ? 'to-pdf' : 'to-office';
      file = null;
      fileBuffer = null;
      resultBuffer = null;
      const cfg = getCurrentConfig();
      history.replaceState(null, '', `#/${cfg.modeKey}`);
      updateActiveNav(`#/${cfg.modeKey}`);
      render();
    });

    // Drop zone & file input
    const dropZone = container.querySelector('#conv-drop');
    const fileInput = container.querySelector('#conv-input');
    if (dropZone && fileInput) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleFile(fileInput.files[0]);
      });
    }


    // OCR Category controls
    const ocrLangSelect = container.querySelector('#ocr-lang-select');
    if (ocrLangSelect) {
      ocrLangSelect.addEventListener('change', (e) => {
        ocrLang = e.target.value;
      });
    }

    const ocrModeSelect = container.querySelector('#ocr-mode-select');
    if (ocrModeSelect) {
      ocrModeSelect.addEventListener('change', (e) => {
        ocrMode = e.target.value;
      });
    }

    const ocrEnhanceToggle = container.querySelector('#ocr-enhance-toggle');
    if (ocrEnhanceToggle) {
      ocrEnhanceToggle.addEventListener('change', (e) => {
        ocrEnhance = e.target.checked;
      });
    }

    // Start conversion
    container.querySelector('#conv-start-btn')?.addEventListener('click', executeConversion);

    // Download button
    container.querySelector('#conv-download-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (resultBuffer) {
        const cfg = getCurrentConfig();
        downloadArrayBuffer(resultBuffer, resultFilename, cfg.outputMime);
      }
    });

    // Restart button
    container.querySelector('#conv-restart-btn')?.addEventListener('click', () => {
      file = null;
      fileBuffer = null;
      resultBuffer = null;
      render();
    });
  }

  async function handleFile(f) {
    const errorEl = container.querySelector('#conv-error');
    if (errorEl) errorEl.style.display = 'none';

    try {
      file = f;
      fileBuffer = await readFileAsArrayBuffer(f);
      resultBuffer = null;
      render();
    } catch (err) {
      showError(err.message || 'Failed to read file.');
    }
  }

  async function executeConversion() {
    if (!fileBuffer) return;
    const cfg = getCurrentConfig();

    isConverting = true;
    progressPercent = 5;
    progressStatus = 'Initializing conversion...';
    render();

    try {
      const onProg = (pctOrCurrent, totalOrStatus, maybeStatus) => {
        let pct = 0;
        let statusText = '';

        if (typeof totalOrStatus === 'number') {
          pct = Math.round((pctOrCurrent / totalOrStatus) * 100);
          statusText = maybeStatus || 'Processing document...';
        } else {
          pct = pctOrCurrent;
        }

        if (typeof maybeStatus === 'string') {
          statusText = maybeStatus;
        } else if (typeof totalOrStatus === 'string') {
          statusText = totalOrStatus;
        }

        progressPercent = Math.min(100, Math.max(0, pct));
        if (statusText) progressStatus = statusText;

        const fill = container.querySelector('.progress-bar-fill');
        if (fill) fill.style.width = `${progressPercent}%`;
        const label = container.querySelector('.progress-bar-wrap + div span:first-child');
        if (label && progressStatus) label.textContent = progressStatus;
        const pctLabel = container.querySelector('.progress-bar-wrap + div span:last-child');
        if (pctLabel) pctLabel.textContent = `${progressPercent}%`;
      };

      const baseName = getBasename(file.name);
      let outBytes = null;

      switch (cfg.modeKey) {
        case 'pdf-to-docx':
          outBytes = await pdfToDocx(fileBuffer, onProg);
          resultFilename = `${baseName}.docx`;
          break;

        case 'docx-to-pdf':
          outBytes = await docxToPdf(fileBuffer, onProg);
          resultFilename = `${baseName}.pdf`;
          break;

        case 'pdf-to-excel':
          outBytes = await pdfToExcel(fileBuffer, onProg);
          resultFilename = `${baseName}.xlsx`;
          break;

        case 'excel-to-pdf':
          outBytes = await excelToPdf(fileBuffer, onProg);
          resultFilename = `${baseName}.pdf`;
          break;

        case 'pdf-to-slides':
          outBytes = await pdfToSlides(fileBuffer, onProg);
          resultFilename = `${baseName}.pptx`;
          break;

        case 'slides-to-pdf':
          outBytes = await slidesToPdf(fileBuffer, onProg);
          resultFilename = `${baseName}.pdf`;
          break;

        case 'ocr-pdf':
          outBytes = await convertPicturePdfToTextPdf(fileBuffer, {
            mode: ocrMode,
            enhanceImage: ocrEnhance,
            language: ocrLang
          }, onProg);
          resultFilename = `${baseName}_searchable.pdf`;
          break;

        default:
          throw new Error(`Unknown conversion mode: ${cfg.modeKey}`);
      }

      resultBuffer = outBytes;
      isConverting = false;
      render();
    } catch (err) {
      isConverting = false;
      showError(err.message || 'Conversion failed. Please verify the document format.');
      render();
    }
  }

  function showError(msg) {
    const errorEl = container.querySelector('#conv-error');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.className = 'status-msg status-msg--error';
      errorEl.innerHTML = `${icon('alertCircle', 16)} <span>${msg}</span>`;
    }
  }

  render();
}
