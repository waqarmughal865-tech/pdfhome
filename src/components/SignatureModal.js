/**
 * Digital Signature Studio — Full-Window / Popup Modal
 * 
 * Features:
 * - High-DPI Retina Canvas with crisp vector-quality strokes
 * - Pen Styles:
 *   1. Fountain Pen (Executive Calligraphy with dynamic speed tapering)
 *   2. Ballpoint Pen (Simple clean uniform stroke)
 *   3. Gel / Felt Tip Pen (Rich rounded ink flow)
 *   4. Marker / Highlighter (Translucent wide stroke)
 * - Stroke Width Presets (Fine, Medium, Bold, Thick)
 * - Curated Ink Palette + Custom HTML5 Color Picker
 * - Full Undo & Redo Stroke History Stack (with Ctrl+Z / Ctrl+Y shortcuts)
 * - Smooth Quadratic Bézier spline interpolation
 * - Automatic transparent whitespace bounding-box trimmer
 * - Type-to-Sign mode: type a name, pick from 4 handwriting fonts, live preview
 * - Saved signatures: remembers your signature in localStorage for one-click reuse
 * - Full-screen on mobile viewports for maximum touch/stylus drawing space
 */

import { icon } from './icons.js';

const INK_COLORS = [
  { id: 'blue', label: 'Royal Blue', hex: '#1d4ed8' },
  { id: 'navy', label: 'Midnight Navy', hex: '#1e3a8a' },
  { id: 'black', label: 'Classic Black', hex: '#0f172a' },
  { id: 'slate', label: 'Dark Slate', hex: '#334155' },
  { id: 'green', label: 'Emerald Green', hex: '#047857' },
  { id: 'red', label: 'Crimson Red', hex: '#b91c1c' },
];

const PEN_STYLES = [
  { id: 'fountain', label: 'Fountain Pen', iconName: 'penTool' },
  { id: 'ballpoint', label: 'Simple Pen', iconName: 'edit' },
  { id: 'gel', label: 'Gel Pen', iconName: 'stamp' },
  { id: 'marker', label: 'Marker', iconName: 'scissors' },
];

const PEN_WIDTHS = [
  { id: 'fine', label: 'Fine', val: 1.6 },
  { id: 'medium', label: 'Medium', val: 2.6 },
  { id: 'bold', label: 'Bold', val: 4.2 },
  { id: 'thick', label: 'Thick', val: 6.5 },
];

