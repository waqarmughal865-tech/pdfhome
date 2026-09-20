/**
 * Main entry point — router, theme init, tool loading.
 */

import { renderShell, updateActiveNav } from './components/Shell.js';
import { renderHome } from './tools/home.js';
import { renderMerge } from './tools/merge.js';
import { renderSplit } from './tools/split.js';
import { renderPages } from './tools/pages.js';
import { renderPdfToImage } from './tools/pdf-to-image.js';
import { renderImageToPdf } from './tools/image-to-pdf.js';
import { renderCompress } from './tools/compress.js';
import { renderConvert } from './tools/convert.js';
import { renderPrivacy, renderTerms, renderContact } from './components/Legal.js';

// ── Theme initialization ──
let initialTheme = 'light';
try {
  const savedTheme = localStorage.getItem('pdf-home-theme') || localStorage.getItem('pdf-workspace-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    initialTheme = savedTheme;
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    initialTheme = 'dark';
  }
} catch (e) {}
document.documentElement.setAttribute('data-theme', initialTheme);
document.documentElement.dataset.theme = initialTheme;

// ── Route map ──
const routes = {
  '#/': renderHome,
  '#/merge': renderMerge,
  '#/split': renderSplit,
  '#/pages': (container) => renderPages(container),
  '#/sign-pdf': (container) => renderPages(container, {
    initialTab: 'watermark',
    initialWmType: 'draw',
    title: 'Sign PDF — Digital Signature',
    subtitle: 'Draw handwritten signatures or place transparent stamps with 9-point grid alignment'
  }),
  '#/watermark-pdf': (container) => renderPages(container, {
    initialTab: 'watermark',
    initialWmType: 'text',
    title: 'Watermark PDF — Text & Image Stamps',
    subtitle: 'Add customizable text stamps or logo watermarks with opacity, scale, and rotation control'
  }),
  '#/protect-pdf': (container) => renderPages(container, {
    initialTab: 'protect',
    title: 'Protect PDF — Password Encryption',
    subtitle: 'Apply secure password locking and standard 128-bit encryption to confidential files'
  }),
  '#/crop-pdf': (container) => renderPages(container, {
    initialTab: 'crop',
    title: 'Crop PDF Margins',
    subtitle: 'Visually trim page margins, scanner borders, or crop to custom box dimensions'
  }),
  '#/page-numbers': (container) => renderPages(container, {
    initialTab: 'numbers',
    title: 'Number PDF Pages',
    subtitle: 'Insert formatted headers or footers (Page X of Y) with cover page exclusion'
  }),
  '#/organize-pdf': (container) => renderPages(container, {
    initialTab: 'organize',
    title: 'Organize & Rotate Pages',
    subtitle: 'Rotate pages 90°, reorder with drag & drop, or delete unwanted pages'
  }),
  '#/pdf-to-image': renderPdfToImage,
  '#/image-to-pdf': renderImageToPdf,
  '#/compress': renderCompress,
  // Central Convert Hub & Dedicated Conversion Routes
  '#/convert': (container) => renderConvert(container, 'pdf-to-docx'),
  '#/pdf-to-docx': (container) => renderConvert(container, 'pdf-to-docx'),
  '#/docx-to-pdf': (container) => renderConvert(container, 'docx-to-pdf'),
  '#/pdf-to-excel': (container) => renderConvert(container, 'pdf-to-excel'),
  '#/excel-to-pdf': (container) => renderConvert(container, 'excel-to-pdf'),
  '#/pdf-to-slides': (container) => renderConvert(container, 'pdf-to-slides'),
  '#/slides-to-pdf': (container) => renderConvert(container, 'slides-to-pdf'),
  '#/ocr-pdf': (container) => renderConvert(container, 'ocr-pdf'),
  // Legal & Support Routes
  '#/privacy': renderPrivacy,
  '#/terms': renderTerms,
  '#/contact': renderContact,
};

let contentEl = null;

function navigate() {
  const hash = window.location.hash || '#/';
  const renderFn = routes[hash] || renderHome;

  updateActiveNav(hash);
  
  // Clear previous content
  if (contentEl) {
    contentEl.innerHTML = '';
  }

  renderFn(contentEl);
}

// ── Init ──
function init() {
  const appEl = document.getElementById('app');
  contentEl = renderShell(appEl);
  
  window.addEventListener('hashchange', navigate);
  navigate();

  // Allow transitions only after the initial paint is completely settled
  window.requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 60);
  });
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
