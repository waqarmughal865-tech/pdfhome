/**
 * Page Editor Tool — Ultra-High Performance Architecture:
 * - Two-Section Workspace Layout (Top Preview + Bottom Editing Workbench)
 * - Zero-Lag DOM Lifecycle: Never wipes DOM on tab switch, page jump, or slider movement.
 * - In-Memory Canvas & Thumbnail Caching: Page switching is instant (<1ms).
 * - Per-Page Cropping & Global "Apply to All" Cropping.
 * - Interactive Draggable Watermark & Handwritten Signature Pad.
 */

import { icon } from '../components/icons.js';
import { renderAdSlot } from '../components/AdSlot.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer } from '../utils/download.js';
import { applyWatermark, applyPageNumbers, applyCrop, lockPDF } from '../pdf/editor-engine.js';
import { loadPDFDocument, generateThumbnail, renderPageToCanvas } from '../pdf/renderer.js';
import { PDFDocument, degrees } from 'pdf-lib';
import Sortable from 'sortablejs';

export function renderPages(container, options = {}) {
  let file = null;
  let pdfDoc = null;
  let pdfBuffer = null;
  let pageCount = 0;
  let activePage = 1;
  let pageOrder = []; // 1-based page numbers in current order
  let rotations = {}; // pageNum → accumulated rotation degrees (0, 90, 180, 270)
  let deletedPages = new Set();
  let modified = false;
  let activeTab = options.initialTab || 'watermark'; // 'watermark' | 'organize' | 'numbers' | 'crop' | 'protect'

  // Performance Caches
  const pageRenderCache = new Map(); // key: `${page}_${rot}_${zoom}` -> OffscreenCanvas/HTMLCanvasElement
  const thumbCache = new Map();      // key: `${page}_${rot}` -> HTMLCanvasElement
  let sortableInstance = null;

  // Watermark / Signature state
  let enableWatermark = true;
  let wmType = options.initialWmType || 'draw'; // 'draw' | 'image' | 'text'
  let wmText = 'CONFIDENTIAL';
  let wmImageData = null;
  let wmImagePreviewUrl = null;
  let wmMimeType = 'image/png';
  let wmAnchor = 'center';
  let wmCustomPos = null; // { xPct: number, yPct: number }
  let wmOpacity = 0.9;
  let wmScale = 0.45;
  let wmRotation = 0;
  let wmMargin = 30;
  let wmExclude = ''; // Comma-separated: e.g. "1, 3, 5-8"
  let wmInkColor = '#1d4ed8';

  // Page Numbers state
  let enableNumbers = false;
  let pnPosition = 'bottom-center';
  let pnFormat = 'Page {n} of {total}';
  let pnMargin = 25;
  let pnFontSize = 10;
  let pnExcludeFirst = true;

  // Crop state: per-page & global
  let cropScope = 'all'; // 'all' | 'single'
  let globalCrop = { top: 0, bottom: 0, left: 0, right: 0 };
  let pageCrops = {}; // pageNum -> { top, bottom, left, right }

  // Protect state
  let protectPassword = '';
  let protectConfirm = '';

  // Inspector zoom
  let previewZoom = 1.0;

  // Helper: get active crop insets for current page
  function getCurrentCrop() {
    if (cropScope === 'single') {
      return pageCrops[activePage] || { top: 0, bottom: 0, left: 0, right: 0 };
    }
    return globalCrop;
  }

  function setCropInset(edge, val) {
    const num = Math.max(0, parseInt(val || '0', 10));
    if (cropScope === 'single') {
      if (!pageCrops[activePage]) pageCrops[activePage] = { ...globalCrop };
      pageCrops[activePage][edge] = num;
    } else {
      globalCrop[edge] = num;
      // Also update all custom crops
      Object.keys(pageCrops).forEach(p => {
        pageCrops[p][edge] = num;
      });
    }
    modified = true;
    updateOverlays();
  }

  function setCropAll(top, bottom, left, right) {
    const crop = {
      top: Math.max(0, parseInt(top || '0', 10)),
      bottom: Math.max(0, parseInt(bottom || '0', 10)),
      left: Math.max(0, parseInt(left || '0', 10)),
      right: Math.max(0, parseInt(right || '0', 10)),
    };
    if (cropScope === 'single') {
      pageCrops[activePage] = crop;
    } else {
      globalCrop = crop;
      Object.keys(pageCrops).forEach(p => {
        pageCrops[p] = { ...crop };
      });
    }
    modified = true;
    updateOverlays();
  }

  // Helper: parse excluded pages
  function getExcludedPages() {
    const set = new Set();
    if (!wmExclude) return set;
    const items = wmExclude.split(',').map(s => s.trim()).filter(Boolean);
    for (const it of items) {
      if (it.includes('-')) {
        const [start, end] = it.split('-').map(n => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) set.add(i);
        }
      } else {
        const n = parseInt(it, 10);
        if (!isNaN(n)) set.add(n);
      }
    }
    return set;
  }

  function isPageExcluded(p) {
    return getExcludedPages().has(p);
  }

  function togglePageExclusion(p) {
    const excluded = getExcludedPages();
    if (excluded.has(p)) {
      excluded.delete(p);
    } else {
      excluded.add(p);
    }
    wmExclude = Array.from(excluded).sort((a, b) => a - b).join(', ');
    modified = true;
    updateExclusionUI();
    updateOverlays();
  }

  // Initial Full Render (only on mount or when loading a new file)
  function renderInitialShell() {
    const livePages = pageOrder.filter(p => !deletedPages.has(p));

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">${options.title || (
              activeTab === 'watermark' && wmType === 'draw' ? 'Sign PDF — Digital Signature' :
              activeTab === 'watermark' ? 'Watermark PDF — Text & Image Stamps' :
              activeTab === 'crop' ? 'Crop PDF — Custom Margins & Trim' :
              activeTab === 'numbers' ? 'Number PDF Pages — Headers & Footers' :
              activeTab === 'protect' ? 'Protect PDF — Password Encryption' :
              activeTab === 'organize' ? 'Organize & Rotate PDF Pages' : 'Page Editor'
            )}</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              ${options.subtitle || (
                activeTab === 'watermark' && wmType === 'draw' ? 'Draw, stamp, or place transparent signatures with 9-point grid alignment' :
                activeTab === 'watermark' ? 'Apply customizable text or logo watermarks with opacity and rotation control' :
                activeTab === 'crop' ? 'Visually trim page margins, scanner borders, or crop to custom box dimensions' :
                activeTab === 'numbers' ? 'Insert clean headers or footers with Page X of Y format and cover page exclusion' :
                activeTab === 'protect' ? 'Add password protection and standard 128-bit security to confidential files' :
                activeTab === 'organize' ? 'Rotate pages 90°, drag to reorder, or delete unnecessary pages' :
                'Two-section workspace: Top box shows live preview · Bottom box is where you edit the page'
              )}
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDEBAR: File Upload & Document Summary -->
            <aside class="tool-sidebar">
              <div class="drop-zone drop-zone--compact" id="pages-drop">
                <div class="drop-zone__icon">${icon('upload', 32)}</div>
                <p class="drop-zone__title">${file ? 'Replace PDF' : 'Upload PDF'}</p>
                <p class="drop-zone__subtitle">Drop a PDF here or browse</p>
                <label class="drop-zone__browse" for="pages-input">${file ? 'Change File' : 'Choose PDF'}</label>
                <input type="file" id="pages-input" accept=".pdf,application/pdf" />
              </div>

              ${file ? `
                <div class="tool-sidebar__card" style="padding:var(--space-3)">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start">
                    <div style="min-width:0; flex:1">
                      <span style="font-size:10px; font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                        Active Document
                      </span>
                      <div style="font-weight:var(--weight-semibold); font-size:var(--text-xs); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px">
                        ${sanitizeFilename(file.name)}
                      </div>
                      <div style="font-size:11px; color:var(--color-text-tertiary); margin-top:2px">
                        <strong id="sidebar-live-count">${livePages.length}</strong> of ${pageCount} pages active
                      </div>
                    </div>
                    <span id="sidebar-edit-badge" style="background:rgba(99,102,241,0.1); color:var(--color-primary); font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; display:${modified ? 'inline-block' : 'none'}">
                      Edited
                    </span>
                  </div>
                </div>

                <!-- Page Quick-Jump List -->
                <div class="tool-sidebar__card" style="padding:var(--space-3); max-height:220px; overflow-y:auto">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                    <span style="font-size:10px; font-weight:var(--weight-bold); text-transform:uppercase; color:var(--color-text-secondary)">
                      Pages
                    </span>
                    <span style="font-size:10px; color:var(--color-text-tertiary)">
                      Click to inspect
                    </span>
                  </div>
                  <div class="page-quick-list" id="sidebar-page-list" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px">
                    <!-- Rendered by updateSidebarPages() -->
                  </div>
                </div>

                <!-- Primary Export Action -->
                <div style="display:flex; flex-direction:column; gap:var(--space-2)">
                  <button class="btn btn-primary btn-lg" id="pm-save-btn" style="width:100%; justify-content:center">
                    ${icon('save', 18)} Save & Export PDF
                  </button>
                  <p style="font-size:11px; color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:4px; margin:0">
                    ${icon('shieldCheck', 12)} Client-Side Processing · Zero Server Uploads
                  </p>
                </div>
              ` : ''}

              <div id="pages-error" style="display:none"></div>
            </aside>

            <!-- RIGHT WORK SITE: TWO DISTINCT SECTIONS -->
            <main class="tool-worksite" id="pages-worksite" style="display:flex; flex-direction:column; gap:var(--space-4)">
              ${!file ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('layers', 48)}</div>
                  <h3 class="worksite-empty__title">PDF Page Editor Workspace</h3>
                  <p class="worksite-empty__desc">
                    Upload a PDF document to begin. The workspace provides a <strong>Live Preview</strong> in the top box and an <strong>Editing Workbench</strong> in the bottom box.
                  </p>
                </div>
              ` : `
                <!-- ============================================== -->
                <!-- SECTION 1: TOP BOX — LIVE PREVIEW SECTION     -->
                <!-- ============================================== -->
                <section class="worksite-box worksite-box--top-preview" style="display:flex; flex-direction:column; min-height:440px; flex:1">
                  <div class="worksite-box__header" style="border-bottom:1px solid var(--color-border); padding:var(--space-3) var(--space-4); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px">
                    <div class="worksite-box__header-left" style="display:flex; align-items:center; gap:var(--space-2)">
                      <span class="worksite-box__badge" style="background:var(--color-primary); color:#fff; font-weight:600; padding:2px 8px; border-radius:4px; font-size:11px">
                        Live Preview
                      </span>
                      <span style="font-weight:600; font-size:var(--text-sm)" id="header-page-title">
                        Page ${activePage} of ${pageCount}
                      </span>
                      
                      <!-- Watermark Exclusion Status Toggle on Header -->
                      <button class="btn btn-sm btn-ghost" id="btn-toggle-exclude-active" style="padding:2px 8px; font-size:11px">
                        ✓ Watermark Active
                      </button>

                      <span id="header-rot-badge" style="font-size:11px; color:var(--color-accent); background:rgba(99,102,241,0.08); padding:1px 6px; border-radius:4px; display:none"></span>
                      <span id="preview-loading-indicator" style="font-size:11px; color:var(--color-text-tertiary); display:none">
                        Rendering...
                      </span>
                    </div>

                    <div class="worksite-box__header-right" style="display:flex; align-items:center; gap:var(--space-2)">
                      <button class="btn btn-ghost btn-sm" id="prev-page-btn" ${activePage <= 1 ? 'disabled' : ''} title="Previous Page">
                        ${icon('chevronLeft', 14)} Prev
                      </button>
                      <button class="btn btn-ghost btn-sm" id="next-page-btn" ${activePage >= pageCount ? 'disabled' : ''} title="Next Page">
                        Next ${icon('chevronRight', 14)}
                      </button>

                      <div style="width:1px; height:18px; background:var(--color-border); margin:0 4px"></div>

                      <button class="btn btn-ghost btn-sm" id="zoom-out-btn" title="Zoom Out" style="padding:4px 8px">
                        ${icon('minus', 14)}
                      </button>
                      <span style="font-size:11px; color:var(--color-text-secondary); min-width:38px; text-align:center" id="zoom-label">
                        ${Math.round(previewZoom * 100)}%
                      </span>
                      <button class="btn btn-ghost btn-sm" id="zoom-in-btn" title="Zoom In" style="padding:4px 8px">
                        ${icon('plus', 14)}
                      </button>
                    </div>
                  </div>

                  <!-- Canvas Preview Viewport -->
                  <div class="preview-viewport" id="preview-viewport" style="display:flex; align-items:center; justify-content:center; padding:var(--space-3); background:var(--color-bg-tertiary); overflow:auto; position:relative; height:clamp(260px, 40vh, 440px); min-height:240px">
                    <div class="canvas-container" id="canvas-container" style="position:relative; display:inline-block; box-shadow:0 8px 24px rgba(0,0,0,0.12); border-radius:4px; line-height:0">
                      <canvas id="main-preview-canvas" style="display:block; border-radius:4px; background:#fff"></canvas>
                      
                      <!-- Overlay Host Containers -->
                      <div id="live-watermark-overlay"></div>
                      <div id="live-number-overlay"></div>
                      <div id="live-crop-overlay"></div>
                    </div>
                  </div>

                  <!-- Horizontal Page Filmstrip Dock (Zero-Scroll Page Jumper) -->
                  <div class="page-filmstrip-bar" id="page-filmstrip-bar">
                    <div class="page-filmstrip-header">
                      <div style="display:flex; align-items:center; gap:6px">
                        <span>${icon('layers', 12)} Quick Page Filmstrip</span>
                        <span style="font-size:10px; color:var(--color-text-tertiary); font-weight:normal" id="filmstrip-page-count">(${livePages.length} active pages)</span>
                      </div>
                      <div style="display:flex; align-items:center; gap:8px">
                        <span style="font-size:10px; color:var(--color-text-tertiary)">Click page to jump</span>
                        <button class="btn btn-ghost btn-sm" id="btn-toggle-grid-mode" style="font-size:11px; padding:2px 8px; height:24px" title="Toggle Full Page Grid View">
                          ${icon('grid', 12)} <span id="toggle-grid-label">Full Page Grid</span>
                        </button>
                      </div>
                    </div>
                    <div class="page-filmstrip-track" id="page-filmstrip-track">
                      <!-- Rendered by updateFilmstrip() -->
                    </div>
                  </div>
                </section>

                <!-- ============================================== -->
                <!-- SECTION 2: BOTTOM BOX — EDIT THE PAGE SECTION -->
                <!-- ============================================== -->
                <section class="worksite-box worksite-box--bottom-editor" id="worksite-bottom-editor" style="border:1px solid var(--color-border); background:var(--color-bg-secondary)">
                  <div style="padding:var(--space-3) var(--space-4); border-bottom:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2)">
                    <div style="display:flex; align-items:center; gap:var(--space-2)">
                      <span class="worksite-box__badge" style="background:#22c55e; color:#fff; font-weight:600; padding:2px 8px; border-radius:4px; font-size:11px">
                        Edit
                      </span>
                      <span style="font-weight:var(--weight-bold); font-size:var(--text-sm)">
                        Editing Workbench
                      </span>
                    </div>

                    <!-- 5 Main Editing Feature Tabs -->
                    <div class="editor-tabs-bar" style="display:flex; gap:4px; background:var(--color-bg-tertiary); padding:3px; border-radius:var(--radius-md); border:1px solid var(--color-border)">
                      <button class="editor-tab-pill ${activeTab === 'watermark' ? 'editor-tab-pill--active' : ''}" data-tab="watermark">
                        ${icon('stamp', 14)}
                        <span>Watermark & Signature</span>
                      </button>
                      <button class="editor-tab-pill ${activeTab === 'crop' ? 'editor-tab-pill--active' : ''}" data-tab="crop">
                        ${icon('crop', 14)}
                        <span>Crop Margins</span>
                      </button>
                      <button class="editor-tab-pill ${activeTab === 'organize' ? 'editor-tab-pill--active' : ''}" data-tab="organize">
                        ${icon('layers', 14)}
                        <span>Organize Pages</span>
                      </button>
                      <button class="editor-tab-pill ${activeTab === 'numbers' ? 'editor-tab-pill--active' : ''}" data-tab="numbers">
                        ${icon('hash', 14)}
                        <span>Page Numbers</span>
                      </button>
                      <button class="editor-tab-pill ${activeTab === 'protect' ? 'editor-tab-pill--active' : ''}" data-tab="protect">
                        ${icon('lock', 14)}
                        <span>Password Lock</span>
                      </button>
                    </div>
                  </div>

                  <!-- Tab Panels (Kept in DOM, toggled via display for 0 lag) -->
                  <div id="tab-panel-watermark" class="tab-panel" style="padding:var(--space-4); display:${activeTab === 'watermark' ? 'block' : 'none'}">
                    ${getWatermarkPanelHtml()}
                  </div>

                  <div id="tab-panel-crop" class="tab-panel" style="padding:var(--space-4); display:${activeTab === 'crop' ? 'block' : 'none'}">
                    ${getCropPanelHtml()}
                  </div>

                  <div id="tab-panel-organize" class="tab-panel" style="padding:var(--space-4); display:${activeTab === 'organize' ? 'block' : 'none'}">
                    ${getOrganizePanelHtml()}
                  </div>

                  <div id="tab-panel-numbers" class="tab-panel" style="padding:var(--space-4); display:${activeTab === 'numbers' ? 'block' : 'none'}">
                    ${getNumbersPanelHtml()}
                  </div>

                  <div id="tab-panel-protect" class="tab-panel" style="padding:var(--space-4); display:${activeTab === 'protect' ? 'block' : 'none'}">
                    ${getProtectPanelHtml()}
                  </div>
                </section>
              `}
            </main>

          </div>
        </div>
        ${renderAdSlot('banner', 'workspaceBottom')}
      </div>
    `;

    bindAllEvents();
    if (file && pdfDoc) {
      updateSidebarPages();
      updateFilmstrip();
      updateHeaderInfo();
      renderPreviewCanvas();
      updateOverlays();
      if (wmType === 'draw') initSignaturePad();
    }
  }

  // --- TAB PANELS HTML BUILDERS ---

  function getWatermarkPanelHtml() {
    return `
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:var(--space-4)">
        <div style="display:flex; flex-direction:column; gap:10px">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
              Signature & Watermark Type
            </span>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer">
              <input type="checkbox" id="chk-enable-wm" ${enableWatermark ? 'checked' : ''} />
              <strong>Apply to Document</strong>
            </label>
          </div>

          <div class="segmented-control" style="display:flex; background:var(--color-bg-tertiary); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:2px">
            <button class="seg-btn ${wmType === 'draw' ? 'active' : ''}" id="wm-btn-type-draw" style="flex:1; border:none; padding:5px 6px; font-size:11px; border-radius:4px; cursor:pointer">
              ✍️ Draw Signature
            </button>
            <button class="seg-btn ${wmType === 'image' ? 'active' : ''}" id="wm-btn-type-image" style="flex:1; border:none; padding:5px 6px; font-size:11px; border-radius:4px; cursor:pointer">
              🖼️ Upload Image
            </button>
            <button class="seg-btn ${wmType === 'text' ? 'active' : ''}" id="wm-btn-type-text" style="flex:1; border:none; padding:5px 6px; font-size:11px; border-radius:4px; cursor:pointer">
              🔤 Text Watermark
            </button>
          </div>

          <!-- DRAW SIGNATURE SECTION -->
          <div id="wm-mode-draw" style="display:${wmType === 'draw' ? 'block' : 'none'}">
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:var(--space-3); background:var(--color-bg-primary); display:flex; flex-direction:column; gap:8px">
              <div style="display:flex; justify-content:space-between; align-items:center">
                <span style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">
                  Draw signature below (Mouse / Touch / Stylus):
                </span>
                <div style="display:flex; align-items:center; gap:6px">
                  <button class="ink-btn ${wmInkColor === '#1d4ed8' ? 'active' : ''}" data-color="#1d4ed8" style="width:16px; height:16px; border-radius:50%; background:#1d4ed8; border:2px solid ${wmInkColor === '#1d4ed8' ? '#000' : 'transparent'}; cursor:pointer" title="Blue Ink"></button>
                  <button class="ink-btn ${wmInkColor === '#111827' ? 'active' : ''}" data-color="#111827" style="width:16px; height:16px; border-radius:50%; background:#111827; border:2px solid ${wmInkColor === '#111827' ? '#6366f1' : 'transparent'}; cursor:pointer" title="Black Ink"></button>
                  <button class="btn btn-ghost btn-sm" id="btn-clear-sig" style="padding:2px 6px; font-size:10px">
                    Clear
                  </button>
                </div>
              </div>

              <div style="position:relative; width:100%; height:110px; background:#fff; border:1px dashed #cbd5e1; border-radius:4px; overflow:hidden">
                <canvas id="sig-pad" style="width:100%; height:100%; display:block; cursor:crosshair"></canvas>
                <div style="position:absolute; bottom:18px; left:12px; right:12px; height:1px; border-bottom:1px dashed #e2e8f0; pointer-events:none"></div>
                <span style="position:absolute; bottom:4px; right:12px; font-size:9px; color:#94a3b8; pointer-events:none">Sign on line</span>
              </div>
            </div>
          </div>

          <!-- UPLOAD IMAGE SECTION -->
          <div id="wm-mode-image" style="display:${wmType === 'image' ? 'block' : 'none'}">
            <div style="border:1px dashed var(--color-border); border-radius:var(--radius-md); padding:var(--space-3); text-align:center; background:var(--color-bg-primary)">
              <input type="file" id="wm-img-input" accept="image/png,image/webp,image/jpeg" style="display:none" />
              <label for="wm-img-input" class="btn btn-secondary btn-sm" style="cursor:pointer; display:inline-flex; justify-content:center">
                ${icon('upload', 14)} Choose Signature PNG / WebP
              </label>
              <div id="wm-img-preview-box" style="margin-top:8px; display:${wmImagePreviewUrl ? 'flex' : 'none'}; align-items:center; justify-content:center; gap:8px">
                <img id="wm-img-thumb" src="${wmImagePreviewUrl || ''}" style="max-height:48px; max-width:120px; object-fit:contain; border:1px solid var(--color-border); border-radius:4px; padding:2px; background:#fff" alt="Signature" />
                <button class="btn btn-ghost btn-sm" id="wm-remove-img" style="color:var(--color-danger)">Remove</button>
              </div>
            </div>
          </div>

          <!-- TEXT WATERMARK SECTION -->
          <div id="wm-mode-text" style="display:${wmType === 'text' ? 'block' : 'none'}">
            <div style="display:flex; flex-direction:column; gap:4px">
              <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Watermark Text:</label>
              <input type="text" id="wm-text-val" value="${wmText}" class="form-input" style="font-size:12px; padding:6px 8px" />
            </div>
          </div>

          <!-- Exclude Pages Section -->
          <div style="background:var(--color-bg-primary); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); display:flex; flex-direction:column; gap:6px">
            <div style="display:flex; justify-content:space-between; align-items:center">
              <span style="font-size:11px; font-weight:700; color:var(--color-text-secondary); text-transform:uppercase">
                Exclude Pages from Watermark
              </span>
              <span style="font-size:10px; color:var(--color-text-tertiary)" id="wm-exclude-count">
                ${getExcludedPages().size} excluded
              </span>
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap">
              <button class="btn btn-secondary btn-sm" id="btn-exclude-cover" style="font-size:11px">
                ${isPageExcluded(1) ? '✓ Cover Excluded (Page 1)' : 'Exclude Cover (Page 1)'}
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-exclude-current" style="font-size:11px">
                Exclude / Include Page ${activePage}
              </button>
              <button class="btn btn-ghost btn-sm" id="btn-clear-exclusions" style="font-size:11px">
                Clear All
              </button>
            </div>

            <div style="display:flex; flex-direction:column; gap:2px; margin-top:2px">
              <label style="font-size:10px; color:var(--color-text-tertiary)">Custom exclusion list (e.g. 1, 3, 5-8):</label>
              <input type="text" id="wm-exclude-val" value="${wmExclude}" placeholder="e.g. 1, 3" class="form-input" style="font-size:11px; padding:4px 8px" />
            </div>
          </div>
        </div>

        <!-- Right Column: Adjustments & Positioning -->
        <div style="display:flex; flex-direction:column; gap:10px">
          <div style="display:flex; justify-content:space-between; align-items:center">
            <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
              Position & Adjustments
            </span>
            <span id="wm-drag-status-badge" style="font-size:10px; font-weight:700; color:#6366f1; background:rgba(99,102,241,0.1); padding:2px 6px; border-radius:4px; display:${wmCustomPos ? 'inline-block' : 'none'}">
              Custom Drag Active
            </span>
          </div>

          <div style="display:flex; gap:var(--space-3); align-items:center">
            <div>
              <label style="font-size:10px; font-weight:600; color:var(--color-text-secondary); display:block; margin-bottom:4px">
                9-Anchor Presets:
              </label>
              <div class="anchor-grid" style="width:96px; height:96px">
                ${['top-left', 'top-center', 'top-right', 'middle-left', 'center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
                  <button class="anchor-btn ${(!wmCustomPos && wmAnchor === pos) ? 'active' : ''}" data-anchor="${pos}" title="${pos}">
                    ${pos === 'center' ? '●' : '·'}
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="flex:1; display:flex; flex-direction:column; gap:6px">
              <div>
                <div style="display:flex; justify-content:space-between; font-size:10px">
                  <span>Opacity</span>
                  <span id="wm-lbl-opacity">${Math.round(wmOpacity * 100)}%</span>
                </div>
                <input type="range" id="wm-slider-opacity" min="0.05" max="1" step="0.05" value="${wmOpacity}" style="width:100%" />
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:10px">
                  <span>Scale</span>
                  <span id="wm-lbl-scale">${Math.round(wmScale * 100)}%</span>
                </div>
                <input type="range" id="wm-slider-scale" min="0.1" max="1.2" step="0.05" value="${wmScale}" style="width:100%" />
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:10px">
                  <span>Rotation</span>
                  <span id="wm-lbl-rot">${wmRotation}°</span>
                </div>
                <input type="range" id="wm-slider-rot" min="-90" max="90" step="15" value="${wmRotation}" style="width:100%" />
              </div>
            </div>
          </div>

          <div style="background:rgba(99,102,241,0.06); padding:8px; border-radius:6px; font-size:11px; color:var(--color-text-secondary); display:flex; align-items:center; gap:6px">
            ${icon('shieldCheck', 14)}
            <span>You can click & drag the watermark on the <strong>Top Preview</strong> anytime to place it anywhere!</span>
          </div>
        </div>
      </div>
    `;
  }

  function getCropPanelHtml() {
    const cur = getCurrentCrop();
    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3)">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
          <!-- Crop Scope Selector: All vs Single -->
          <div style="display:flex; align-items:center; gap:8px">
            <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
              Crop Mode:
            </span>
            <div class="segmented-control" style="display:inline-flex; background:var(--color-bg-tertiary); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:2px">
              <button class="seg-btn ${cropScope === 'all' ? 'active' : ''}" id="crop-scope-all" style="border:none; padding:4px 10px; font-size:11px; border-radius:4px; cursor:pointer">
                Apply to All Pages
              </button>
              <button class="seg-btn ${cropScope === 'single' ? 'active' : ''}" id="crop-scope-single" style="border:none; padding:4px 10px; font-size:11px; border-radius:4px; cursor:pointer">
                Page ${activePage} Only (Custom)
              </button>
            </div>
          </div>

          <div style="display:flex; gap:6px">
            <button class="btn btn-secondary btn-sm" id="crop-btn-36" style="font-size:11px">
              0.5 in Trim (36pt)
            </button>
            <button class="btn btn-secondary btn-sm" id="crop-btn-72" style="font-size:11px">
              1.0 in Trim (72pt)
            </button>
            <button class="btn btn-ghost btn-sm" id="crop-btn-reset" style="font-size:11px">
              Reset
            </button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:var(--space-3)">
          <div>
            <label style="font-size:10px; font-weight:600; color:var(--color-text-secondary)">Top Margin (pt):</label>
            <input type="number" id="crop-in-top" min="0" max="250" value="${cur.top}" class="form-input" style="font-size:11px; padding:4px 6px" />
          </div>
          <div>
            <label style="font-size:10px; font-weight:600; color:var(--color-text-secondary)">Bottom Margin (pt):</label>
            <input type="number" id="crop-in-bottom" min="0" max="250" value="${cur.bottom}" class="form-input" style="font-size:11px; padding:4px 6px" />
          </div>
          <div>
            <label style="font-size:10px; font-weight:600; color:var(--color-text-secondary)">Left Margin (pt):</label>
            <input type="number" id="crop-in-left" min="0" max="250" value="${cur.left}" class="form-input" style="font-size:11px; padding:4px 6px" />
          </div>
          <div>
            <label style="font-size:10px; font-weight:600; color:var(--color-text-secondary)">Right Margin (pt):</label>
            <input type="number" id="crop-in-right" min="0" max="250" value="${cur.right}" class="form-input" style="font-size:11px; padding:4px 6px" />
          </div>
        </div>

        <div style="background:rgba(59,130,246,0.06); padding:8px 12px; border-radius:6px; font-size:11px; color:var(--color-text-secondary); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px">
          <div style="display:flex; align-items:center; gap:6px">
            ${icon('crop', 14)}
            <span><strong>Live Canvas Crop:</strong> Drag the box to move it or drag any of the 8 blue handles on the <strong>Top Preview</strong> to resize in real-time.</span>
          </div>
          ${cropScope === 'single' ? `
            <button class="btn btn-secondary btn-sm" id="crop-btn-copy-all" style="font-size:10px; padding:2px 8px">
              Copy Page ${activePage} Crop to All Pages
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function getOrganizePanelHtml() {
    const livePages = pageOrder.filter(p => !deletedPages.has(p));
    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-3)">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2); background:var(--color-bg-primary); padding:var(--space-2) var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border)">
          <div style="display:flex; align-items:center; gap:6px">
            <span style="font-size:11px; font-weight:600; color:var(--color-text-secondary); text-transform:uppercase">
              Page ${activePage} Actions:
            </span>
            <button class="btn btn-secondary btn-sm" id="btn-rotate-cw">
              ${icon('rotateCw', 14)} Rotate 90°
            </button>
            <button class="btn btn-danger btn-sm" id="btn-delete-page">
              ${icon('trash', 14)} Delete Page
            </button>
          </div>

          <div style="display:flex; align-items:center; gap:6px">
            <button class="btn btn-ghost btn-sm" id="btn-rotate-all">
              ${icon('rotateCw', 14)} Rotate All Pages
            </button>
            <button class="btn btn-ghost btn-sm" id="btn-reset-order">
              Reset Order
            </button>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
            <span style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">
              Drag Thumbnails to Reorder · Click to Preview Page
            </span>
            <span style="font-size:11px; color:var(--color-text-tertiary)">
              ${livePages.length} active pages
            </span>
          </div>
          <div class="organize-thumbs-strip" id="organize-thumbs-strip" style="display:flex; gap:8px; overflow-x:auto; padding:6px 2px; min-height:120px; scrollbar-width:thin">
            <!-- Rendered by renderOrganizeThumbnails() -->
          </div>
        </div>
      </div>
    `;
  }

  function getNumbersPanelHtml() {
    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4)">
        <div style="display:flex; flex-direction:column; gap:10px">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
              Numbering Position & Style
            </span>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer">
              <input type="checkbox" id="chk-enable-numbers" ${enableNumbers ? 'checked' : ''} />
              <strong>Apply Numbers</strong>
            </label>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px">
            <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Position:</label>
            <select id="pn-select-pos" class="form-input" style="font-size:11px; padding:5px 8px">
              <option value="bottom-center" ${pnPosition === 'bottom-center' ? 'selected' : ''}>Bottom Center (Footer)</option>
              <option value="bottom-right" ${pnPosition === 'bottom-right' ? 'selected' : ''}>Bottom Right (Footer)</option>
              <option value="bottom-left" ${pnPosition === 'bottom-left' ? 'selected' : ''}>Bottom Left (Footer)</option>
              <option value="top-center" ${pnPosition === 'top-center' ? 'selected' : ''}>Top Center (Header)</option>
              <option value="top-right" ${pnPosition === 'top-right' ? 'selected' : ''}>Top Right (Header)</option>
              <option value="top-left" ${pnPosition === 'top-left' ? 'selected' : ''}>Top Left (Header)</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px">
            <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Numbering Format:</label>
            <select id="pn-select-fmt" class="form-input" style="font-size:11px; padding:5px 8px">
              <option value="Page {n} of {total}" ${pnFormat === 'Page {n} of {total}' ? 'selected' : ''}>Page 1 of ${pageCount}</option>
              <option value="{n} / {total}" ${pnFormat === '{n} / {total}' ? 'selected' : ''}>1 / ${pageCount}</option>
              <option value="{n}" ${pnFormat === '{n}' ? 'selected' : ''}>1 (Simple Number)</option>
              <option value="P. {n}" ${pnFormat === 'P. {n}' ? 'selected' : ''}>P. 1</option>
            </select>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px">
          <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
            Spacing & Cover Exclusion
          </span>

          <div style="display:flex; align-items:center; gap:8px">
            <input type="checkbox" id="pn-chk-cover" ${pnExcludeFirst ? 'checked' : ''} style="cursor:pointer" />
            <label for="pn-chk-cover" style="font-size:11px; cursor:pointer">
              <strong>Skip First Page (Cover Page)</strong>
            </label>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px">
            <div style="display:flex; justify-content:space-between; font-size:10px">
              <span>Margin Offset</span>
              <span id="pn-lbl-margin">${pnMargin} pt</span>
            </div>
            <input type="range" id="pn-slider-margin" min="10" max="60" step="5" value="${pnMargin}" style="width:100%" />
          </div>

          <div style="display:flex; flex-direction:column; gap:4px">
            <div style="display:flex; justify-content:space-between; font-size:10px">
              <span>Font Size</span>
              <span id="pn-lbl-size">${pnFontSize} pt</span>
            </div>
            <input type="range" id="pn-slider-size" min="8" max="18" step="1" value="${pnFontSize}" style="width:100%" />
          </div>
        </div>
      </div>
    `;
  }

  function getProtectPanelHtml() {
    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4); align-items:center">
        <div style="display:flex; flex-direction:column; gap:10px">
          <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary)">
            Set Document Password
          </span>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Password:</label>
            <input type="password" id="protect-pass-val" value="${protectPassword}" placeholder="Enter strong password" class="form-input" style="font-size:12px; padding:6px 8px" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:600; color:var(--color-text-secondary)">Confirm Password:</label>
            <input type="password" id="protect-confirm-val" value="${protectConfirm}" placeholder="Repeat password" class="form-input" style="font-size:12px; padding:6px 8px" />
          </div>
        </div>

        <div style="background:var(--color-bg-primary); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); font-size:11px; color:var(--color-text-secondary); display:flex; flex-direction:column; gap:6px">
          <div style="display:flex; align-items:center; gap:6px; color:var(--color-primary); font-weight:600">
            ${icon('lock', 16)} 128-bit Standard Encryption
          </div>
          <p style="margin:0">
            Protects the exported document. Anyone opening or printing the PDF will be required to provide this password.
          </p>
        </div>
      </div>
    `;
  }

  // --- FAST LIGHTWEIGHT DOM UPDATES (NO INNERHTML WIPING) ---

  function switchTab(newTab) {
    activeTab = newTab;

    // Update pill buttons
    container.querySelectorAll('.editor-tab-pill').forEach(btn => {
      btn.classList.toggle('editor-tab-pill--active', btn.getAttribute('data-tab') === newTab);
    });

    // Toggle panels
    ['watermark', 'crop', 'organize', 'numbers', 'protect'].forEach(t => {
      const p = container.querySelector(`#tab-panel-${t}`);
      if (p) p.style.display = (t === newTab) ? 'block' : 'none';
    });

    if (newTab === 'organize') renderOrganizeThumbnails();
    if (newTab === 'watermark' && wmType === 'draw') initSignaturePad();
    if (newTab === 'crop') syncCropInputValues();

    updateOverlays();
  }

  function syncCropInputValues() {
    const cur = getCurrentCrop();
    const t = container.querySelector('#crop-in-top');
    const b = container.querySelector('#crop-in-bottom');
    const l = container.querySelector('#crop-in-left');
    const r = container.querySelector('#crop-in-right');
    if (t) t.value = cur.top;
    if (b) b.value = cur.bottom;
    if (l) l.value = cur.left;
    if (r) r.value = cur.right;

    const singleBtn = container.querySelector('#crop-scope-single');
    if (singleBtn) singleBtn.textContent = `Page ${activePage} Only (Custom)`;
  }

  function setActivePage(p) {
    if (p < 1 || p > pageCount) return;
    activePage = p;
    updateHeaderInfo();
    updateSidebarActiveState();
    renderPreviewCanvas();
    updateOverlays();
    if (activeTab === 'crop') syncCropInputValues();
  }

  function updateHeaderInfo() {
    const title = container.querySelector('#header-page-title');
    if (title) title.textContent = `Page ${activePage} of ${pageCount}`;

    const prevBtn = container.querySelector('#prev-page-btn');
    if (prevBtn) prevBtn.disabled = (activePage <= 1);

    const nextBtn = container.querySelector('#next-page-btn');
    if (nextBtn) nextBtn.disabled = (activePage >= pageCount);

    const rotBadge = container.querySelector('#header-rot-badge');
    if (rotBadge) {
      if (rotations[activePage]) {
        rotBadge.style.display = 'inline-block';
        rotBadge.textContent = `Rotated ${rotations[activePage]}°`;
      } else {
        rotBadge.style.display = 'none';
      }
    }

    updateExclusionUI();
  }

  function updateExclusionUI() {
    const isEx = isPageExcluded(activePage);
    const btn = container.querySelector('#btn-toggle-exclude-active');
    if (btn) {
      btn.className = `btn btn-sm ${isEx ? 'btn-danger' : 'btn-ghost'}`;
      btn.textContent = isEx ? '⊘ Watermark Excluded' : '✓ Watermark Active';
    }

    const curBtn = container.querySelector('#btn-exclude-current');
    if (curBtn) {
      curBtn.className = `btn btn-sm ${isEx ? 'btn-danger' : 'btn-secondary'}`;
      curBtn.textContent = isEx ? `Include Page ${activePage}` : `Exclude Page ${activePage}`;
    }

    const covBtn = container.querySelector('#btn-exclude-cover');
    if (covBtn) {
      covBtn.textContent = isPageExcluded(1) ? '✓ Cover Excluded (Page 1)' : 'Exclude Cover (Page 1)';
    }

    const countEl = container.querySelector('#wm-exclude-count');
    if (countEl) countEl.textContent = `${getExcludedPages().size} excluded`;

    const exInput = container.querySelector('#wm-exclude-val');
    if (exInput && document.activeElement !== exInput) exInput.value = wmExclude;

    updateSidebarPages();
  }

  function updateSidebarActiveState() {
    container.querySelectorAll('.page-jump-btn').forEach(btn => {
      const p = parseInt(btn.getAttribute('data-page'), 10);
      btn.className = `btn btn-sm ${p === activePage ? 'btn-primary' : 'btn-secondary'} page-jump-btn`;
    });

    container.querySelectorAll('.filmstrip-card').forEach(card => {
      const p = parseInt(card.getAttribute('data-page'), 10);
      const isAct = p === activePage;
      card.classList.toggle('filmstrip-card--active', isAct);
      if (isAct) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function updateSidebarPages() {
    const list = container.querySelector('#sidebar-page-list');
    if (!list) return;

    const livePages = pageOrder.filter(p => !deletedPages.has(p));
    list.innerHTML = livePages.map(p => {
      const pEx = isPageExcluded(p);
      return `
        <button class="btn btn-sm ${p === activePage ? 'btn-primary' : 'btn-secondary'} page-jump-btn" data-page="${p}" style="padding:4px 0; font-size:11px; justify-content:center; position:relative" title="Page ${p}${pEx ? ' (Watermark Excluded)' : ''}">
          ${p}
          ${pEx ? `<span style="position:absolute; top:1px; right:2px; font-size:8px; color:#ef4444" title="Excluded">⊘</span>` : ''}
        </button>
      `;
    }).join('');

    // Re-bind sidebar click
    list.querySelectorAll('.page-jump-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setActivePage(parseInt(btn.getAttribute('data-page'), 10));
      });
    });

    updateFilmstrip();
  }

  function updateFilmstrip() {
    const track = container.querySelector('#page-filmstrip-track');
    const countEl = container.querySelector('#filmstrip-page-count');
    if (!track) return;

    const livePages = pageOrder.filter(p => !deletedPages.has(p));
    if (countEl) countEl.textContent = `(${livePages.length} active pages)`;

    track.innerHTML = livePages.map(p => {
      const isActive = p === activePage;
      const pEx = isPageExcluded(p);
      return `
        <div class="filmstrip-card ${isActive ? 'filmstrip-card--active' : ''}" data-page="${p}" style="position:relative">
          <div class="filmstrip-card__thumb" id="filmstrip-thumb-${p}">
            <span style="font-size:11px; font-weight:700; color:var(--color-text-tertiary)">${p}</span>
          </div>
          <span class="filmstrip-card__num">P. ${p}</span>
          ${pEx ? `<span style="position:absolute; top:2px; right:4px; font-size:9px; color:#ef4444" title="Watermark Excluded">⊘</span>` : ''}
        </div>
      `;
    }).join('');

    track.querySelectorAll('.filmstrip-card').forEach(card => {
      card.addEventListener('click', () => {
        setActivePage(parseInt(card.getAttribute('data-page'), 10));
      });
    });

    // Lazy load thumbnails for filmstrip items if pdfDoc exists
    if (pdfDoc) {
      livePages.forEach(p => {
        const thumbBox = track.querySelector(`#filmstrip-thumb-${p}`);
        if (!thumbBox) return;
        const cacheKey = `${p}_${rotations[p] || 0}`;
        if (thumbCache.has(cacheKey)) {
          thumbBox.replaceChildren(thumbCache.get(cacheKey).cloneNode(true));
        } else {
          generateThumbnail(pdfDoc, p, 70, rotations[p] || 0).then(thumbCanvas => {
            thumbCache.set(cacheKey, thumbCanvas);
            const box = track.querySelector(`#filmstrip-thumb-${p}`);
            if (box) box.replaceChildren(thumbCanvas.cloneNode(true));
          }).catch(() => {});
        }
      });
    }
  }

  // --- FAST OVERLAY UPDATES ---

  function updateOverlays() {
    const wmContainer = container.querySelector('#live-watermark-overlay');
    const numContainer = container.querySelector('#live-number-overlay');
    const cropContainer = container.querySelector('#live-crop-overlay');

    // 1. Watermark overlay
    if (wmContainer) {
      wmContainer.innerHTML = '';
      const isExcluded = isPageExcluded(activePage);

      if (enableWatermark || activeTab === 'watermark') {
        let leftStyle = '50%';
        let topStyle = '50%';
        let transformStyle = 'translate(-50%, -50%)';

        if (wmCustomPos && typeof wmCustomPos.xPct === 'number') {
          leftStyle = `${(wmCustomPos.xPct * 100).toFixed(2)}%`;
          topStyle = `${(wmCustomPos.yPct * 100).toFixed(2)}%`;
          transformStyle = 'none';
        } else {
          const margin = `${wmMargin}px`;
          switch (wmAnchor) {
            case 'top-left': topStyle = margin; leftStyle = margin; transformStyle = 'none'; break;
            case 'top-center': topStyle = margin; leftStyle = '50%'; transformStyle = 'translateX(-50%)'; break;
            case 'top-right': topStyle = margin; leftStyle = 'auto'; transformStyle = 'none'; break;
            case 'middle-left': topStyle = '50%'; leftStyle = margin; transformStyle = 'translateY(-50%)'; break;
            case 'center': topStyle = '50%'; leftStyle = '50%'; transformStyle = 'translate(-50%, -50%)'; break;
            case 'middle-right': topStyle = '50%'; leftStyle = 'auto'; transformStyle = 'translateY(-50%)'; break;
            case 'bottom-left': topStyle = 'auto'; leftStyle = margin; transformStyle = 'none'; break;
            case 'bottom-center': topStyle = 'auto'; leftStyle = '50%'; transformStyle = 'translateX(-50%)'; break;
            case 'bottom-right': topStyle = 'auto'; leftStyle = 'auto'; transformStyle = 'none'; break;
          }
        }

        const isRightAligned = !wmCustomPos && wmAnchor.includes('right');
        const isBottomAligned = !wmCustomPos && wmAnchor.includes('bottom');
        const rightStyle = isRightAligned ? `${wmMargin}px` : 'auto';
        const bottomStyle = isBottomAligned ? `${wmMargin}px` : 'auto';

        let innerContent = '';
        if ((wmType === 'image' || wmType === 'draw') && wmImagePreviewUrl) {
          innerContent = `
            <img src="${wmImagePreviewUrl}" draggable="false" style="width:100%; height:auto; display:block; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2))" alt="Signature" />
          `;
        } else if (wmType === 'text' && wmText) {
          innerContent = `
            <div style="color:#1e293b; font-weight:800; font-size:${Math.max(12, Math.round(20 * wmScale))}px; white-space:nowrap; padding:2px 8px; text-shadow:0 1px 2px rgba(255,255,255,0.8)">
              ${wmText}
            </div>
          `;
        }

        if (innerContent) {
          wmContainer.innerHTML = `
            <div class="draggable-watermark-item ${isExcluded ? 'watermark-item--excluded' : ''}" 
                 id="draggable-watermark"
                 style="position:absolute; top:${topStyle}; left:${leftStyle}; right:${rightStyle}; bottom:${bottomStyle}; transform:${transformStyle} rotate(${wmRotation}deg); opacity:${isExcluded ? 0.35 : wmOpacity}; cursor:grab; pointer-events:auto; user-select:none; touch-action:none; z-index:20; max-width:${Math.round(wmScale * 70)}%; border:${isExcluded ? '2px dashed #ef4444' : '1.5px dashed #6366f1'}; border-radius:4px; padding:2px; background:${isExcluded ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)'}">
              ${innerContent}
              <div style="position:absolute; top:-18px; left:0; font-size:9px; font-weight:700; background:${isExcluded ? '#ef4444' : '#6366f1'}; color:#fff; padding:1px 6px; border-radius:3px; white-space:nowrap; pointer-events:none">
                ${isExcluded ? 'Excluded on Page ' + activePage : 'Drag to Move'}
              </div>
            </div>
          `;
          bindWatermarkDragging();
        }
      }
    }

    // 2. Page numbers overlay
    if (numContainer) {
      numContainer.innerHTML = '';
      if ((enableNumbers || activeTab === 'numbers') && !(pnExcludeFirst && activePage === 1)) {
        const label = pnFormat.replace('{n}', activePage).replace('{total}', pageCount);
        let style = `position:absolute; font-size:${pnFontSize}px; color:#444; font-weight:600; pointer-events:none; z-index:10; background:rgba(255,255,255,0.8); padding:1px 6px; border-radius:3px;`;

        switch (pnPosition) {
          case 'top-left': style += `top:${pnMargin}px; left:${pnMargin}px;`; break;
          case 'top-center': style += `top:${pnMargin}px; left:50%; transform:translateX(-50%);`; break;
          case 'top-right': style += `top:${pnMargin}px; right:${pnMargin}px;`; break;
          case 'bottom-left': style += `bottom:${pnMargin}px; left:${pnMargin}px;`; break;
          case 'bottom-center': style += `bottom:${pnMargin}px; left:50%; transform:translateX(-50%);`; break;
          case 'bottom-right': style += `bottom:${pnMargin}px; right:${pnMargin}px;`; break;
        }

        numContainer.innerHTML = `<div style="${style}">${label}</div>`;
      }
    }

    // 3. Crop overlay
    if (cropContainer) {
      cropContainer.innerHTML = '';
      const canvas = container.querySelector('#main-preview-canvas');
      const canvasW = (canvas && (canvas.offsetWidth || canvas.width)) || 600;
      const canvasH = (canvas && (canvas.offsetHeight || canvas.height)) || 800;
      const cur = getCurrentCrop();

      if (activeTab === 'crop') {
        const topPx = Math.round(cur.top * previewZoom);
        const bottomPx = Math.round(cur.bottom * previewZoom);
        const leftPx = Math.round(cur.left * previewZoom);
        const rightPx = Math.round(cur.right * previewZoom);
        const boxWPx = Math.max(20, canvasW - leftPx - rightPx);
        const boxHPx = Math.max(20, canvasH - topPx - bottomPx);
        const curCropWPt = Math.round(boxWPx / previewZoom);
        const curCropHPt = Math.round(boxHPx / previewZoom);

        cropContainer.innerHTML = `
          <!-- 4 Dark Vignette Masks -->
          <div id="crop-mask-top" class="crop-mask-block" style="top:0; left:0; right:0; height:${topPx}px"></div>
          <div id="crop-mask-bottom" class="crop-mask-block" style="bottom:0; left:0; right:0; height:${bottomPx}px"></div>
          <div id="crop-mask-left" class="crop-mask-block" style="top:${topPx}px; bottom:${bottomPx}px; left:0; width:${leftPx}px"></div>
          <div id="crop-mask-right" class="crop-mask-block" style="top:${topPx}px; bottom:${bottomPx}px; right:0; width:${rightPx}px"></div>

          <!-- Interactive Crop Box with Grid & Handles -->
          <div id="interactive-crop-box" class="crop-box-interactive" style="top:${topPx}px; left:${leftPx}px; width:${boxWPx}px; height:${boxHPx}px">
            <!-- Rule-of-thirds grid -->
            <div class="crop-grid-h" style="top:33.333%"></div>
            <div class="crop-grid-h" style="top:66.666%"></div>
            <div class="crop-grid-v" style="left:33.333%"></div>
            <div class="crop-grid-v" style="left:66.666%"></div>

            <!-- Central Crop Info Pill -->
            <div class="crop-info-pill" id="crop-info-pill">
              <span>${curCropWPt} × ${curCropHPt} pt</span>
              <span style="opacity:0.5">·</span>
              <span>Trim: L:${cur.left} T:${cur.top} R:${cur.right} B:${cur.bottom}</span>
            </div>

            <!-- 8 Resizing Handles -->
            <div class="crop-handle crop-handle--nw" data-handle="nw" title="Resize Top-Left"></div>
            <div class="crop-handle crop-handle--n" data-handle="n" title="Resize Top"></div>
            <div class="crop-handle crop-handle--ne" data-handle="ne" title="Resize Top-Right"></div>
            <div class="crop-handle crop-handle--e" data-handle="e" title="Resize Right"></div>
            <div class="crop-handle crop-handle--se" data-handle="se" title="Resize Bottom-Right"></div>
            <div class="crop-handle crop-handle--s" data-handle="s" title="Resize Bottom"></div>
            <div class="crop-handle crop-handle--sw" data-handle="sw" title="Resize Bottom-Left"></div>
            <div class="crop-handle crop-handle--w" data-handle="w" title="Resize Left"></div>
          </div>
        `;

        bindCropDragging();
      } else {
        // Passive indicator when viewing other tabs (watermark, numbers, organize)
        if (cur.top > 0 || cur.bottom > 0 || cur.left > 0 || cur.right > 0) {
          const topPx = Math.round(cur.top * previewZoom);
          const bottomPx = Math.round(cur.bottom * previewZoom);
          const leftPx = Math.round(cur.left * previewZoom);
          const rightPx = Math.round(cur.right * previewZoom);

          cropContainer.innerHTML = `
            <div style="position:absolute; top:${topPx}px; bottom:${bottomPx}px; left:${leftPx}px; right:${rightPx}px; border:2px dashed #f59e0b; background:rgba(245,158,11,0.06); pointer-events:none; z-index:10; display:flex; align-items:center; justify-content:center">
              <span style="font-size:10px; font-weight:700; color:#d97706; background:rgba(255,255,255,0.92); padding:2px 8px; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,0.1)">
                ${cropScope === 'single' ? `Page ${activePage} Crop` : 'All Pages Crop'} (${cur.left}L, ${cur.top}T, ${cur.right}R, ${cur.bottom}B pt)
              </span>
            </div>
          `;
        }
      }
    }
  }

  // --- DRAG & DROP POSITIONING ON CANVAS ---

  function bindWatermarkDragging() {
    const wmEl = container.querySelector('#draggable-watermark');
    const canvasWrap = container.querySelector('#canvas-container');
    if (!wmEl || !canvasWrap) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      wmEl.setPointerCapture(e.pointerId);
      wmEl.style.cursor = 'grabbing';

      const wrapRect = canvasWrap.getBoundingClientRect();
      const elRect = wmEl.getBoundingClientRect();

      startX = e.clientX;
      startY = e.clientY;
      initialLeft = elRect.left - wrapRect.left;
      initialTop = elRect.top - wrapRect.top;

      e.stopPropagation();
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;

      const wrapRect = canvasWrap.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newLeft = initialLeft + deltaX;
      let newTop = initialTop + deltaY;

      const maxLeft = Math.max(0, wrapRect.width - wmEl.offsetWidth);
      const maxTop = Math.max(0, wrapRect.height - wmEl.offsetHeight);

      newLeft = Math.max(0, Math.min(maxLeft, newLeft));
      newTop = Math.max(0, Math.min(maxTop, newTop));

      const xPct = wrapRect.width > 0 ? (newLeft / wrapRect.width) : 0;
      const yPct = wrapRect.height > 0 ? (newTop / wrapRect.height) : 0;

      wmCustomPos = { xPct, yPct };

      wmEl.style.left = `${newLeft}px`;
      wmEl.style.top = `${newTop}px`;
      wmEl.style.right = 'auto';
      wmEl.style.bottom = 'auto';
      wmEl.style.transform = `rotate(${wmRotation}deg)`;

      const badge = container.querySelector('#wm-drag-status-badge');
      if (badge) badge.style.display = 'inline-block';

      container.querySelectorAll('.anchor-btn').forEach(b => b.classList.remove('active'));
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try { wmEl.releasePointerCapture(e.pointerId); } catch (err) {}
      wmEl.style.cursor = 'grab';
      modified = true;
      showEditedBadge();
    };

    wmEl.addEventListener('pointerdown', onPointerDown);
    wmEl.addEventListener('pointermove', onPointerMove);
    wmEl.addEventListener('pointerup', onPointerUp);
    wmEl.addEventListener('pointercancel', onPointerUp);
  }

  function bindCropDragging() {
    const cropBox = container.querySelector('#interactive-crop-box');
    const canvasWrap = container.querySelector('#canvas-container');
    const canvas = container.querySelector('#main-preview-canvas');
    if (!cropBox || !canvasWrap || !canvas) return;

    const maskTop = container.querySelector('#crop-mask-top');
    const maskBottom = container.querySelector('#crop-mask-bottom');
    const maskLeft = container.querySelector('#crop-mask-left');
    const maskRight = container.querySelector('#crop-mask-right');
    const pill = container.querySelector('#crop-info-pill');
    const inTop = container.querySelector('#crop-in-top');
    const inBottom = container.querySelector('#crop-in-bottom');
    const inLeft = container.querySelector('#crop-in-left');
    const inRight = container.querySelector('#crop-in-right');

    let isDragging = false;
    let dragType = ''; // 'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w'|'move'
    let startX = 0, startY = 0;
    let startTopPt = 0, startBottomPt = 0, startLeftPt = 0, startRightPt = 0;
    let canvasWidthPx = 0, canvasHeightPx = 0;
    let pageWidthPt = 0, pageHeightPt = 0;
    let activePointerId = null;

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      
      const handle = e.target.closest('.crop-handle');
      if (handle) {
        dragType = handle.getAttribute('data-handle');
      } else if (e.target.closest('#interactive-crop-box')) {
        dragType = 'move';
      } else {
        return;
      }

      isDragging = true;
      activePointerId = e.pointerId;
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}

      startX = e.clientX;
      startY = e.clientY;

      const cur = getCurrentCrop();
      startTopPt = cur.top || 0;
      startBottomPt = cur.bottom || 0;
      startLeftPt = cur.left || 0;
      startRightPt = cur.right || 0;

      canvasWidthPx = canvas.offsetWidth || canvas.width || 600;
      canvasHeightPx = canvas.offsetHeight || canvas.height || 800;
      pageWidthPt = canvasWidthPx / previewZoom;
      pageHeightPt = canvasHeightPx / previewZoom;

      if (dragType === 'move') {
        cropBox.style.cursor = 'grabbing';
      }

      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;

      const deltaXPt = (e.clientX - startX) / previewZoom;
      const deltaYPt = (e.clientY - startY) / previewZoom;

      const minDimPt = 36; // At least 0.5 in (36 pt) visible

      let newTop = startTopPt;
      let newBottom = startBottomPt;
      let newLeft = startLeftPt;
      let newRight = startRightPt;

      if (dragType === 'move') {
        const boxWidthPt = pageWidthPt - startLeftPt - startRightPt;
        const boxHeightPt = pageHeightPt - startTopPt - startBottomPt;

        const maxLeft = Math.max(0, pageWidthPt - boxWidthPt);
        const maxTop = Math.max(0, pageHeightPt - boxHeightPt);

        newLeft = Math.max(0, Math.min(maxLeft, startLeftPt + deltaXPt));
        newRight = pageWidthPt - boxWidthPt - newLeft;

        newTop = Math.max(0, Math.min(maxTop, startTopPt + deltaYPt));
        newBottom = pageHeightPt - boxHeightPt - newTop;
      } else {
        // Resize by dragging handles
        if (dragType.includes('w')) {
          const maxLeft = pageWidthPt - startRightPt - minDimPt;
          newLeft = Math.max(0, Math.min(maxLeft, startLeftPt + deltaXPt));
        }
        if (dragType.includes('e')) {
          const maxRight = pageWidthPt - startLeftPt - minDimPt;
          newRight = Math.max(0, Math.min(maxRight, startRightPt - deltaXPt));
        }
        if (dragType.includes('n')) {
          const maxTop = pageHeightPt - startBottomPt - minDimPt;
          newTop = Math.max(0, Math.min(maxTop, startTopPt + deltaYPt));
        }
        if (dragType.includes('s')) {
          const maxBottom = pageHeightPt - startTopPt - minDimPt;
          newBottom = Math.max(0, Math.min(maxBottom, startBottomPt - deltaYPt));
        }
      }

      const curT = Math.round(newTop);
      const curB = Math.round(newBottom);
      const curL = Math.round(newLeft);
      const curR = Math.round(newRight);

      // Save to data model
      if (cropScope === 'single') {
        if (!pageCrops[activePage]) pageCrops[activePage] = { ...globalCrop };
        pageCrops[activePage].top = curT;
        pageCrops[activePage].bottom = curB;
        pageCrops[activePage].left = curL;
        pageCrops[activePage].right = curR;
      } else {
        globalCrop.top = curT;
        globalCrop.bottom = curB;
        globalCrop.left = curL;
        globalCrop.right = curR;
        Object.keys(pageCrops).forEach(p => {
          pageCrops[p].top = curT;
          pageCrops[p].bottom = curB;
          pageCrops[p].left = curL;
          pageCrops[p].right = curR;
        });
      }

      // Real-time 60fps style updates (no DOM recreation)
      const topPx = Math.round(curT * previewZoom);
      const bottomPx = Math.round(curB * previewZoom);
      const leftPx = Math.round(curL * previewZoom);
      const rightPx = Math.round(curR * previewZoom);
      const boxWPx = Math.max(20, canvasWidthPx - leftPx - rightPx);
      const boxHPx = Math.max(20, canvasHeightPx - topPx - bottomPx);

      if (maskTop) maskTop.style.height = `${topPx}px`;
      if (maskBottom) maskBottom.style.height = `${bottomPx}px`;
      if (maskLeft) {
        maskLeft.style.top = `${topPx}px`;
        maskLeft.style.bottom = `${bottomPx}px`;
        maskLeft.style.width = `${leftPx}px`;
      }
      if (maskRight) {
        maskRight.style.top = `${topPx}px`;
        maskRight.style.bottom = `${bottomPx}px`;
        maskRight.style.width = `${rightPx}px`;
      }

      cropBox.style.top = `${topPx}px`;
      cropBox.style.left = `${leftPx}px`;
      cropBox.style.width = `${boxWPx}px`;
      cropBox.style.height = `${boxHPx}px`;

      if (pill) {
        const ptW = Math.round(boxWPx / previewZoom);
        const ptH = Math.round(boxHPx / previewZoom);
        pill.innerHTML = `
          <span>${ptW} × ${ptH} pt</span>
          <span style="opacity:0.5">·</span>
          <span>Trim: L:${curL} T:${curT} R:${curR} B:${curB}</span>
        `;
      }

      // Real-time input synchronization in bottom panel
      if (inTop && document.activeElement !== inTop) inTop.value = curT;
      if (inBottom && document.activeElement !== inBottom) inBottom.value = curB;
      if (inLeft && document.activeElement !== inLeft) inLeft.value = curL;
      if (inRight && document.activeElement !== inRight) inRight.value = curR;

      e.preventDefault();
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      if (cropBox) cropBox.style.cursor = 'move';
      if (activePointerId !== null) {
        try { e.target.releasePointerCapture(activePointerId); } catch (err) {}
        activePointerId = null;
      }
      modified = true;
      showEditedBadge();
    };

    cropBox.addEventListener('pointerdown', onPointerDown);
    cropBox.addEventListener('pointermove', onPointerMove);
    cropBox.addEventListener('pointerup', onPointerUp);
    cropBox.addEventListener('pointercancel', onPointerUp);
  }

  function showEditedBadge() {
    const badge = container.querySelector('#sidebar-edit-badge');
    if (badge) badge.style.display = 'inline-block';
  }

  // --- SIGNATURE PAD ---

  function initSignaturePad() {
    const pad = container.querySelector('#sig-pad');
    if (!pad) return;

    pad.width = pad.offsetWidth || 380;
    pad.height = pad.offsetHeight || 110;

    const ctx = pad.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = wmInkColor;

    let drawing = false;
    let lastX = 0, lastY = 0;

    const getPos = (e) => {
      const rect = pad.getBoundingClientRect();
      const scaleX = pad.width / rect.width;
      const scaleY = pad.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    pad.addEventListener('pointerdown', (e) => {
      drawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      e.preventDefault();
    });

    pad.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
      e.preventDefault();
    });

    const stop = () => {
      if (!drawing) return;
      drawing = false;
      syncDrawnSignature();
    };

    pad.addEventListener('pointerup', stop);
    pad.addEventListener('pointercancel', stop);
    pad.addEventListener('pointerleave', stop);
  }

  async function syncDrawnSignature() {
    const pad = container.querySelector('#sig-pad');
    if (!pad) return;

    const blob = await new Promise(res => pad.toBlob(res, 'image/png'));
    if (blob) {
      wmImageData = await blob.arrayBuffer();
      if (wmImagePreviewUrl) URL.revokeObjectURL(wmImagePreviewUrl);
      wmImagePreviewUrl = URL.createObjectURL(blob);
      enableWatermark = true;
      modified = true;
      showEditedBadge();
      updateOverlays();
    }
  }

  // --- CANVAS RENDERING WITH INSTANT BITMAP CACHE ---

  async function renderPreviewCanvas() {
    const canvas = container.querySelector('#main-preview-canvas');
    const loading = container.querySelector('#preview-loading-indicator');
    if (!canvas || !pdfDoc) return;

    const cacheKey = `${activePage}_${rotations[activePage] || 0}_${previewZoom}`;

    // Instant render from cache (<1ms)
    if (pageRenderCache.has(cacheKey)) {
      const cached = pageRenderCache.get(cacheKey);
      canvas.width = cached.width;
      canvas.height = cached.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(cached, 0, 0);
      updateOverlays();
      return;
    }

    if (loading) loading.style.display = 'inline';

    try {
      const renderedCanvas = await renderPageToCanvas(pdfDoc, activePage, {
        scale: previewZoom,
        rotation: rotations[activePage] || 0
      }, canvas);

      // Save bitmap in cache
      if (renderedCanvas && renderedCanvas.width > 0) {
        const offscreen = document.createElement('canvas');
        offscreen.width = renderedCanvas.width;
        offscreen.height = renderedCanvas.height;
        offscreen.getContext('2d').drawImage(renderedCanvas, 0, 0);
        pageRenderCache.set(cacheKey, offscreen);
      }
    } catch (err) {
      console.warn('Canvas render error:', err);
    } finally {
      if (loading) loading.style.display = 'none';
      updateOverlays();
    }
  }

  function renderOrganizeThumbnails() {
    const strip = container.querySelector('#organize-thumbs-strip');
    if (!strip || !pdfDoc) return;

    strip.innerHTML = '';
    const livePages = pageOrder.filter(p => !deletedPages.has(p));

    livePages.forEach(p => {
      const card = document.createElement('div');
      card.className = `organize-thumb-item ${p === activePage ? 'organize-thumb-item--active' : ''}`;
      card.setAttribute('data-page', p);
      card.style.cssText = `
        flex-shrink:0; width:74px; text-align:center; cursor:pointer;
        padding:4px; border-radius:4px; border:2px solid ${p === activePage ? 'var(--color-primary)' : 'var(--color-border)'};
        background:var(--color-bg-primary); transition:all 0.15s ease;
      `;

      card.innerHTML = `
        <div class="thumb-box-${p}" style="width:64px; height:84px; margin:0 auto; overflow:hidden; background:#fff; border-radius:2px; display:flex; align-items:center; justify-content:center">
          <span style="font-size:9px; color:var(--color-text-tertiary)">...</span>
        </div>
        <div style="font-size:10px; font-weight:600; margin-top:4px; color:var(--color-text-secondary)">
          Page ${p}
        </div>
      `;

      card.addEventListener('click', () => {
        setActivePage(p);
        strip.querySelectorAll('.organize-thumb-item').forEach(el => {
          const isA = parseInt(el.getAttribute('data-page'), 10) === p;
          el.style.borderColor = isA ? 'var(--color-primary)' : 'var(--color-border)';
        });
      });

      strip.appendChild(card);

      const thumbBox = card.querySelector(`.thumb-box-${p}`);
      if (thumbBox) {
        const cacheKey = `${p}_${rotations[p] || 0}`;
        if (thumbCache.has(cacheKey)) {
          thumbBox.replaceChildren(thumbCache.get(cacheKey).cloneNode(true));
        } else {
          generateThumbnail(pdfDoc, p, 90, rotations[p] || 0).then(thumbCanvas => {
            thumbCanvas.style.maxWidth = '100%';
            thumbCanvas.style.maxHeight = '100%';
            thumbCanvas.style.objectFit = 'contain';
            thumbCache.set(cacheKey, thumbCanvas);
            thumbBox.replaceChildren(thumbCanvas);
          }).catch(err => {});
        }
      }
    });

    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(strip, {
      animation: 150,
      ghostClass: 'organize-thumb--ghost',
      onEnd: () => {
        const newOrder = [];
        strip.querySelectorAll('.organize-thumb-item').forEach(el => {
          const p = parseInt(el.getAttribute('data-page'), 10);
          if (p) newOrder.push(p);
        });
        const remaining = pageOrder.filter(p => !newOrder.includes(p));
        pageOrder = [...newOrder, ...remaining];
        modified = true;
        showEditedBadge();
        updateSidebarPages();
      }
    });
  }

  function switchTab(tabId) {
    if (!tabId) return;
    activeTab = tabId;
    container.querySelectorAll('.editor-tab-pill').forEach(b => {
      const isCur = b.getAttribute('data-tab') === tabId;
      b.classList.toggle('editor-tab-pill--active', isCur);
    });

    const panels = ['watermark', 'crop', 'organize', 'numbers', 'protect'];
    panels.forEach(id => {
      const p = container.querySelector(`#tab-panel-${id}`);
      if (p) p.style.display = (id === tabId) ? 'block' : 'none';
    });

    if (tabId === 'organize') {
      renderOrganizeThumbnails();
    } else if (tabId === 'crop') {
      syncCropInputValues();
    } else if (tabId === 'watermark' && wmType === 'draw') {
      setTimeout(initSignaturePad, 50);
    }

    updateOverlays();
  }

  // --- EVENT BINDINGS ---

  function bindAllEvents() {
    const dropZone = container.querySelector('#pages-drop');
    const fileInput = container.querySelector('#pages-input');

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

    // Tabs switching
    container.querySelectorAll('.editor-tab-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    // Initialize requested active tab
    if (activeTab) {
      switchTab(activeTab);
    }

    // Filmstrip Full Grid toggle
    const toggleGridBtn = container.querySelector('#btn-toggle-grid-mode');
    if (toggleGridBtn) {
      toggleGridBtn.addEventListener('click', () => {
        const isOrganize = activeTab === 'organize';
        switchTab(isOrganize ? 'watermark' : 'organize');
        const gridLabel = container.querySelector('#toggle-grid-label');
        if (gridLabel) gridLabel.textContent = isOrganize ? 'Full Page Grid' : 'Hide Grid';
        const bottomSec = container.querySelector('#worksite-bottom-editor');
        if (bottomSec) {
          bottomSec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Preview navigation
    container.querySelector('#prev-page-btn')?.addEventListener('click', () => {
      setActivePage(activePage - 1);
    });

    container.querySelector('#next-page-btn')?.addEventListener('click', () => {
      setActivePage(activePage + 1);
    });

    // Zoom controls
    container.querySelector('#zoom-in-btn')?.addEventListener('click', () => {
      previewZoom = Math.min(2.0, previewZoom + 0.2);
      const lbl = container.querySelector('#zoom-label');
      if (lbl) lbl.textContent = `${Math.round(previewZoom * 100)}%`;
      renderPreviewCanvas();
    });

    container.querySelector('#zoom-out-btn')?.addEventListener('click', () => {
      previewZoom = Math.max(0.6, previewZoom - 0.2);
      const lbl = container.querySelector('#zoom-label');
      if (lbl) lbl.textContent = `${Math.round(previewZoom * 100)}%`;
      renderPreviewCanvas();
    });

    // Header exclusion button
    container.querySelector('#btn-toggle-exclude-active')?.addEventListener('click', () => {
      togglePageExclusion(activePage);
    });

    container.querySelector('#btn-exclude-current')?.addEventListener('click', () => {
      togglePageExclusion(activePage);
    });

    container.querySelector('#btn-exclude-cover')?.addEventListener('click', () => {
      togglePageExclusion(1);
    });

    container.querySelector('#btn-clear-exclusions')?.addEventListener('click', () => {
      wmExclude = '';
      modified = true;
      updateExclusionUI();
      updateOverlays();
    });

    container.querySelector('#wm-exclude-val')?.addEventListener('input', (e) => {
      wmExclude = e.target.value;
      modified = true;
      updateExclusionUI();
      updateOverlays();
    });

    // Watermark controls
    container.querySelector('#chk-enable-wm')?.addEventListener('change', (e) => {
      enableWatermark = e.target.checked;
      modified = true;
      updateOverlays();
    });

    container.querySelector('#wm-btn-type-draw')?.addEventListener('click', () => {
      wmType = 'draw';
      updateWatermarkTypeUI();
    });

    container.querySelector('#wm-btn-type-image')?.addEventListener('click', () => {
      wmType = 'image';
      updateWatermarkTypeUI();
    });

    container.querySelector('#wm-btn-type-text')?.addEventListener('click', () => {
      wmType = 'text';
      updateWatermarkTypeUI();
    });

    const updateWatermarkTypeUI = () => {
      container.querySelector('#wm-btn-type-draw')?.classList.toggle('active', wmType === 'draw');
      container.querySelector('#wm-btn-type-image')?.classList.toggle('active', wmType === 'image');
      container.querySelector('#wm-btn-type-text')?.classList.toggle('active', wmType === 'text');

      const drawBox = container.querySelector('#wm-mode-draw');
      const imgBox = container.querySelector('#wm-mode-image');
      const txtBox = container.querySelector('#wm-mode-text');
      if (drawBox) drawBox.style.display = wmType === 'draw' ? 'block' : 'none';
      if (imgBox) imgBox.style.display = wmType === 'image' ? 'block' : 'none';
      if (txtBox) txtBox.style.display = wmType === 'text' ? 'block' : 'none';

      if (wmType === 'draw') initSignaturePad();
      updateOverlays();
    };

    // Drawing Ink Colors
    container.querySelectorAll('.ink-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        wmInkColor = btn.getAttribute('data-color');
        container.querySelectorAll('.ink-btn').forEach(b => {
          b.style.borderColor = b.getAttribute('data-color') === wmInkColor ? '#000' : 'transparent';
        });
        const pad = container.querySelector('#sig-pad');
        if (pad) {
          const ctx = pad.getContext('2d');
          ctx.strokeStyle = wmInkColor;
        }
      });
    });

    container.querySelector('#btn-clear-sig')?.addEventListener('click', () => {
      const pad = container.querySelector('#sig-pad');
      if (pad) {
        pad.getContext('2d').clearRect(0, 0, pad.width, pad.height);
        wmImageData = null;
        wmImagePreviewUrl = null;
        updateOverlays();
      }
    });

    // Image upload
    const wmFileInput = container.querySelector('#wm-img-input');
    if (wmFileInput) {
      wmFileInput.addEventListener('change', async () => {
        if (wmFileInput.files.length) {
          const imgF = wmFileInput.files[0];
          wmMimeType = imgF.type || 'image/png';
          wmImageData = await readFileAsArrayBuffer(imgF);
          wmImagePreviewUrl = URL.createObjectURL(imgF);
          enableWatermark = true;
          modified = true;

          const pBox = container.querySelector('#wm-img-preview-box');
          const thumb = container.querySelector('#wm-img-thumb');
          if (pBox && thumb) {
            pBox.style.display = 'flex';
            thumb.src = wmImagePreviewUrl;
          }
          updateOverlays();
        }
      });
    }

    container.querySelector('#wm-remove-img')?.addEventListener('click', () => {
      wmImageData = null;
      wmImagePreviewUrl = null;
      const pBox = container.querySelector('#wm-img-preview-box');
      if (pBox) pBox.style.display = 'none';
      updateOverlays();
    });

    container.querySelector('#wm-text-val')?.addEventListener('input', (e) => {
      wmText = e.target.value;
      enableWatermark = true;
      modified = true;
      updateOverlays();
    });

    // Anchor buttons
    container.querySelectorAll('.anchor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        wmAnchor = btn.getAttribute('data-anchor');
        wmCustomPos = null;
        container.querySelectorAll('.anchor-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const badge = container.querySelector('#wm-drag-status-badge');
        if (badge) badge.style.display = 'none';
        modified = true;
        updateOverlays();
      });
    });

    // Sliders
    container.querySelector('#wm-slider-opacity')?.addEventListener('input', (e) => {
      wmOpacity = parseFloat(e.target.value);
      modified = true;
      const lbl = container.querySelector('#wm-lbl-opacity');
      if (lbl) lbl.textContent = `${Math.round(wmOpacity * 100)}%`;
      updateOverlays();
    });

    container.querySelector('#wm-slider-scale')?.addEventListener('input', (e) => {
      wmScale = parseFloat(e.target.value);
      modified = true;
      const lbl = container.querySelector('#wm-lbl-scale');
      if (lbl) lbl.textContent = `${Math.round(wmScale * 100)}%`;
      updateOverlays();
    });

    container.querySelector('#wm-slider-rot')?.addEventListener('input', (e) => {
      wmRotation = parseInt(e.target.value, 10);
      modified = true;
      const lbl = container.querySelector('#wm-lbl-rot');
      if (lbl) lbl.textContent = `${wmRotation}°`;
      updateOverlays();
    });

    // CROP CONTROLS
    container.querySelector('#crop-scope-all')?.addEventListener('click', () => {
      cropScope = 'all';
      container.querySelector('#crop-scope-all')?.classList.add('active');
      container.querySelector('#crop-scope-single')?.classList.remove('active');
      syncCropInputValues();
      updateOverlays();
    });

    container.querySelector('#crop-scope-single')?.addEventListener('click', () => {
      cropScope = 'single';
      container.querySelector('#crop-scope-single')?.classList.add('active');
      container.querySelector('#crop-scope-all')?.classList.remove('active');
      syncCropInputValues();
      updateOverlays();
    });

    container.querySelector('#crop-in-top')?.addEventListener('input', (e) => setCropInset('top', e.target.value));
    container.querySelector('#crop-in-bottom')?.addEventListener('input', (e) => setCropInset('bottom', e.target.value));
    container.querySelector('#crop-in-left')?.addEventListener('input', (e) => setCropInset('left', e.target.value));
    container.querySelector('#crop-in-right')?.addEventListener('input', (e) => setCropInset('right', e.target.value));

    container.querySelector('#crop-btn-36')?.addEventListener('click', () => {
      setCropAll(36, 36, 36, 36);
      syncCropInputValues();
    });

    container.querySelector('#crop-btn-72')?.addEventListener('click', () => {
      setCropAll(72, 72, 72, 72);
      syncCropInputValues();
    });

    container.querySelector('#crop-btn-reset')?.addEventListener('click', () => {
      setCropAll(0, 0, 0, 0);
      syncCropInputValues();
    });

    container.querySelector('#crop-btn-copy-all')?.addEventListener('click', () => {
      const cur = getCurrentCrop();
      globalCrop = { ...cur };
      cropScope = 'all';
      container.querySelector('#crop-scope-all')?.classList.add('active');
      container.querySelector('#crop-scope-single')?.classList.remove('active');
      syncCropInputValues();
      updateOverlays();
    });

    // ORGANIZE ACTIONS
    container.querySelector('#btn-rotate-cw')?.addEventListener('click', () => {
      rotations[activePage] = ((rotations[activePage] || 0) + 90) % 360;
      pageRenderCache.clear();
      modified = true;
      showEditedBadge();
      updateHeaderInfo();
      renderPreviewCanvas();
      if (activeTab === 'organize') renderOrganizeThumbnails();
    });

    container.querySelector('#btn-delete-page')?.addEventListener('click', () => {
      deletedPages.add(activePage);
      pageRenderCache.clear();
      modified = true;
      showEditedBadge();
      const live = pageOrder.filter(p => !deletedPages.has(p));
      if (live.length > 0) setActivePage(live[0]);
      updateSidebarPages();
      if (activeTab === 'organize') renderOrganizeThumbnails();
    });

    container.querySelector('#btn-rotate-all')?.addEventListener('click', () => {
      pageOrder.forEach(p => { rotations[p] = ((rotations[p] || 0) + 90) % 360; });
      pageRenderCache.clear();
      thumbCache.clear();
      modified = true;
      showEditedBadge();
      updateHeaderInfo();
      renderPreviewCanvas();
      if (activeTab === 'organize') renderOrganizeThumbnails();
    });

    container.querySelector('#btn-reset-order')?.addEventListener('click', () => {
      pageOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
      rotations = {};
      deletedPages.clear();
      pageRenderCache.clear();
      thumbCache.clear();
      modified = false;
      setActivePage(1);
      updateSidebarPages();
      if (activeTab === 'organize') renderOrganizeThumbnails();
    });

    // PAGE NUMBERS
    container.querySelector('#chk-enable-numbers')?.addEventListener('change', (e) => {
      enableNumbers = e.target.checked;
      modified = true;
      updateOverlays();
    });

    container.querySelector('#pn-select-pos')?.addEventListener('change', (e) => {
      pnPosition = e.target.value;
      modified = true;
      updateOverlays();
    });

    container.querySelector('#pn-select-fmt')?.addEventListener('change', (e) => {
      pnFormat = e.target.value;
      modified = true;
      updateOverlays();
    });

    container.querySelector('#pn-chk-cover')?.addEventListener('change', (e) => {
      pnExcludeFirst = e.target.checked;
      modified = true;
      updateOverlays();
    });

    container.querySelector('#pn-slider-margin')?.addEventListener('input', (e) => {
      pnMargin = parseInt(e.target.value, 10);
      modified = true;
      const lbl = container.querySelector('#pn-lbl-margin');
      if (lbl) lbl.textContent = `${pnMargin} pt`;
      updateOverlays();
    });

    container.querySelector('#pn-slider-size')?.addEventListener('input', (e) => {
      pnFontSize = parseInt(e.target.value, 10);
      modified = true;
      const lbl = container.querySelector('#pn-lbl-size');
      if (lbl) lbl.textContent = `${pnFontSize} pt`;
      updateOverlays();
    });

    // PASSWORD PROTECT
    container.querySelector('#protect-pass-val')?.addEventListener('input', (e) => {
      protectPassword = e.target.value;
      modified = true;
    });

    container.querySelector('#protect-confirm-val')?.addEventListener('input', (e) => {
      protectConfirm = e.target.value;
      modified = true;
    });

    // SAVE & EXPORT
    container.querySelector('#pm-save-btn')?.addEventListener('click', handleSave);
  }

  // --- FILE HANDLING ---

  async function handleFile(f) {
    const errorEl = container.querySelector('#pages-error');
    if (errorEl) errorEl.style.display = 'none';

    try {
      validateFileType(f, PDF_MIME);
      checkFileSize(f);

      file = f;
      pdfBuffer = await readFileAsArrayBuffer(f);
      pdfDoc = await loadPDFDocument(pdfBuffer);
      pageCount = pdfDoc.numPages;
      activePage = 1;
      pageOrder = Array.from({ length: pageCount }, (_, i) => i + 1);
      rotations = {};
      deletedPages.clear();
      modified = false;
      pageRenderCache.clear();
      thumbCache.clear();
      pageCrops = {};
      globalCrop = { top: 0, bottom: 0, left: 0, right: 0 };

      renderInitialShell();
    } catch (err) {
      showError(err.message || 'Failed to load PDF document.');
    }
  }

  // --- EXPORT PDF ---

  async function handleSave() {
    const saveBtn = container.querySelector('#pm-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `${icon('loader', 16)} Saving PDF...`;
    }

    try {
      const livePages = pageOrder.filter(p => !deletedPages.has(p));
      if (livePages.length === 0) {
        throw new Error('All pages have been deleted. At least 1 page must be preserved.');
      }

      // 1. Single atomic pass for Reorder, Delete & Rotate using pdf-lib copyPages
      const srcDoc = await PDFDocument.load(pdfBuffer.slice(0), { ignoreEncryption: true });
      const outDoc = await PDFDocument.create();

      const copiedPages = await outDoc.copyPages(srcDoc, livePages.map(p => p - 1));

      copiedPages.forEach((page, idx) => {
        const origPageNum = livePages[idx];
        const rot = (rotations[origPageNum] || 0) % 360;
        if (rot !== 0) {
          const currentRot = page.getRotation().angle;
          page.setRotation(degrees((currentRot + rot) % 360));
        }
        outDoc.addPage(page);
      });

      let currentBuffer = await outDoc.save({ useObjectStreams: true });

      // 2. Apply Watermark or Signature ONLY if enabled
      const hasImage = (wmType === 'draw' || wmType === 'image') && Boolean(wmImageData);
      const hasText = wmType === 'text' && Boolean(wmText);

      if (enableWatermark && (hasImage || hasText)) {
        const excludeList = Array.from(getExcludedPages());
        currentBuffer = await applyWatermark(currentBuffer, {
          type: (wmType === 'draw' || wmType === 'image') ? 'image' : 'text',
          imageData: wmImageData,
          mimeType: wmMimeType,
          text: wmText,
          anchor: wmAnchor,
          customPosition: wmCustomPos,
          opacity: wmOpacity,
          scale: wmScale,
          rotation: wmRotation,
          excludePages: excludeList,
        });
      }

      // 3. Apply Page Numbers ONLY if enabled
      if (enableNumbers) {
        currentBuffer = await applyPageNumbers(currentBuffer, {
          position: pnPosition,
          format: pnFormat,
          margin: pnMargin,
          fontSize: pnFontSize,
          excludeFirstPage: pnExcludeFirst,
        });
      }

      // 4. Apply Crop Margins (supports per-page and all-pages crop)
      const hasGlobalCrop = globalCrop.top > 0 || globalCrop.bottom > 0 || globalCrop.left > 0 || globalCrop.right > 0;
      const hasPageCrops = Object.keys(pageCrops).length > 0;

      if (hasGlobalCrop || hasPageCrops) {
        currentBuffer = await applyCrop(currentBuffer, {
          insets: globalCrop,
          pageCrops: pageCrops,
        });
      }

      // 5. Apply Password Protection ONLY if specified
      if (protectPassword && protectPassword.trim().length > 0) {
        if (protectPassword !== protectConfirm) {
          throw new Error('Passwords do not match. Please verify password and confirmation.');
        }
        currentBuffer = await lockPDF(currentBuffer, protectPassword.trim());
      }

      const outName = `${getBasename(file.name)}_edited.pdf`;
      downloadArrayBuffer(currentBuffer, outName, 'application/pdf');

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${icon('check', 16)} Downloaded!`;
        setTimeout(() => {
          if (saveBtn) saveBtn.innerHTML = `${icon('save', 18)} Save & Export PDF`;
        }, 2500);
      }
    } catch (err) {
      showError(err.message || 'Failed to save edits.');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${icon('save', 18)} Save & Export PDF`;
      }
    }
  }

  function showError(msg) {
    const errorEl = container.querySelector('#pages-error');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.className = 'status-msg status-msg--error';
      errorEl.innerHTML = `${icon('alertCircle', 16)} <span>${msg}</span>`;
    }
  }

  renderInitialShell();
}
