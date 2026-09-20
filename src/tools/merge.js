/**
 * Merge PDF Tool — upload multiple PDFs and/or Images in any order, reorder, merge, download.
 * Supports combining PDFs and images with drag-and-drop, position controls, page expansion, and output renaming.
 */

import { icon } from '../components/icons.js';
import { validateFileType, checkFileSize, sanitizeFilename, formatFileSize, readFileAsArrayBuffer, PDF_MIME, IMAGE_MIMES, getBasename } from '../utils/file-utils.js';
import { downloadArrayBuffer } from '../utils/download.js';
import { mergeMixedItems, getPDFInfo } from '../pdf/engine.js';
import { loadPDFDocument, renderPageToCanvas } from '../pdf/renderer.js';
import { classifyError } from '../utils/error-handler.js';
import Sortable from 'sortablejs';

const ALLOWED_MIMES = [PDF_MIME, ...IMAGE_MIMES];

export function renderMerge(container) {
  // Array of items to merge:
  // {
  //   id: string,
  //   type: 'pdf' | 'pdf-page' | 'image',
  //   file: File,
  //   name: string,
  //   size: number,
  //   mimeType: string,
  //   pageCount: number,
  //   pageIndex?: number,  // 0-based for pdf-page
  //   pageNumber?: number, // 1-based for pdf-page
  //   buffer?: ArrayBuffer,
  //   previewUrl?: string, // object URL or data URL
  // }
  let items = [];

  function render() {
    const hasItems = items.length > 0;
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-page__header">
          <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
          <div>
            <h1 class="tool-page__title">Merge PDF & Images</h1>
            <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
              Combine PDF files and images into a single professional PDF document
            </p>
          </div>
        </div>

        <div class="tool-page__body">
          <div class="tool-layout">
            
            <!-- LEFT SIDE: Upload & Actions Panel -->
            <aside class="tool-sidebar">
              <!-- Compact Drop Zone -->
              <div class="drop-zone drop-zone--compact" id="merge-drop">
                <div class="drop-zone__icon">${icon('upload', 36)}</div>
                <p class="drop-zone__title">Upload PDF or Images</p>
                <p class="drop-zone__subtitle">Drop files here or click to browse</p>
                <label class="drop-zone__browse" for="merge-input">Add Files</label>
                <input type="file" id="merge-input" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" multiple />
              </div>

              <!-- Document Queue & Actions Card -->
              <div class="tool-sidebar__card">
                <div style="display:flex; align-items:center; justify-content:space-between">
                  <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); text-transform:uppercase; letter-spacing:0.05em; color:var(--color-text-tertiary)">
                    Document Queue
                  </span>
                  ${hasItems ? `<button class="btn btn-ghost btn-sm" id="merge-clear" style="padding:2px 6px; font-size:var(--text-xs)">Clear All</button>` : ''}
                </div>

                <div style="font-size:var(--text-sm); color:var(--color-text-secondary)">
                  <strong>${items.length}</strong> ${items.length === 1 ? 'item' : 'items'} in document
                  ${hasItems ? `<span style="display:block; font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">Total size: ${formatFileSize(items.reduce((acc, it) => acc + (it.size || 0), 0))}</span>` : ''}
                </div>

                <button class="btn btn-primary btn-lg" id="merge-btn" style="width:100%" ${items.length < 2 ? 'disabled' : ''}>
                  ${icon('merge', 18)} Merge ${items.length} Items into PDF
                </button>

                <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); display:flex; align-items:center; justify-content:center; gap:var(--space-1); margin:0">
                  ${icon('lock', 12)} 100% Client-Side Processing
                </p>
              </div>

              <div id="merge-progress" style="display:none"></div>
              <div id="merge-error" style="display:none"></div>
            </aside>

            <!-- RIGHT SIDE: Work Site -->
            <main class="tool-worksite" id="merge-worksite">
              ${!hasItems ? `
                <div class="worksite-empty">
                  <div class="worksite-empty__icon">${icon('layers', 32)}</div>
                  <h3 class="worksite-empty__title">Your Workspace is Ready</h3>
                  <p class="worksite-empty__subtitle">
                    Upload your PDF documents and pictures using the panel on the left.
                    They will appear here where you can arrange them before or after any page, expand PDF pages, and preview your merged document.
                  </p>
                  <label class="btn btn-secondary btn-sm" for="merge-input" style="cursor:pointer">
                    ${icon('upload', 14)} Select Files to Begin
                  </label>
                </div>
              ` : `
                <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-2); border-bottom:1px solid var(--color-border); padding-bottom:var(--space-3)">
                  <div>
                    <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:0">
                      Arrange Document Pages
                    </h2>
                    <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:2px 0 0">
                      Drag items or use the position selector / arrows to place images before or after any page
                    </p>
                  </div>
                  <span style="font-size:var(--text-xs); font-weight:var(--weight-semibold); color:var(--color-accent); background:var(--color-accent-subtle); padding:4px 8px; border-radius:var(--radius-sm)">
                    ${items.length} Items Active
                  </span>
                </div>

                <div class="file-list" id="merge-file-list" style="margin-top:var(--space-2)">
                  ${items.map((it, i) => `
                    <div class="file-item" data-index="${i}" style="display:flex; align-items:center; gap:var(--space-3); padding:var(--space-3) var(--space-4); background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-lg); margin-bottom:var(--space-2); transition:box-shadow 0.15s ease">
                      
                      <!-- Drag Handle -->
                      <span class="file-item__drag" title="Drag to reorder" style="cursor:grab; color:var(--color-text-tertiary); display:flex; align-items:center">
                        ${icon('grip', 18)}
                      </span>

                      <!-- Position Order Badge -->
                      <span style="font-size:var(--text-xs); font-weight:var(--weight-bold); background:var(--color-bg-tertiary); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:2px 6px; min-width:26px; text-align:center">
                        #${i + 1}
                      </span>

                      <!-- Thumbnail / Icon Preview -->
                      <div style="width:40px; height:48px; border-radius:var(--radius-sm); border:1px solid var(--color-border); background:var(--color-bg-tertiary); display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; position:relative">
                        ${it.previewUrl ? `
                          <img src="${it.previewUrl}" alt="Preview" style="width:100%; height:100%; object-fit:cover" />
                        ` : `
                          <div style="color:${it.type === 'image' ? 'var(--color-success)' : 'var(--color-accent)'}">
                            ${it.type === 'image' ? icon('image', 20) : icon('fileText', 20)}
                          </div>
                        `}
                      </div>

                      <!-- Item Info -->
                      <div class="file-item__info" style="flex:1; min-width:0">
                        <div class="file-item__name" style="font-weight:var(--weight-medium); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                          ${sanitizeFilename(it.name)}
                        </div>
                        <div class="file-item__meta" style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px; display:flex; align-items:center; gap:var(--space-2); flex-wrap:wrap">
                          <span style="font-weight:var(--weight-semibold); color:${it.type === 'image' ? 'var(--color-success)' : 'var(--color-accent)'}">
                            ${it.type === 'image' ? 'Image Page' : it.type === 'pdf-page' ? `PDF Page ${it.pageNumber}` : 'PDF Document'}
                          </span>
                          <span>·</span>
                          <span>${it.type === 'pdf-page' ? `from ${sanitizeFilename(it.file.name)}` : formatFileSize(it.size)}</span>
                          ${it.type === 'pdf' ? `
                            <span>·</span>
                            <span>${it.pageCount ? `${it.pageCount} pages` : 'reading...'}</span>
                          ` : ''}
                        </div>
                      </div>

                      <!-- Expand to Pages (for multi-page PDF) -->
                      ${it.type === 'pdf' && it.pageCount > 1 ? `
                        <button class="btn btn-ghost btn-sm" data-action="expand" data-idx="${i}" title="Expand into individual pages to insert images between pages" style="font-size:var(--text-xs); padding:4px 8px; color:var(--color-accent)">
                          ${icon('columns', 14)} <span style="margin-left:4px">Expand Pages</span>
                        </button>
                      ` : ''}

                      <!-- Move to specific position dropdown -->
                      <div style="display:flex; align-items:center; gap:4px">
                        <select class="input" data-action="move-select" data-idx="${i}" title="Move before or after" style="font-size:var(--text-xs); padding:3px 6px; width:auto; height:28px; border-radius:var(--radius-sm)">
                          ${items.map((_, pos) => `
                            <option value="${pos}" ${pos === i ? 'selected' : ''}>
                              ${pos === i ? `Pos #${pos + 1} (Current)` : `Move to #${pos + 1}`}
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <!-- Positioning Controls (Move Up / Down) -->
                      <div style="display:flex; align-items:center; gap:2px">
                        <button class="btn btn-ghost btn-sm" data-action="up" data-idx="${i}" title="Move before previous item" style="padding:4px; height:28px; width:28px" ${i === 0 ? 'disabled' : ''}>
                          ${icon('moveLeft', 14)}
                        </button>
                        <button class="btn btn-ghost btn-sm" data-action="down" data-idx="${i}" title="Move after next item" style="padding:4px; height:28px; width:28px" ${i === items.length - 1 ? 'disabled' : ''}>
                          ${icon('moveRight', 14)}
                        </button>
                        <button class="file-item__remove" data-remove="${i}" title="Remove item" style="color:var(--color-danger); padding:4px; margin-left:var(--space-1)">
                          ${icon('x', 14)}
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div id="merge-result" style="display:none; margin-top:var(--space-4)"></div>
              `}
            </main>

          </div>
        </div>
      </div>
    `;

    setupListeners();
  }

  function setupListeners() {
    const dropZone = document.getElementById('merge-drop');
    const fileInput = document.getElementById('merge-input');
    const fileList = document.getElementById('merge-file-list');

    // Drop zone events
    dropZone.addEventListener('click', (e) => {
      if (e.target === fileInput || e.target.closest('label')) return;
      fileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drop-zone--active');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drop-zone--active');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drop-zone--active');
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    // Worksite drop support
    const worksite = document.getElementById('merge-worksite');
    if (worksite) {
      worksite.addEventListener('dragover', (e) => {
        e.preventDefault();
        worksite.style.borderColor = 'var(--color-accent)';
      });
      worksite.addEventListener('dragleave', () => {
        worksite.style.borderColor = '';
      });
      worksite.addEventListener('drop', (e) => {
        e.preventDefault();
        worksite.style.borderColor = '';
        if (e.dataTransfer.files?.length > 0) {
          handleFiles(e.dataTransfer.files);
        }
      });
    }

    // Sortable drag-and-drop
    if (fileList) {
      Sortable.create(fileList, {
        handle: '.file-item__drag',
        animation: 200,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: (evt) => {
          const item = items.splice(evt.oldIndex, 1)[0];
          items.splice(evt.newIndex, 0, item);
          render();
        },
      });
    }

    // Move dropdown selector
    document.querySelectorAll('[data-action="move-select"]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const fromIdx = parseInt(e.currentTarget.dataset.idx, 10);
        const toIdx = parseInt(e.currentTarget.value, 10);
        if (fromIdx !== toIdx) {
          const item = items.splice(fromIdx, 1)[0];
          items.splice(toIdx, 0, item);
          render();
        }
      });
    });

    // Move Up / Move Down buttons
    document.querySelectorAll('[data-action="up"], [data-action="down"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        if (action === 'up' && idx > 0) {
          const item = items.splice(idx, 1)[0];
          items.splice(idx - 1, 0, item);
          render();
        } else if (action === 'down' && idx < items.length - 1) {
          const item = items.splice(idx, 1)[0];
          items.splice(idx + 1, 0, item);
          render();
        }
      });
    });

    // Expand PDF to individual pages
    document.querySelectorAll('[data-action="expand"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx, 10);
        const target = items[idx];
        if (target.type !== 'pdf' || !target.pageCount || target.pageCount <= 1) return;

        // Ensure buffer
        let buf = target.buffer;
        if (!buf || buf.byteLength === 0) {
          buf = await readFileAsArrayBuffer(target.file);
          target.buffer = buf;
        }

        // Expand into individual page entries
        const expandedPages = [];
        for (let p = 0; p < target.pageCount; p++) {
          expandedPages.push({
            id: Date.now() + '_' + Math.random().toString(36).slice(2),
            type: 'pdf-page',
            file: target.file,
            name: `${getBasename(target.name)} — Page ${p + 1}`,
            size: Math.round(target.size / target.pageCount),
            mimeType: 'application/pdf',
            pageCount: 1,
            pageIndex: p,
            pageNumber: p + 1,
            buffer: buf,
            previewUrl: null,
          });
        }

        items.splice(idx, 1, ...expandedPages);
        render();

        // Asynchronously render thumbnails for expanded pages
        generatePageThumbnails(expandedPages, buf);
      });
    });

    // Remove buttons
    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.remove, 10);
        const removed = items.splice(idx, 1)[0];
        if (removed.previewUrl && removed.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(removed.previewUrl);
        }
        render();
      });
    });

    // Merge button
    document.getElementById('merge-btn')?.addEventListener('click', doMerge);

    // Clear button
    document.getElementById('merge-clear')?.addEventListener('click', () => {
      items.forEach(it => {
        if (it.previewUrl && it.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(it.previewUrl);
        }
      });
      items = [];
      render();
    });
  }

  async function handleFiles(fileList) {
    for (const file of fileList) {
      if (!validateFileType(file, ALLOWED_MIMES)) {
        showError('Invalid File', `"${sanitizeFilename(file.name)}" is not a supported PDF or image file.`);
        continue;
      }
      const sizeCheck = checkFileSize(file);
      if (!sizeCheck.ok) {
        showError('File Too Large', sizeCheck.message);
        continue;
      }

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const id = Date.now() + '_' + Math.random().toString(36).slice(2);

      let previewUrl = null;
      if (!isPdf) {
        previewUrl = URL.createObjectURL(file);
      }

      const entry = {
        id,
        type: isPdf ? 'pdf' : 'image',
        file,
        name: sanitizeFilename(file.name),
        size: file.size,
        mimeType: file.type,
        pageCount: isPdf ? 0 : 1,
        buffer: null,
        previewUrl,
      };

      items.push(entry);

      if (isPdf) {
        // Read buffer, get page count, and render first page thumbnail
        readFileAsArrayBuffer(file).then(async (buf) => {
          entry.buffer = buf;
          try {
            const info = await getPDFInfo(buf);
            entry.pageCount = info.pageCount;
            // Render 1st page thumbnail
            const pdfDoc = await loadPDFDocument(buf);
            const canvas = await renderPageToCanvas(pdfDoc, 1, 0.2);
            entry.previewUrl = canvas.toDataURL('image/jpeg', 0.8);
          } catch (e) {
            entry.pageCount = 1;
          }
          render();
        }).catch(() => {});
      }
    }
    render();
  }

  async function generatePageThumbnails(pageEntries, buffer) {
    try {
      const pdfDoc = await loadPDFDocument(buffer);
      for (const pageEntry of pageEntries) {
        try {
          const canvas = await renderPageToCanvas(pdfDoc, pageEntry.pageNumber, 0.2);
          pageEntry.previewUrl = canvas.toDataURL('image/jpeg', 0.8);
        } catch (err) {}
      }
      render();
    } catch (err) {}
  }

  async function doMerge() {
    const progressEl = document.getElementById('merge-progress');
    const resultEl = document.getElementById('merge-result');
    const errorEl = document.getElementById('merge-error');
    const mergeBtn = document.getElementById('merge-btn');

    if (mergeBtn) mergeBtn.disabled = true;
    progressEl.style.display = 'block';
    resultEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    try {
      progressEl.innerHTML = `
        <div class="progress">
          <p class="progress__label">Combining PDFs and Images...</p>
          <div class="progress__bar-track"><div class="progress__bar-fill" id="merge-progress-bar" style="width: 0%"></div></div>
          <p class="progress__detail" id="merge-progress-detail">Preparing content...</p>
          <p class="progress__privacy">${icon('lock', 12)} Processing locally on your device</p>
        </div>
      `;

      // Prepare items in user's exact chosen sequence
      const itemsToMerge = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        let buffer;
        let mimeType = it.mimeType || it.file.type;

        if (it.type === 'image') {
          // Convert WebP to JPEG via canvas if needed
          if (mimeType === 'image/webp') {
            const bitmap = await createImageBitmap(it.file);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0);
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
            buffer = await blob.arrayBuffer();
            mimeType = 'image/jpeg';
          } else {
            buffer = await readFileAsArrayBuffer(it.file);
          }
        } else {
          // PDF or PDF Page
          if (it.buffer && it.buffer.byteLength > 0) {
            buffer = it.buffer;
          } else {
            buffer = await readFileAsArrayBuffer(it.file);
            it.buffer = buffer;
          }
        }

        itemsToMerge.push({
          type: it.type,
          buffer,
          mimeType,
          name: it.name,
          pageIndex: it.pageIndex,
        });

        const pct = Math.round(((i + 1) / items.length) * 35);
        const bar = document.getElementById('merge-progress-bar');
        if (bar) bar.style.width = `${pct}%`;
      }

      // Merge items into one PDF
      const result = await mergeMixedItems(itemsToMerge, (current, total) => {
        const pct = 35 + Math.round((current / total) * 65);
        const bar = document.getElementById('merge-progress-bar');
        const detail = document.getElementById('merge-progress-detail');
        if (bar) bar.style.width = `${pct}%`;
        if (detail) detail.textContent = `Merging item ${current} of ${total}`;
      });

      progressEl.style.display = 'none';
      resultEl.style.display = 'block';

      const resultSize = result.byteLength;
      const firstBase = items.length > 0 ? getBasename(sanitizeFilename(items[0].name)) : 'document';
      const defaultName = `${firstBase}_merged`;

      resultEl.innerHTML = `
        <div class="result-card">
          <div class="result-card__icon">${icon('checkCircle', 28)}</div>
          <h3 class="result-card__title">Merged Successfully!</h3>
          <p class="result-card__meta">${items.length} items (PDFs & images) combined · ${formatFileSize(resultSize)}</p>

          <div style="margin: var(--space-4) 0; max-width: 420px; margin-left: auto; margin-right: auto; text-align: left;">
            <label style="display:block; font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
              Output Filename:
            </label>
            <div style="display:flex; align-items:center; background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:0 var(--space-3)">
              <span style="color:var(--color-text-tertiary); margin-right:var(--space-2)">${icon('edit', 14)}</span>
              <input type="text" id="merge-filename-input" class="input" value="${defaultName}" style="border:none; padding:var(--space-2) 0; flex:1" />
              <span style="color:var(--color-text-tertiary); font-size:var(--text-sm)">.pdf</span>
            </div>
          </div>

          <button class="btn btn-primary btn-lg" id="merge-download">
            ${icon('download', 18)} Download Merged PDF
          </button>
        </div>
      `;

      document.getElementById('merge-download').addEventListener('click', () => {
        const customName = document.getElementById('merge-filename-input')?.value.trim();
        const finalName = customName ? sanitizeFilename(customName) : defaultName;
        downloadArrayBuffer(result, `${finalName}.pdf`);
      });
    } catch (err) {
      progressEl.style.display = 'none';
      const { title, message } = classifyError(err);
      showError(title, message);
      if (mergeBtn) mergeBtn.disabled = false;
    }
  }

  function showError(title, message) {
    const errorEl = document.getElementById('merge-error');
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.innerHTML = `
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