export function openSignatureModal({
  initialColor = '#1d4ed8',
  initialPen = 'fountain',
  initialWidth = 2.6,
  onSave = () => {},
  onClose = () => {}
} = {}) {
  // State
  let currentPen = initialPen;
  let currentColor = initialColor;
  let currentWidth = initialWidth;
  let autoTrim = true;
  let strokes = [];    // Array of { pen, color, width, points: [{x, y, time, w}] }
  let redoStack = [];  // Popped strokes for redo
  let isDrawing = false;
  let currentStroke = null;
  let canvasRect = { width: 600, height: 320 };
  let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

  // Create Modal Backdrop & DOM
  const modalEl = document.createElement('div');
  modalEl.className = 'sig-modal-backdrop';
  modalEl.id = 'signature-studio-modal';

  modalEl.innerHTML = `
    <div class="sig-modal-card" role="dialog" aria-labelledby="sig-studio-title" aria-modal="true">
      <!-- Modal Header -->
      <div class="sig-modal-header">
        <div class="sig-modal-title-wrap">
          <div class="sig-modal-icon-badge">
            ${icon('penTool', 20)}
          </div>
          <div>
            <h2 class="sig-modal-title" id="sig-studio-title">Digital Signature Studio</h2>
            <p class="sig-modal-sub">Draw your signature, or type it in a handwriting style.</p>
          </div>
        </div>
        <button class="sig-modal-close-btn" id="sig-btn-expand" title="Fullscreen (F11)" aria-label="Toggle fullscreen">
          ${icon('maximize', 20)}
        </button>
        <button class="sig-modal-close-btn" id="sig-btn-close" title="Close (Esc)" aria-label="Close">
          ${icon('x', 20)}
        </button>
      </div>

      <!-- Mode Tabs: Draw / Type -->
      <div class="sig-mode-tabs" role="tablist" aria-label="Signature input mode">
        <button type="button" class="sig-mode-tab active" id="sig-tab-draw" role="tab" aria-selected="true">
          ${icon('penTool', 14)} Draw
        </button>
        <button type="button" class="sig-mode-tab" id="sig-tab-type" role="tab" aria-selected="false">
          ${icon('edit', 14)} Type
        </button>
      </div>

      <!-- Modal Toolbar -->
      <div class="sig-modal-toolbar">
        <div class="sig-tools-group">
          <!-- Pen Styles -->
          <div class="sig-pen-selector" title="Select Pen Style">
            ${PEN_STYLES.map(p => `
              <button type="button" class="sig-pen-btn ${p.id === currentPen ? 'active' : ''}" data-pen="${p.id}">
                ${p.label}
              </button>
            `).join('')}
          </div>

          <!-- Pen Thicknesses -->
          <div class="sig-width-pills" title="Stroke Thickness">
            ${PEN_WIDTHS.map(w => `
              <button type="button" class="sig-width-btn ${Math.abs(w.val - currentWidth) < 0.2 ? 'active' : ''}" data-val="${w.val}">
                ${w.label}
              </button>
            `).join('')}
          </div>

          <!-- Color Swatches -->
          <div class="sig-color-swatches" title="Ink Color">
            ${INK_COLORS.map(c => `
              <button type="button" 
                      class="sig-color-swatch ${c.hex.toLowerCase() === currentColor.toLowerCase() ? 'active' : ''}" 
                      data-color="${c.hex}" 
                      style="background-color: ${c.hex}" 
                      title="${c.label}"></button>
            `).join('')}
            <div class="sig-custom-color-wrap" title="Custom Ink Color">
              <span style="font-size:11px; font-weight:800; color:var(--color-text-secondary)">🎨</span>
              <input type="color" id="sig-custom-color" class="sig-custom-color-input" value="${currentColor}" />
            </div>
          </div>
        </div>

        <!-- Action Utilities: Undo, Redo, Clear -->
        <div class="sig-actions-group">
          <button type="button" class="sig-action-btn" id="sig-btn-undo" title="Undo Last Stroke (Ctrl+Z)" disabled>
            ${icon('chevronLeft', 14)} Undo
          </button>
          <button type="button" class="sig-action-btn" id="sig-btn-redo" title="Redo (Ctrl+Y)" disabled>
            Redo ${icon('chevronRight', 14)}
          </button>
          <button type="button" class="sig-action-btn" id="sig-btn-clear" title="Clear Signature" style="color:var(--color-danger)">
            ${icon('trash', 14)} Clear
          </button>
        </div>
      </div>

      <!-- Drawing Canvas Viewport -->
      <div class="sig-canvas-viewport" id="sig-canvas-viewport">
        <canvas class="sig-studio-canvas" id="sig-studio-canvas"></canvas>
        <div class="sig-guide-line"></div>
        <span class="sig-guide-label">Sign above this line</span>
      </div>

      <!-- Type-to-Sign Panel (hidden by default) -->
      <div class="sig-type-panel" id="sig-type-panel" style="display:none">
        <div class="sig-type-input-wrap">
          <label for="sig-type-name" class="sig-type-label">Type your full name</label>
          <input type="text" id="sig-type-name" class="sig-type-input" placeholder="e.g. Waqar Ahmed" maxlength="60" autocomplete="off" />
        </div>
        <div class="sig-type-fonts" id="sig-type-fonts" role="radiogroup" aria-label="Handwriting style">
          <!-- font options injected by JS -->
        </div>
        <div class="sig-type-preview-wrap">
          <canvas class="sig-type-preview" id="sig-type-preview"></canvas>
        </div>
        <div class="sig-type-size-wrap">
          <label for="sig-type-size" class="sig-type-label">Size</label>
          <input type="range" id="sig-type-size" min="40" max="120" value="72" />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="sig-modal-footer">
        <div class="sig-footer-left">
          <label class="sig-trim-label" title="Crop transparent whitespace around signature">
            <input type="checkbox" id="sig-chk-trim" ${autoTrim ? 'checked' : ''} />
            <span>Trim empty margins automatically</span>
          </label>
          <span class="sig-stroke-status" id="sig-stroke-status">0 strokes</span>
        </div>

        <div class="sig-footer-btns">
          <button type="button" class="btn btn-secondary" id="sig-btn-cancel">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" id="sig-btn-apply" style="min-width:140px">
            ${icon('check', 16)} Apply Signature
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  const canvas = modalEl.querySelector('#sig-studio-canvas');
  const viewport = modalEl.querySelector('#sig-canvas-viewport');
  const ctx = canvas.getContext('2d');
  const undoBtn = modalEl.querySelector('#sig-btn-undo');
  const redoBtn = modalEl.querySelector('#sig-btn-redo');
  const clearBtn = modalEl.querySelector('#sig-btn-clear');
  const statusEl = modalEl.querySelector('#sig-stroke-status');
  const trimChk = modalEl.querySelector('#sig-chk-trim');
  const customColorInput = modalEl.querySelector('#sig-custom-color');

  // Canvas Sizing & Retina Resolution
  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const rect = viewport.getBoundingClientRect();
    canvasRect.width = Math.max(300, rect.width);
    canvasRect.height = Math.max(200, rect.height);

    canvas.width = Math.floor(canvasRect.width * dpr);
    canvas.height = Math.floor(canvasRect.height * dpr);
    canvas.style.width = `${canvasRect.width}px`;
    canvas.style.height = `${canvasRect.height}px`;

    redrawCanvas();
  }

  // Redraw all strokes onto canvas with smoothing
  function redrawCanvas() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    for (const stroke of strokes) {
      renderSingleStroke(ctx, stroke);
    }
    ctx.restore();

    updateStatusUI();
  }

  // Render stroke with appropriate pen style & curve smoothing
  // ── Variable-width stroke renderer (fountain pen) ──
  // Builds a smooth filled outline from per-point widths instead of stroking
  // separate segments — this eliminates the beaded "dots" artifact.
  function renderVariableWidthStroke(targetCtx, pts, color, baseWidth) {
    if (!pts || pts.length === 0) return;
    targetCtx.save();
    targetCtx.fillStyle = color;

    if (pts.length === 1) {
      const r = (pts[0].w || baseWidth || 2) / 2;
      targetCtx.beginPath();
      targetCtx.arc(pts[0].x, pts[0].y, r, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();
      return;
    }

    // Smooth widths with a 3-point moving average to avoid abrupt steps
    const rawW = pts.map(p => p.w || baseWidth || 2);
    const sw = rawW.map((w, i) => {
      const a = rawW[Math.max(0, i - 1)];
      const b = rawW[Math.min(rawW.length - 1, i + 1)];
      return (a + w + b) / 3;
    });

    const left = [], right = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const pPrev = pts[Math.max(0, i - 1)];
      const pNext = pts[Math.min(pts.length - 1, i + 1)];
      let dx = pNext.x - pPrev.x, dy = pNext.y - pPrev.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.01) { dx = 1; dy = 0; } else { dx /= len; dy /= len; }
      const nx = -dy, ny = dx;
      const hw = sw[i] / 2;
      left.push([p.x + nx * hw, p.y + ny * hw]);
      right.push([p.x - nx * hw, p.y - ny * hw]);
    }

    targetCtx.beginPath();
    targetCtx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < left.length; i++) targetCtx.lineTo(left[i][0], left[i][1]);
    for (let i = right.length - 1; i >= 0; i--) targetCtx.lineTo(right[i][0], right[i][1]);
    targetCtx.closePath();
    targetCtx.fill();

    // Round caps at both ends
    for (const idx of [0, pts.length - 1]) {
      const p = pts[idx];
      targetCtx.beginPath();
      targetCtx.arc(p.x, p.y, sw[idx] / 2, 0, Math.PI * 2);
      targetCtx.fill();
    }
    targetCtx.restore();
  }

  function renderSingleStroke(targetCtx, stroke) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) return;

    targetCtx.save();
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';
    targetCtx.strokeStyle = stroke.color;

    if (stroke.pen === 'marker') {
      targetCtx.globalAlpha = 0.45;
      targetCtx.lineWidth = stroke.width * 2.8;
    } else if (stroke.pen === 'gel') {
      targetCtx.globalAlpha = 0.95;
      targetCtx.lineWidth = stroke.width * 1.25;
    } else if (stroke.pen === 'ballpoint') {
      targetCtx.globalAlpha = 0.92;
      targetCtx.lineWidth = stroke.width;
    }

    if (pts.length === 1) {
      // Single dot tap
      targetCtx.beginPath();
      targetCtx.arc(pts[0].x, pts[0].y, (stroke.width || 2) * 0.75, 0, Math.PI * 2);
      targetCtx.fillStyle = stroke.color;
      targetCtx.fill();
      targetCtx.restore();
      return;
    }

    if (stroke.pen === 'fountain') {
      // Fountain Pen: smooth variable-width filled outline (no dot artifacts)
      targetCtx.restore();
      renderVariableWidthStroke(targetCtx, pts, stroke.color, stroke.width);
      return;
    } else {
      // Smooth Quadratic Bézier curves for Ballpoint, Gel & Marker
      targetCtx.beginPath();
      targetCtx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        targetCtx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }

      // Curve to the last point
      targetCtx.quadraticCurveTo(
        pts[pts.length - 1].x,
        pts[pts.length - 1].y,
        pts[pts.length - 1].x,
        pts[pts.length - 1].y
      );
      targetCtx.stroke();
    }

    targetCtx.restore();
  }

  function updateStatusUI() {
    undoBtn.disabled = strokes.length === 0;
    redoBtn.disabled = redoStack.length === 0;
    clearBtn.disabled = strokes.length === 0;
    statusEl.textContent = `${strokes.length} stroke${strokes.length === 1 ? '' : 's'}`;
  }

  // Pointer coordinate calculation relative to CSS display
  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };
  }

  // Pointer / Touch drawing handlers
  function handlePointerDown(e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    isDrawing = true;

    const pt = getCanvasPoint(e);
    let initialW = currentWidth;
    if (currentPen === 'fountain') {
      initialW = currentWidth * 1.15;
    }
    pt.w = initialW;

    currentStroke = {
      pen: currentPen,
      color: currentColor,
      width: currentWidth,
      points: [pt]
    };

    // Draw initial dot immediately
    ctx.save();
    ctx.scale(dpr, dpr);
    renderSingleStroke(ctx, currentStroke);
    ctx.restore();
  }

  function handlePointerMove(e) {
    if (!isDrawing || !currentStroke) return;
    e.preventDefault();

    const pt = getCanvasPoint(e);
    const pts = currentStroke.points;
    const prevPt = pts[pts.length - 1];

    // Calculate dynamic velocity for fountain pen tapering
    if (currentPen === 'fountain') {
      const dist = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
      const dt = Math.max(1, pt.time - prevPt.time);
      const speed = dist / dt; // pixels per millisecond
      // Faster stroke -> slightly thinner line (taper); slower -> fuller ink deposit
      const factor = Math.max(0.45, Math.min(1.4, 1.0 - (speed * 0.18)));
      pt.w = currentWidth * factor;
    }

    pts.push(pt);

    // Incremental draw for zero lag
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentStroke.color;

    if (currentStroke.pen === 'marker') {
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = currentStroke.width * 2.8;
    } else if (currentStroke.pen === 'gel') {
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = currentStroke.width * 1.25;
    } else if (currentStroke.pen === 'ballpoint') {
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = currentStroke.width;
    }

    if (currentPen === 'fountain') {
      // Redraw the whole in-progress stroke with the smooth variable-width
      // renderer (incremental segments caused the dot/bead artifact)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      for (const s of strokes) renderSingleStroke(ctx, s);
      renderVariableWidthStroke(ctx, pts, currentStroke.color, currentStroke.width);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(prevPt.x, prevPt.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function handlePointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    if (currentStroke && currentStroke.points.length > 0) {
      strokes.push(currentStroke);
      redoStack = []; // Reset redo on new draw
      redrawCanvas();
    }
    currentStroke = null;
  }

  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  // Undo, Redo, Clear
  function undo() {
    if (strokes.length === 0) return;
    const popped = strokes.pop();
    redoStack.push(popped);
    redrawCanvas();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const restored = redoStack.pop();
    strokes.push(restored);
    redrawCanvas();
  }

  function clearAll() {
    if (strokes.length === 0) return;
    strokes = [];
    redoStack = [];
    redrawCanvas();
  }

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  clearBtn.addEventListener('click', clearAll);

  // Pen Style Switcher
  modalEl.querySelectorAll('.sig-pen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.sig-pen-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPen = btn.dataset.pen;
    });
  });

  // Pen Width Switcher
  modalEl.querySelectorAll('.sig-width-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.sig-width-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWidth = parseFloat(btn.dataset.val);
    });
  });

  // Color Swatches
  modalEl.querySelectorAll('.sig-color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      modalEl.querySelectorAll('.sig-color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = btn.dataset.color;
      customColorInput.value = currentColor;
    });
  });

  customColorInput.addEventListener('input', (e) => {
    currentColor = e.target.value;
    modalEl.querySelectorAll('.sig-color-swatch').forEach(b => {
      b.classList.toggle('active', b.dataset.color.toLowerCase() === currentColor.toLowerCase());
    });
  });

  trimChk.addEventListener('change', (e) => {
    autoTrim = e.target.checked;
  });

  // Auto-trim transparent borders and generate final transparent PNG blob
  async function generateSignatureBlob() {
    if (strokes.length === 0) return null;

    if (!autoTrim) {
      return new Promise(res => canvas.toBlob(res, 'image/png'));
    }

    // Calculate non-transparent pixel bounding box
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 8) { // non-transparent
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) {
      return new Promise(res => canvas.toBlob(res, 'image/png'));
    }

    // Add gentle padding (8px in CSS points)
    const pad = Math.round(8 * dpr);
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);

    const cropW = Math.max(20, maxX - minX);
    const cropH = Math.max(20, maxY - minY);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const croppedCtx = croppedCanvas.getContext('2d');

    croppedCtx.drawImage(
      canvas,
      minX, minY, cropW, cropH,
      0, 0, cropW, cropH
    );

    // Upscale 3x for crisp display when the signature is shown larger
    // in the page preview overlay (avoids blurry/pixelated appearance)
    const SCALE = 3;
    const hiCanvas = document.createElement('canvas');
    hiCanvas.width = cropW * SCALE;
    hiCanvas.height = cropH * SCALE;
    const hiCtx = hiCanvas.getContext('2d');
    hiCtx.imageSmoothingEnabled = true;
    hiCtx.imageSmoothingQuality = 'high';
    hiCtx.drawImage(croppedCanvas, 0, 0, hiCanvas.width, hiCanvas.height);

    return new Promise(res => hiCanvas.toBlob(res, 'image/png'));
  }

  // Keyboard Shortcuts (Esc, Ctrl+Z, Ctrl+Y)
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  // Close & Clean Up
  function closeModal() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize', resizeCanvas);
    modalEl.classList.add('sig-modal-closing');
    setTimeout(() => {
      if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
      onClose();
    }, 150);
  }

  modalEl.querySelector('#sig-btn-close').addEventListener('click', closeModal);
  modalEl.querySelector('#sig-btn-cancel').addEventListener('click', closeModal);

  // Fullscreen toggle
  const cardEl = modalEl.querySelector('.sig-modal-card');
  const expandBtn = modalEl.querySelector('#sig-btn-expand');
  function toggleFullscreen() {
    cardEl.classList.toggle('sig-fullscreen');
    const isFull = cardEl.classList.contains('sig-fullscreen');
    expandBtn.title = isFull ? 'Exit fullscreen (Esc)' : 'Fullscreen';
    expandBtn.style.color = isFull ? 'var(--color-accent)' : '';
    setTimeout(resizeCanvas, 60);
  }
  expandBtn.addEventListener('click', toggleFullscreen);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeModal();
  });

  // ── Type-to-Sign mode ──
  const TYPE_FONTS = [
    { id: 'caveat', label: 'Casual', family: "'Caveat', cursive", gf: 'Caveat:wght@600' },
    { id: 'dancing', label: 'Elegant', family: "'Dancing Script', cursive", gf: 'Dancing+Script:wght@600' },
    { id: 'vibes', label: 'Formal', family: "'Great Vibes', cursive", gf: 'Great+Vibes' },
    { id: 'satisfy', label: 'Smooth', family: "'Satisfy', cursive", gf: 'Satisfy' },
    { id: 'homemade', label: 'Natural', family: "'Homemade Apple', cursive", gf: 'Homemade+Apple' },
    { id: 'kalam', label: 'Handprint', family: "'Kalam', cursive", gf: 'Kalam:wght@400' },
    { id: 'shadows', label: 'Neat', family: "'Shadows Into Light', cursive", gf: 'Shadows+Into+Light' },
    { id: 'pacifico', label: 'Bold Script', family: "'Pacifico', cursive", gf: 'Pacifico' },
    { id: 'allura', label: 'Calligraphy', family: "'Allura', cursive", gf: 'Allura' },
    { id: 'alexbrush', label: 'Brush', family: "'Alex Brush', cursive", gf: 'Alex+Brush' },
  ];
  let sigMode = 'draw'; // 'draw' | 'type'
  let typeFont = TYPE_FONTS[0];
  let typeSize = 72;
  let fontsLoaded = false;

  const tabDraw = modalEl.querySelector('#sig-tab-draw');
  const tabType = modalEl.querySelector('#sig-tab-type');
  const drawViewport = modalEl.querySelector('#sig-canvas-viewport');
  const drawToolbar = modalEl.querySelector('.sig-modal-toolbar');
  const typePanel = modalEl.querySelector('#sig-type-panel');
  const typeInput = modalEl.querySelector('#sig-type-name');
  const typeFontsEl = modalEl.querySelector('#sig-type-fonts');
  const typePreview = modalEl.querySelector('#sig-type-preview');
  const typeSizeInput = modalEl.querySelector('#sig-type-size');
  const typeCtx = typePreview.getContext('2d');

  function loadTypeFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + TYPE_FONTS.map(f => `family=${f.gf}`).join('&') + '&display=swap';
    document.head.appendChild(link);
    // Re-render previews once fonts arrive
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { renderTypePreview(); renderFontOptions(); });
    }
  }

  function renderFontOptions() {
    typeFontsEl.innerHTML = TYPE_FONTS.map(f => `
      <button type="button" class="sig-type-font ${f.id === typeFont.id ? 'active' : ''}"
              data-font="${f.id}" role="radio" aria-checked="${f.id === typeFont.id}"
              style="font-family: ${f.family}" title="${f.label}">
        ${escapeName(typeInput.value.trim() || 'Signature')}
        <small>${f.label}</small>
      </button>
    `).join('');
    typeFontsEl.querySelectorAll('[data-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        typeFont = TYPE_FONTS.find(f => f.id === btn.dataset.font) || TYPE_FONTS[0];
        renderFontOptions();
        renderTypePreview();
      });
    });
  }

  function escapeName(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderTypePreview() {
    const name = typeInput.value.trim() || 'Your Signature';
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const W = 560, H = 140;
    typePreview.width = W * dpr;
    typePreview.height = H * dpr;
    typePreview.style.width = W + 'px';
    typePreview.style.height = H + 'px';
    typeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    typeCtx.clearRect(0, 0, W, H);
    typeCtx.fillStyle = currentColor;
    typeCtx.textAlign = 'center';
    typeCtx.textBaseline = 'middle';
    typeCtx.font = `${typeSize}px ${typeFont.family}`;
    typeCtx.fillText(name, W / 2, H / 2 + 4);
  }

  async function generateTypedBlob() {
    const name = typeInput.value.trim();
    if (!name) return null;
    // Ensure font is loaded before rasterizing
    try {
      if (document.fonts) await document.fonts.load(`${typeSize}px ${typeFont.family}`, name);
    } catch (e) { /* fall back to whatever rendered */ }
    const dpr = 3;
    const pad = 20;
    const meas = document.createElement('canvas').getContext('2d');
    meas.font = `${typeSize}px ${typeFont.family}`;
    const tw = Math.ceil(meas.measureText(name).width);
    const W = tw + pad * 2, H = typeSize + pad * 2;
    const c = document.createElement('canvas');
    c.width = W * dpr; c.height = H * dpr;
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    x.fillStyle = currentColor;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = `${typeSize}px ${typeFont.family}`;
    x.fillText(name, W / 2, H / 2);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }

  function setSigMode(mode) {
    sigMode = mode;
    const isDraw = mode === 'draw';
    tabDraw.classList.toggle('active', isDraw);
    tabType.classList.toggle('active', !isDraw);
    tabDraw.setAttribute('aria-selected', isDraw);
    tabType.setAttribute('aria-selected', !isDraw);
    drawViewport.style.display = isDraw ? '' : 'none';
    drawToolbar.style.display = isDraw ? '' : 'none';
    typePanel.style.display = isDraw ? 'none' : 'flex';
    if (!isDraw) {
      loadTypeFonts();
      renderFontOptions();
      renderTypePreview();
      setTimeout(() => typeInput.focus(), 60);
    } else {
      setTimeout(resizeCanvas, 40);
    }
  }

  tabDraw.addEventListener('click', () => setSigMode('draw'));
  tabType.addEventListener('click', () => setSigMode('type'));
  typeInput.addEventListener('input', () => { renderFontOptions(); renderTypePreview(); });
  typeSizeInput.addEventListener('input', () => { typeSize = +typeSizeInput.value; renderTypePreview(); });

  // ── Saved signature (localStorage) ──
  const SAVED_KEY = 'pdfhome-saved-signature-v1';
  function getSavedSignature() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || 'null');
    } catch (e) { return null; }
  }
  // Show "use saved" chip in footer if one exists
  const saved = getSavedSignature();
  if (saved && saved.dataUrl) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'sig-saved-chip';
    chip.title = 'Use your saved signature';
    chip.innerHTML = `<img src="${saved.dataUrl}" alt="Saved signature" /><span>Use saved signature</span>`;
    chip.addEventListener('click', async () => {
      try {
        const res = await fetch(saved.dataUrl);
        const blob = await res.blob();
        onSave({ blob, inkColor: saved.inkColor || currentColor, penStyle: saved.penStyle || 'saved' });
        closeModal();
      } catch (e) { /* ignore */ }
    });
    modalEl.querySelector('.sig-footer-left').appendChild(chip);
  }

  async function persistSignature(blob, inkColor, penStyle) {
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((res, rej) => {
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(blob);
      });
      // Keep it small: localStorage limit ~5MB; signature PNGs are tiny
      if (typeof dataUrl === 'string' && dataUrl.length < 1500000) {
        localStorage.setItem(SAVED_KEY, JSON.stringify({ dataUrl, inkColor, penStyle }));
      }
    } catch (e) { /* storage unavailable — non-fatal */ }
  }

  // Apply Action
  modalEl.querySelector('#sig-btn-apply').addEventListener('click', async () => {
    if (sigMode === 'type') {
      const name = typeInput.value.trim();
      if (!name) {
        alert('Please type your name first.');
        typeInput.focus();
        return;
      }
      const blob = await generateTypedBlob();
      if (blob) {
        onSave({ blob, inkColor: currentColor, penStyle: 'typed:' + typeFont.id });
        persistSignature(blob, currentColor, 'typed:' + typeFont.id);
        closeModal();
      }
      return;
    }
    if (strokes.length === 0) {
      alert('Please draw a signature before applying.');
      return;
    }
    const blob = await generateSignatureBlob();
    if (blob) {
      onSave({
        blob,
        inkColor: currentColor,
        penStyle: currentPen
      });
      persistSignature(blob, currentColor, currentPen);
      closeModal();
    }
  });

  // Initialize and observe sizing
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 40);
}
