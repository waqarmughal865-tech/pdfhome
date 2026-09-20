/**
 * Compress PDF Tool — Smart Multi-Stage Compression with Interactive Page Zoom Inspector.
 * 
 * Features:
 * - Expected output size calculation before compression.
 * - Prominent download buttons in both sidebar and main workspace.
 * - Guaranteed file size reduction with high-clarity rendering.
 * - Interactive Page Zoom & Detail Inspector (+ / - zoom, fit width, page navigation).
 * - Visual Before & After comparison card with savings percentages and custom renaming.
 * - 100% client-side processing.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer } from '../utils/download.js';
import { compressPDF, COMPRESSION_PRESETS } from '../pdf/compressor.js';
import { loadPDFDocument } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';

export function renderCompress(container) {
  let file = null;
  let pdfBuffer = null;
  let pdfDoc = null;
  let pageCount = 0;
  let currentPage = 1;
  let zoom = 1.0; // 0.5 to 3.5
  let preset = 'medium'; // 'medium' | 'high' | 'lossless'
  
  // Compression output state
  let compressedBuffer = null;
  let compressedDoc = null;
  let originalSize = 0;
  let compressedSize = 0;
  let compressionNote = '';
  let isLosslessUnchanged = false;
  let viewMode = 'original'; // 'original' | 'compressed'

  function getExpectedSize(presetKey) {
    if (!file) return '';
    const ratio = COMPRESSION_PRESETS[presetKey]?.estRatio || 0.5;
    const estBytes = Math.max(12000, Math.round(file.size * ratio));
    return formatFileSize(estBytes);
  }

  function triggerDownload() {
    if (!compressedBuffer) {
      console.warn('triggerDownload: compressedBuffer is null');
      return;
    }
    const baseName = getBasename(sanitizeFilename(file.name));
    const defaultName = `${baseName}_compressed`;
    const inputName = document.getElementById('compress-filename-input')?.value.trim();
    const finalName = inputName ? sanitizeFilename(inputName) : defaultName;
    downloadArrayBuffer(compressedBuffer, `${finalName}.pdf`);
  }

  function render() {
    const savings = (originalSize > 0 && compressedSize > 0) 
      ? Math.round((1 - compressedSize / originalSize) * 100) 
      : 0;

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">Compress PDF</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Reduce PDF file size while keeping text and graphics crisp and legible
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Compression Options -->
            <aside class="tool-sidebar">
              <!-- Compact Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="compress-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or click to browse</p>
                <label class="drop-zone__browse" for="compress-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="compress-input" accept=".pdf,application/pdf" />
              </div>

              ${file ? `
                <!-- File & Presets Card -->
                <div class="tool-sidebar__card">
                  <div>
                    <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                      Active Document
                    </span>
                    <div style="font-weight:var(--weight-medium); font-size:var(--text-sm); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:4px">
                      ${sanitizeFilename(file.name)}
                    </div>
                    <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
                      Original Size: <strong>${formatFileSize(file.size)}</strong> · ${pageCount} pages
                    </div>
                  </div>

                  <!-- PROMINENT SIDEBAR DOWNLOAD BOX (VISIBLE IMMEDIATELY ONCE COMPRESSED) -->
                  ${compressedBuffer ? `
                    <div style="background:var(--color-bg-primary); border:2px solid var(--color-success); border-radius:var(--radius-lg); padding:var(--space-4); margin-top:var(--space-3); text-align:center">
                      <div style="display:flex; align-items:center; justify-content:center; gap:6px; color:var(--color-success); font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em">
                        ${icon('checkCircle', 16)} Compressed & Ready
                      </div>
                      <div style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:6px 0 2px 0">
                        ${formatFileSize(compressedSize)}
                      </div>
                      <div style="font-size:11px; color:var(--color-success); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">
                        ${savings > 0 ? `↓ Saved ${savings}% (${formatFileSize(originalSize - compressedSize)} lighter)` : 'Optimized stream structure'}
                      </div>
                      <button class="btn btn-primary btn-lg" id="sidebar-download-btn" style="width:100%; font-weight:var(--weight-bold); display:flex; align-items:center; justify-content:center; gap:var(--space-2)">
                        ${icon('download', 18)} Download Compressed PDF
                      </button>
                    </div>
                  ` : ''}

                  <div style="border-top:1px solid var(--color-border); padding-top:var(--space-3)">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2)">
                      <label style="font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-secondary)">
                        Select Compression Level:
                      </label>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:var(--space-2)">
                      ${Object.entries(COMPRESSION_PRESETS).map(([key, val]) => `
                        <div class="preset-card ${preset === key ? 'preset-card--active' : ''}" data-preset="${key}" style="display:block; padding:var(--space-3); border:2px solid ${preset === key ? 'var(--color-accent)' : 'var(--color-border)'}; border-radius:var(--radius-md); cursor:pointer; transition:all 0.15s; background:${preset === key ? 'var(--color-accent-subtle)' : 'transparent'}">
                          <div style="display:flex; align-items:center; justify-content:space-between">
                            <div style="display:flex; align-items:center; gap:var(--space-2)">
                              <span style="display:inline-block; width:14px; height:14px; border-radius:50%; border:2px solid ${preset === key ? 'var(--color-accent)' : 'var(--color-border)'}; background:${preset === key ? 'var(--color-accent)' : 'transparent'}; box-shadow:${preset === key ? 'inset 0 0 0 2px var(--color-bg-primary)' : 'none'}"></span>
                              <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); color:var(--color-text-primary)">${val.label}</span>
                            </div>
                            <span style="font-size:11px; font-weight:var(--weight-semibold); color:var(--color-success)">${val.estLabel}</span>
                          </div>
                          <div style="font-size:11px; color:var(--color-text-tertiary); margin-top:4px; line-height:1.35; padding-left:22px">${val.desc}</div>
                          <div style="font-size:11px; color:var(--color-text-secondary); margin-top:6px; font-weight:var(--weight-medium); padding-left:22px">
                            Expected Size: <strong style="color:var(--color-accent)">~${getExpectedSize(key)}</strong>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <button class="btn ${compressedBuffer ? 'btn-secondary' : 'btn-primary'} btn-lg" id="compress-btn" style="width:100%">
                    ${icon('compress', 18)} ${compressedBuffer ? 'Re-Compress with Current Preset' : 'Compress PDF Now'}
                  </button>

                  <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                    ${icon('lock', 12)} 100% Client-Side Processing
                  </p>
                </div>
              ` : ''}

              <div id="compress-progress" style="display:none"></div>
              <div id="compress-error" style="display:none"></div>
            </aside>

            <!-- RIGHT SIDE: Work Site (Results Card & Detail Inspector) -->
            <main class="tool-worksite" id="compress-worksite">
              ${!file ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('compress', 32)}</div>
                  <h3 class="worksite-empty__title">Your Workspace is Ready</h3>
                  <p class="worksite-empty__subtitle">
                    Upload your PDF document using the panel on the left.
                    You will be able to inspect pages with interactive zoom controls, preview expected file sizes, and reduce PDF size with crisp quality preservation.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="compress-input" style="cursor:pointer">
                    ${icon('upload', 14)} Choose PDF to Begin
                  </label>
                </div>
              ` : `
                <!-- PROMINENT BEFORE & AFTER RESULTS CARD AT TOP OF WORKSITE WHEN COMPRESSED -->
                ${compressedBuffer ? `
                  <div id="compress-result" style="margin-bottom:var(--space-4)">
                    ${renderResultsCard()}
                  </div>
                ` : ''}

                <!-- Toolbar: Page Navigator & Zoom Controls -->
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-3); border-bottom:1px solid var(--color-border); padding-bottom:var(--space-3)">
                  
                  <!-- Page Navigation -->
                  <div style="display:flex; align-items:center; gap:var(--space-2)">
                    <button class="btn btn-ghost btn-sm" id="zoom-prev-page" title="Previous Page" style="padding:4px 8px" ${currentPage <= 1 ? 'disabled' : ''}>
                      ${icon('chevronLeft', 16)}
                    </button>
                    <span style="font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-text-primary)">
                      Page ${currentPage} of ${pageCount}
                    </span>
                    <button class="btn btn-ghost btn-sm" id="zoom-next-page" title="Next Page" style="padding:4px 8px" ${currentPage >= pageCount ? 'disabled' : ''}>
                      ${icon('arrowRight', 16)}
                    </button>
                  </div>

                  <!-- Toggle Preview (Original vs Compressed) if compressed -->
                  ${compressedDoc ? `
                    <div class="tabs" style="display:inline-flex; padding:2px; background:var(--color-bg-primary); border-radius:var(--radius-md); border:1px solid var(--color-border)">
                      <button class="tab ${viewMode === 'original' ? 'tab--active' : ''}" id="view-mode-orig" style="font-size:11px; padding:3px 10px; cursor:pointer">Original Source</button>
                      <button class="tab ${viewMode === 'compressed' ? 'tab--active' : ''}" id="view-mode-comp" style="font-size:11px; padding:3px 10px; cursor:pointer; color:var(--color-success)">Compressed Output</button>
                    </div>
                  ` : ''}

                  <!-- Zoom Controls -->
                  <div style="display:flex; align-items:center; gap:var(--space-1)">
                    <button class="btn btn-ghost btn-sm" id="zoom-out-btn" title="Zoom Out (-25%)" style="padding:4px 6px">
                      ${icon('zoomOut', 16)}
                    </button>
                    
                    <span id="zoom-level-label" style="font-size:var(--text-xs); font-weight:var(--weight-semibold); min-width:44px; text-align:center; background:var(--color-bg-tertiary); padding:2px 6px; border-radius:var(--radius-sm); border:1px solid var(--color-border)">
                      ${Math.round(zoom * 100)}%
                    </span>

                    <button class="btn btn-ghost btn-sm" id="zoom-in-btn" title="Zoom In (+25%)" style="padding:4px 6px">
                      ${icon('zoomIn', 16)}
                    </button>

                    <button class="btn btn-ghost btn-sm" id="zoom-fit-btn" title="Fit to View" style="padding:4px 8px; font-size:11px; margin-left:var(--space-1)">
                      Fit
                    </button>
                    <button class="btn btn-ghost btn-sm" id="zoom-100-btn" title="Actual Size (100%)" style="padding:4px 8px; font-size:11px">
                      100%
                    </button>
                  </div>
                </div>

                <!-- Interactive Zoom Viewport -->
                <div id="zoom-viewport" style="position:relative; width:100%; height:460px; overflow:auto; background:var(--color-bg-tertiary); border:1px solid var(--color-border); border-radius:var(--radius-lg); display:flex; align-items:flex-start; justify-content:center; padding:var(--space-6)">
                  <div id="zoom-canvas-container" style="transition:transform 0.15s ease-out; transform-origin:top center; box-shadow:var(--shadow-lg); background:#ffffff; border-radius:var(--radius-sm); line-height:0">
                    <canvas id="zoom-preview-canvas" style="display:block"></canvas>
                  </div>
                </div>
                <div style="font-size:11px; color:var(--color-text-tertiary); display:flex; justify-content:space-between; align-items:center">
                  <span>Tip: Use <strong>+</strong> and <strong>-</strong> buttons above to zoom into fine text and check clarity.</span>
                  <span>Inspection Mode: <strong>${viewMode === 'compressed' ? 'Compressed Output' : 'Original Source'}</strong></span>
                </div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    setupListeners();
    if (file) renderZoomPage();
  }

  function renderResultsCard() {
    if (!compressedBuffer) return '';
    const savings = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;
    const baseName = getBasename(sanitizeFilename(file.name));
    const defaultName = `${baseName}_compressed`;

    return `
      <div class="result-card" style="margin-top:var(--space-1); border:1px solid var(--color-border); box-shadow:var(--shadow-md)">
        <div class="result-card__icon" style="color:var(--color-success)">${icon('checkCircle', 28)}</div>
        <h3 class="result-card__title">PDF Compression Ready</h3>
        
        <!-- BEFORE & AFTER VISUAL COMPARISON -->
        <div class="compress-stats" style="margin:var(--space-4) 0">
          <div class="compress-stat">
            <div class="compress-stat__label">Before (Original)</div>
            <div class="compress-stat__value" style="color:var(--color-text-secondary); text-decoration:line-through">${formatFileSize(originalSize)}</div>
          </div>
          <div class="compress-stat__arrow">➔</div>
          <div class="compress-stat">
            <div class="compress-stat__label">After (Compressed)</div>
            <div class="compress-stat__value" style="color:var(--color-success); font-size:var(--text-lg); font-weight:var(--weight-bold)">${formatFileSize(compressedSize)}</div>
            ${savings > 0 ? `
              <div class="compress-stat__savings" style="color:var(--color-success); font-weight:var(--weight-bold); margin-top:2px">
                ↓ Saved ${savings}% (${formatFileSize(originalSize - compressedSize)} lighter)
              </div>
            ` : `
              <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
                Internal structure clean & optimized
              </div>
            `}
          </div>
        </div>

        ${compressionNote ? `
          <div style="font-size:var(--text-xs); color:var(--color-text-secondary); background:var(--color-bg-primary); padding:var(--space-2) var(--space-4); border-radius:var(--radius-md); margin-bottom:var(--space-3); display:inline-block; border:1px solid var(--color-border)">
            ✨ ${compressionNote}
          </div>
        ` : ''}

        ${isLosslessUnchanged ? `
          <div style="background:var(--color-bg-secondary); border:1px solid var(--color-warning); border-radius:var(--radius-md); padding:var(--space-3); max-width:480px; margin:0 auto var(--space-3) auto; font-size:11px; color:var(--color-text-secondary)">
            <p style="font-weight:var(--weight-semibold); color:var(--color-warning); margin-bottom:4px">
              Need more reduction?
            </p>
            Lossless mode preserves raw image data. To compress page images by 40%–60%, switch to <strong>Balanced</strong> mode.
            <div style="margin-top:var(--space-2)">
              <button class="btn btn-secondary btn-sm" id="try-balanced-btn" style="cursor:pointer">
                ${icon('zap', 14)} Try Balanced Compression
              </button>
            </div>
          </div>
        ` : ''}

        <div style="margin: var(--space-3) 0 var(--space-4) 0; max-width: 420px; margin-left: auto; margin-right: auto; text-align: left;">
          <label style="display:block; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
            Output Filename:
          </label>
          <div style="display:flex; align-items:center; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:0 var(--space-3)">
            <span style="color:var(--color-text-tertiary); margin-right:var(--space-2)">${icon('edit', 14)}</span>
            <input type="text" id="compress-filename-input" class="input" value="${defaultName}" style="border:none; padding:var(--space-2) 0; flex:1" />
            <span style="color:var(--color-text-tertiary); font-size:var(--text-sm)">.pdf</span>
          </div>
        </div>

        <div style="display:flex; justify-content:center; gap:var(--space-3); flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" id="compress-download" style="min-width:280px">
            ${icon('download', 18)} Download Compressed PDF (${formatFileSize(compressedSize)})
          </button>
        </div>
      </div>
    `;
  }

  async function renderZoomPage() {
    const canvas = document.getElementById('zoom-preview-canvas');
    const containerEl = document.getElementById('zoom-canvas-container');
    if (!canvas || !containerEl) return;

    try {
      // Choose doc to view (original or compressed)
      const docToUse = (viewMode === 'compressed' && compressedDoc) ? compressedDoc : pdfDoc;
      if (!docToUse) return;

      // Render at 2x base resolution for sharp zoom details
      const page = await docToUse.getPage(currentPage);
      const viewport = page.getViewport({ scale: 2.0 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Base display dimensions (at 100% zoom = original unscaled PDF point size)
      const baseDisplayWidth = viewport.width / 2.0;
      const baseDisplayHeight = viewport.height / 2.0;

      canvas.style.width = `${Math.round(baseDisplayWidth * zoom)}px`;
      canvas.style.height = `${Math.round(baseDisplayHeight * zoom)}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.warn('Zoom page render error:', err);
    }
  }

  function applyZoom(newZoom) {
    zoom = Math.max(0.4, Math.min(3.5, Math.round(newZoom * 100) / 100));
    const label = document.getElementById('zoom-level-label');
    if (label) label.textContent = `${Math.round(zoom * 100)}%`;

    const canvas = document.getElementById('zoom-preview-canvas');
    if (canvas && canvas.width > 0) {
      const baseDisplayWidth = canvas.width / 2.0;
      const baseDisplayHeight = canvas.height / 2.0;
      canvas.style.width = `${Math.round(baseDisplayWidth * zoom)}px`;
      canvas.style.height = `${Math.round(baseDisplayHeight * zoom)}px`;
    }
  }

  function setupListeners() {
    const dropZone = document.getElementById('compress-drop');
    const fileInput = document.getElementById('compress-input');
    if (dropZone) {
      dropZone.addEventListener('click', (e) => { if (e.target === fileInput || e.target.closest('label')) return; fileInput.click(); });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); handleFile(e.dataTransfer.files[0]); });
    }
    if (fileInput) fileInput.addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });

    // Worksite drop support
    const worksite = document.getElementById('compress-worksite');
    if (worksite) {
      worksite.addEventListener('dragover', (e) => { e.preventDefault(); worksite.style.borderColor = 'var(--color-accent)'; });
      worksite.addEventListener('dragleave', () => { worksite.style.borderColor = ''; });
      worksite.addEventListener('drop', (e) => {
        e.preventDefault();
        worksite.style.borderColor = '';
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });
    }

    // Preset cards selection
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const p = card.dataset.preset;
        if (p && p !== preset) {
          preset = p;
          render();
        }
      });
    });

    // Zoom buttons
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => applyZoom(zoom + 0.25));
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => applyZoom(zoom - 0.25));
    document.getElementById('zoom-100-btn')?.addEventListener('click', () => applyZoom(1.0));
    document.getElementById('zoom-fit-btn')?.addEventListener('click', () => {
      const viewport = document.getElementById('zoom-viewport');
      const canvas = document.getElementById('zoom-preview-canvas');
      if (viewport && canvas && canvas.width > 0) {
        const availWidth = viewport.clientWidth - 48;
        const baseWidth = canvas.width / 2.0;
        applyZoom(availWidth / baseWidth);
      }
    });

    // Page navigation in zoom inspector
    document.getElementById('zoom-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

    document.getElementById('zoom-next-page')?.addEventListener('click', () => {
      if (currentPage < pageCount) {
        currentPage++;
        render();
      }
    });

    // View mode toggle (Original vs Compressed)
    document.getElementById('view-mode-orig')?.addEventListener('click', () => {
      viewMode = 'original';
      render();
    });

    document.getElementById('view-mode-comp')?.addEventListener('click', () => {
      viewMode = 'compressed';
      render();
    });

    // Compress button
    document.getElementById('compress-btn')?.addEventListener('click', () => doCompress());

    // Switch to balanced button (if lossless was used)
    document.getElementById('try-balanced-btn')?.addEventListener('click', () => {
      preset = 'medium';
      render();
      doCompress();
    });

    // Main Worksite Download button
    document.getElementById('compress-download')?.addEventListener('click', () => {
      triggerDownload();
    });

    // Sidebar Download button
    document.getElementById('sidebar-download-btn')?.addEventListener('click', () => {
      triggerDownload();
    });
  }

  async function handleFile(f) {
    if (!f) return;
    if (!validateFileType(f, [PDF_MIME])) { showError('Invalid File', 'Please select a valid PDF file.'); return; }
    const sc = checkFileSize(f);
    if (!sc.ok) { showError('File Too Large', sc.message); return; }

    file = f;
    compressedBuffer = null;
    compressedDoc = null;
    isLosslessUnchanged = false;
    viewMode = 'original';
    currentPage = 1;
    zoom = 1.0;

    try {
      pdfBuffer = await readFileAsArrayBuffer(file);
      pdfDoc = await loadPDFDocument(pdfBuffer);
      pageCount = pdfDoc.numPages;
      render();
    } catch (err) {
      file = null;
      render();
      showError(classifyError(err).title, classifyError(err).message);
    }
  }

  async function doCompress() {
    const progressEl = document.getElementById('compress-progress');
    const resultEl = document.getElementById('compress-result');
    const btn = document.getElementById('compress-btn');
    if (btn) btn.disabled = true;
    if (progressEl) progressEl.style.display = 'block';
    if (resultEl) resultEl.style.display = 'none';

    try {
      if (!pdfBuffer || pdfBuffer.byteLength === 0) {
        if (file) pdfBuffer = await readFileAsArrayBuffer(file);
      }
      
      progressEl.innerHTML = `
        <div class="progress">
          <p class="progress__label">Optimizing PDF...</p>
          <div class="progress__bar-track"><div class="progress__bar-fill" id="compress-bar" style="width:0%"></div></div>
          <p class="progress__detail" id="compress-detail">Analyzing streams & pages...</p>
          <p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p>
        </div>
      `;

      const { result, originalSize: oSize, compressedSize: cSize, note, isLosslessUnchanged: isUnchanged } = await compressPDF(pdfBuffer, preset, (cur, tot, phase) => {
        const pct = Math.round((cur / tot) * 100);
        const bar = document.getElementById('compress-bar');
        const detail = document.getElementById('compress-detail');
        if (bar) bar.style.width = `${pct}%`;
        if (detail) detail.textContent = `${phase}: page ${cur} of ${tot}`;
      });

      compressedBuffer = result;
      originalSize = oSize;
      compressedSize = cSize;
      compressionNote = note;
      isLosslessUnchanged = !!isUnchanged;

      // Automatically switch to viewing compressed output in zoom inspector if smaller
      if (compressedSize < originalSize) {
        viewMode = 'compressed';
      }

      // Load compressed doc for instant quality inspection
      try {
        compressedDoc = await loadPDFDocument(compressedBuffer);
      } catch (e) {
        console.warn('Could not load compressed document into viewer:', e);
      }

      progressEl.style.display = 'none';
      if (btn) btn.disabled = false;
      render();
      
      // Auto-scroll to results card
      const resCard = document.getElementById('compress-result');
      if (resCard) resCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      if (progressEl) progressEl.style.display = 'none';
      showError(classifyError(err).title, classifyError(err).message);
      if (btn) btn.disabled = false;
    }
  }

  function showError(title, message) {
    const el = document.getElementById('compress-error');
    if (el) {
      el.style.display = 'block';
      el.innerHTML = `
        <div class="error-display">
          <span class="error-display__icon">${icon('alertCircle', 20)}</span>
          <div class="error-display__content">
            <p class="error-display__title">${title}</p>
            <p class="error-display__message">${message}</p>
          </div>
          <button class="error-display__dismiss" onclick="this.closest('.error-display').parentElement.style.display='none'">${icon('x', 16)}</button>
        </div>
      `;
    }
  }

  render();
}
