/**
 * Image to PDF Tool — upload images, rotate, reorder, and create PDF.
 * Supports image editing (rotation, reordering, deletion) and output renaming.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, readFileAsDataURL, IMAGE_MIMES, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer } from '../utils/download.js';
import { imagesToPDF } from '../pdf/engine.js';
import { classifyError } from '../utils/error-handler.js';
import Sortable from 'sortablejs';

export function renderImageToPdf(container) {
  let images = []; // { file, dataUrl, id, rotation: 0 }

  function render() {
    const hasImages = images.length > 0;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">Image to PDF</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Convert multiple photos, scans, and graphics into a standard multi-page PDF
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">

            <!-- LEFT SIDE: Upload & Actions Panel -->
            <aside class="tool-sidebar">
              <!-- Compact Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="i2p-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">Upload Images</p>
                <p class="drop-zone__subtitle">JPG, PNG, or WebP pictures</p>
                <label class="drop-zone__browse" for="i2p-input">Add Images</label>
                <input type="file" id="i2p-input" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple />
              </div>

              <!-- Queue & Control Card -->
              <div class="tool-sidebar__card">
                <div style="display:flex; align-items:center; justify-content:space-between">
                  <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                    Image Gallery
                  </span>
                  ${hasImages ? `<button class="btn btn-ghost btn-sm" id="i2p-clear" style="padding:2px 6px; font-size:var(--text-xs)">Clear All</button>` : ''}
                </div>

                <div style="font-size:var(--text-sm); color:var(--color-text-secondary)">
                  <strong>${images.length}</strong> ${images.length === 1 ? 'image' : 'images'} added
                  ${hasImages ? `<span style="display:block; font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">Total size: ${formatFileSize(images.reduce((acc, img) => acc + (img.file?.size || 0), 0))}</span>` : ''}
                </div>

                ${hasImages ? `
                  <button class="btn btn-secondary btn-sm" id="i2p-rotate-all" style="justify-content:center">
                    ${icon('rotateCw', 14)} Rotate All 90°
                  </button>
                ` : ''}

                <button class="btn btn-primary btn-lg" id="i2p-create" style="width:100%" ${!hasImages ? 'disabled' : ''}>
                  ${icon('paperclip', 18)} Create PDF from Images
                </button>

                <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                  ${icon('lock', 12)} 100% Client-Side Processing
                </p>
              </div>

              <div id="i2p-progress" style="display:none"></div>
              <div id="i2p-error" style="display:none"></div>
            </aside>

            <!-- RIGHT SIDE: Work Site -->
            <main class="tool-worksite" id="i2p-worksite">
              ${!hasImages ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('image', 32)}</div>
                  <h3 class="worksite-empty__title">Your Workspace is Ready</h3>
                  <p class="worksite-empty__subtitle">
                    Upload your pictures using the panel on the left.
                    All images will appear here in a visual gallery where you can rotate, reorder with arrows, or delete them before creating your PDF.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="i2p-input" style="cursor:pointer">
                    ${icon('upload', 14)} Choose Images to Begin
                  </label>
                </div>
              ` : `
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2); border-bottom:1px solid var(--color-border); padding-bottom:var(--space-3)">
                  <div>
                    <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:0">
                      Organize & Edit Images
                    </h2>
                    <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:2px 0 0">
                      Rotate individual photos, shift positions with arrows, or drag to reorder
                    </p>
                  </div>
                  <span style="font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-success); background:var(--color-success-light); padding:4px 8px; border-radius:var(--radius-sm)">
                    ${images.length} Images
                  </span>
                </div>

                <div class="image-grid" id="i2p-grid" style="margin-top:var(--space-2)">
                  ${images.map((img, i) => `
                    <div class="image-grid__item" data-index="${i}" style="position:relative; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:var(--space-2); display:flex; flex-direction:column; align-items:center; gap:var(--space-2)">
                      
                      <div style="width:100%; height:130px; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:var(--radius-sm); background:var(--color-bg-primary)">
                        <img src="${img.dataUrl}" alt="Image ${i + 1}" style="max-width:100%; max-height:100%; object-fit:contain; transform:rotate(${img.rotation || 0}deg); transition:transform 0.2s" />
                      </div>

                      <!-- Per-Image Editing Controls -->
                      <div style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:2px 4px; border-top:1px solid var(--color-border-light)">
                        <span class="thumbnail__page-num" style="position:static; margin:0">#${i + 1}</span>
                        <div style="display:flex; gap:2px">
                          <button class="btn btn-ghost btn-sm" data-action="rotate" data-idx="${i}" title="Rotate 90°" style="padding:4px; height:26px; width:26px">
                            ${icon('rotateCw', 12)}
                          </button>
                          <button class="btn btn-ghost btn-sm" data-action="left" data-idx="${i}" title="Move Left" style="padding:4px; height:26px; width:26px" ${i === 0 ? 'disabled' : ''}>
                            ${icon('moveLeft', 12)}
                          </button>
                          <button class="btn btn-ghost btn-sm" data-action="right" data-idx="${i}" title="Move Right" style="padding:4px; height:26px; width:26px" ${i === images.length - 1 ? 'disabled' : ''}>
                            ${icon('moveRight', 12)}
                          </button>
                          <button class="btn btn-ghost btn-sm" data-action="delete" data-idx="${i}" title="Remove" style="padding:4px; height:26px; width:26px; color:var(--color-danger)">
                            ${icon('trash', 12)}
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div id="i2p-result" style="display:none; margin-top:var(--space-4)"></div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;
    setupListeners();
  }

  function setupListeners() {
    const dropZone = document.getElementById('i2p-drop');
    const fileInput = document.getElementById('i2p-input');

    if (dropZone) {
      dropZone.addEventListener('click', (e) => { if (e.target === fileInput || e.target.closest('label')) return; fileInput.click(); });
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
      dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); handleFiles(e.dataTransfer.files); });
    }
    if (fileInput) fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); e.target.value = ''; });

    // Worksite drop support
    const worksite = document.getElementById('i2p-worksite');
    if (worksite) {
      worksite.addEventListener('dragover', (e) => { e.preventDefault(); worksite.style.borderColor = 'var(--color-accent)'; });
      worksite.addEventListener('dragleave', () => { worksite.style.borderColor = ''; });
      worksite.addEventListener('drop', (e) => {
        e.preventDefault();
        worksite.style.borderColor = '';
        if (e.dataTransfer.files?.length > 0) handleFiles(e.dataTransfer.files);
      });
    }

    // Sortable grid
    const grid = document.getElementById('i2p-grid');
    if (grid) {
      Sortable.create(grid, {
        animation: 200,
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          const item = images.splice(evt.oldIndex, 1)[0];
          images.splice(evt.newIndex, 0, item);
          render();
        },
      });
    }

    // Action buttons (rotate, move, delete)
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = e.currentTarget.dataset.action;
        const idx = parseInt(e.currentTarget.dataset.idx, 10);

        if (action === 'rotate') {
          images[idx].rotation = ((images[idx].rotation || 0) + 90) % 360;
          render();
        } else if (action === 'left' && idx > 0) {
          const item = images.splice(idx, 1)[0];
          images.splice(idx - 1, 0, item);
          render();
        } else if (action === 'right' && idx < images.length - 1) {
          const item = images.splice(idx, 1)[0];
          images.splice(idx + 1, 0, item);
          render();
        } else if (action === 'delete') {
          images.splice(idx, 1);
          render();
        }
      });
    });

    // Rotate all
    document.getElementById('i2p-rotate-all')?.addEventListener('click', () => {
      images.forEach(img => {
        img.rotation = ((img.rotation || 0) + 90) % 360;
      });
      render();
    });

    document.getElementById('i2p-clear')?.addEventListener('click', () => { images = []; render(); });
    document.getElementById('i2p-create')?.addEventListener('click', doCreate);
  }

  async function handleFiles(fileList) {
    for (const file of fileList) {
      if (!validateFileType(file, IMAGE_MIMES)) {
        showError('Invalid File', `"${sanitizeFilename(file.name)}" is not a supported image format.`);
        continue;
      }
      const sc = checkFileSize(file);
      if (!sc.ok) { showError('File Too Large', sc.message); continue; }

      try {
        const dataUrl = await readFileAsDataURL(file);
        images.push({
          file,
          dataUrl,
          id: Date.now() + '_' + Math.random().toString(36).slice(2),
          rotation: 0
        });
      } catch (err) {
        showError('Read Error', `Could not read "${sanitizeFilename(file.name)}".`);
      }
    }
    render();
  }

  async function doCreate() {
    const progressEl = document.getElementById('i2p-progress');
    const resultEl = document.getElementById('i2p-result');
    const btn = document.getElementById('i2p-create');
    if (btn) btn.disabled = true;
    progressEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
      progressEl.innerHTML = `
        <div class="progress">
          <p class="progress__label">Creating PDF...</p>
          <div class="progress__bar-track"><div class="progress__bar-fill" id="i2p-bar" style="width:0%"></div></div>
          <p class="progress__detail" id="i2p-detail">Processing images...</p>
          <p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p>
        </div>
      `;

      // Prepare image buffers applying rotation
      const imageData = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const rot = img.rotation || 0;

        let buffer;
        let type = img.file.type;

        if (rot !== 0 || type === 'image/webp') {
          // Render image to canvas to apply rotation and convert WebP if needed
          const bitmap = await createImageBitmap(img.file);
          const canvas = document.createElement('canvas');
          const isPerpendicular = rot === 90 || rot === 270;
          canvas.width = isPerpendicular ? bitmap.height : bitmap.width;
          canvas.height = isPerpendicular ? bitmap.width : bitmap.height;
          const ctx = canvas.getContext('2d');
          
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rot * Math.PI) / 180);
          ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

          const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
          buffer = await blob.arrayBuffer();
          type = 'image/jpeg';
        } else {
          buffer = await readFileAsArrayBuffer(img.file);
        }

        imageData.push({ buffer, type });

        const pct = Math.round(((i + 1) / images.length) * 50);
        const bar = document.getElementById('i2p-bar');
        if (bar) bar.style.width = `${pct}%`;
      }

      const result = await imagesToPDF(imageData, (cur, tot) => {
        const pct = 50 + Math.round((cur / tot) * 50);
        const bar = document.getElementById('i2p-bar');
        const detail = document.getElementById('i2p-detail');
        if (bar) bar.style.width = `${pct}%`;
        if (detail) detail.textContent = `Embedding image ${cur} of ${tot}`;
      });

      const defaultName = images.length > 0 
        ? `${getBasename(sanitizeFilename(images[0].file.name))}_images`
        : 'images_converted';

      progressEl.style.display = 'none';
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="result-card">
          <div class="result-card__icon">${icon('checkCircle', 28)}</div>
          <h3 class="result-card__title">PDF Created Successfully!</h3>
          <p class="result-card__meta">${images.length} images · ${formatFileSize(result.byteLength)}</p>

          <div style="margin: var(--space-4) 0; max-width: 420px; margin-left: auto; margin-right: auto; text-align: left;">
            <label style="display:block; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
              Output Filename:
            </label>
            <div style="display:flex; align-items:center; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:0 var(--space-3)">
              <span style="color:var(--color-text-tertiary); margin-right:var(--space-2)">${icon('edit', 14)}</span>
              <input type="text" id="i2p-filename-input" class="input" value="${defaultName}" style="border:none; padding:var(--space-2) 0; flex:1" />
              <span style="color:var(--color-text-tertiary); font-size:var(--text-sm)">.pdf</span>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="i2p-download">
            ${icon('download', 18)} Download PDF
          </button>
        </div>
      `;

      document.getElementById('i2p-download').addEventListener('click', () => {
        const inputName = document.getElementById('i2p-filename-input')?.value.trim();
        const finalName = inputName ? sanitizeFilename(inputName) : defaultName;
        downloadArrayBuffer(result, `${finalName}.pdf`);
      });
    } catch (err) {
      progressEl.style.display = 'none';
      showError(classifyError(err).title, classifyError(err).message);
      if (btn) btn.disabled = false;
    }
  }

  function showError(title, message) {
    const el = document.getElementById('i2p-error');
    if (el) {
      el.style.display = 'block';
      el.innerHTML = `<div class="error-display"><span class="error-display__icon">${icon('alertCircle', 20)}</span><div class="error-display__content"><p class="error-display__title">${title}</p><p class="error-display__message">${message}</p></div><button class="error-display__dismiss" onclick="this.closest('.error-display').parentElement.style.display='none'">${icon('x', 16)}</button></div>`;
    }
  }

  render();
}
