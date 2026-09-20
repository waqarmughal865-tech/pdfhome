/**
 * Home page — comprehensive suite of PDF & Document tools with Instant Live Search.
 */

import { icon } from '../components/icons.js';
import { escapeHtml } from '../utils/file-utils.js';
import { renderAdSlot } from '../components/AdSlot.js';

export const TOOL_REGISTRY = [
  {
    id: 'sign-pdf',
    name: 'Sign PDF (Digital Signature)',
    desc: 'Draw handwritten signatures or place transparent stamps with 9-point grid alignment',
    category: 'sign',
    iconClass: 'pages',
    iconName: 'penTool',
    hash: '#/sign-pdf',
    badge: 'Popular',
    keywords: ['signature on pdf', 'sign pdf', 'transparent signature', 'digital signature', 'draw signature', 'e-sign', 'sign', 'handwritten signature', 'stamp signature', 'electronic signature', 'online pdf signer']
  },
  {
    id: 'watermark-pdf',
    name: 'Watermark PDF',
    desc: 'Add custom text stamps or logo watermarks with opacity, scale, and rotation control',
    category: 'security',
    iconClass: 'convert',
    iconName: 'stamp',
    hash: '#/watermark-pdf',
    badge: 'Security',
    keywords: ['watermark on pdf', 'watermark pdf', 'add watermark', 'confidential stamp', 'logo watermark', 'copyright stamp', 'text watermark']
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF (Password Lock)',
    desc: 'Apply secure password locking and standard 128-bit encryption to confidential files',
    category: 'security',
    iconClass: 'compress',
    iconName: 'lock',
    hash: '#/protect-pdf',
    badge: 'Encrypted',
    keywords: ['protect pdf', 'password protect pdf', 'lock pdf', 'encrypt pdf', 'secure pdf', 'set password', 'restrict pdf']
  },
  {
    id: 'pdf-to-docx',
    name: 'PDF to Word (DOCX)',
    desc: 'Extract text, formatting, and layout to fully editable Microsoft Word documents',
    category: 'convert',
    iconClass: 'docx',
    iconName: 'fileText',
    hash: '#/pdf-to-docx',
    badge: 'High Demand',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'editable docx', 'word document', 'export word']
  },
  {
    id: 'ocr-pdf',
    name: 'Picture PDF to Text (OCR)',
    desc: 'Transform scanned image PDFs into crisp, searchable and selectable text PDFs',
    category: 'convert',
    iconClass: 'ocr',
    iconName: 'scan',
    hash: '#/ocr-pdf',
    badge: 'AI Engine',
    keywords: ['ocr pdf', 'picture pdf to text', 'searchable pdf', 'scanned pdf to text', 'extract text from image pdf', 'optical character recognition', 'tesseract']
  },
  {
    id: 'merge',
    name: 'Merge PDF',
    desc: 'Combine multiple PDFs and images into a single unified document with custom ordering',
    category: 'core',
    iconClass: 'merge',
    iconName: 'merge',
    hash: '#/merge',
    badge: 'Essential',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'unite pdf', 'merge documents', 'combine files']
  },
  {
    id: 'split',
    name: 'Split PDF',
    desc: 'Extract specific pages, split into ranges, or separate into individual PDF files',
    category: 'core',
    iconClass: 'split',
    iconName: 'scissors',
    hash: '#/split',
    keywords: ['split pdf', 'extract pages', 'separate pdf', 'cut pdf', 'page extractor', 'divide pdf']
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    desc: 'Reduce file size with live visual comparison and smart size-guard protection',
    category: 'core',
    iconClass: 'compress',
    iconName: 'compress',
    hash: '#/compress',
    badge: 'Smart Size',
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'optimize pdf', 'smaller pdf', 'downsize pdf']
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF Margins',
    desc: 'Visually trim page margins, scanner borders, or crop to custom box dimensions',
    category: 'organize',
    iconClass: 'pages',
    iconName: 'crop',
    hash: '#/crop-pdf',
    keywords: ['crop pdf', 'trim margins', 'crop pages', 'trim pdf', 'cut borders', 'remove scanner margins']
  },
  {
    id: 'page-numbers',
    name: 'Number PDF Pages',
    desc: 'Insert formatted headers or footers (Page X of Y) with cover page exclusion',
    category: 'organize',
    iconClass: 'pages',
    iconName: 'hash',
    hash: '#/page-numbers',
    keywords: ['number pdf pages', 'page numbers', 'header footer', 'bates numbering', 'add page numbers']
  },
  {
    id: 'organize-pdf',
    name: 'Organize & Rotate Pages',
    desc: 'Rotate pages 90°, reorder with drag & drop, or delete unwanted pages',
    category: 'organize',
    iconClass: 'pages',
    iconName: 'layers',
    hash: '#/organize-pdf',
    keywords: ['organize pdf', 'rotate pdf', 'reorder pages', 'delete page from pdf', 'sort pages', 'turn pdf']
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel (XLSX)',
    desc: 'Convert tabular data and rows into structured Microsoft Excel spreadsheets',
    category: 'convert',
    iconClass: 'excel',
    iconName: 'fileSpreadsheet',
    hash: '#/pdf-to-excel',
    keywords: ['pdf to excel', 'pdf to xlsx', 'convert pdf to sheet', 'extract table from pdf', 'spreadsheet']
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel (XLSX) to PDF',
    desc: 'Render Excel sheets and table data into formatted PDF documents',
    category: 'convert',
    iconClass: 'excel',
    iconName: 'fileSpreadsheet',
    hash: '#/excel-to-pdf',
    keywords: ['excel to pdf', 'xlsx to pdf', 'convert sheet to pdf', 'export excel as pdf']
  },
  {
    id: 'pdf-to-slides',
    name: 'PDF to Slides (PPTX)',
    desc: 'Create widescreen PowerPoint presentation decks from your PDF pages',
    category: 'convert',
    iconClass: 'slides',
    iconName: 'presentation',
    hash: '#/pdf-to-slides',
    keywords: ['pdf to slides', 'pdf to pptx', 'pdf to powerpoint', 'convert pdf to presentation']
  },
  {
    id: 'slides-to-pdf',
    name: 'Slides (PPTX) to PDF',
    desc: 'Convert PowerPoint slide presentations into high-resolution PDF decks',
    category: 'convert',
    iconClass: 'slides',
    iconName: 'presentation',
    hash: '#/slides-to-pdf',
    keywords: ['pptx to pdf', 'slides to pdf', 'powerpoint to pdf', 'export slides to pdf']
  },
  {
    id: 'docx-to-pdf',
    name: 'Word (DOCX) to PDF',
    desc: 'Convert Microsoft Word documents into clean, print-ready PDF files',
    category: 'convert',
    iconClass: 'docx',
    iconName: 'fileText',
    hash: '#/docx-to-pdf',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'save as pdf']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    desc: 'Render high-resolution JPG or PNG pictures from PDF pages with ZIP download',
    category: 'core',
    iconClass: 'pdf-to-image',
    iconName: 'image',
    hash: '#/pdf-to-image',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'extract pictures from pdf', 'convert pdf to pictures']
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    desc: 'Convert JPG, PNG, and WebP pictures into a clean, uniform PDF document',
    category: 'core',
    iconClass: 'image-to-pdf',
    iconName: 'paperclip',
    hash: '#/image-to-pdf',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'photos to pdf', 'pictures to pdf']
  },
  {
    id: 'pages',
    name: 'Page Editor Workbench',
    desc: 'Comprehensive multi-tool workspace with live top preview and bottom editing suite',
    category: 'organize',
    iconClass: 'pages',
    iconName: 'layers',
    hash: '#/pages',
    badge: 'Suite',
    keywords: ['page editor', 'editor', 'pdf editor', 'workbench', 'edit pdf']
  }
];

export function renderHome(container) {
  let currentCategory = 'all';
  let searchQuery = '';

  function getFilteredCards() {
    return TOOL_REGISTRY.filter(card => {
      const matchCat = currentCategory === 'all' || 
                       (currentCategory === 'popular' && Boolean(card.badge)) ||
                       (currentCategory === 'sign' && (card.category === 'sign' || card.category === 'security')) ||
                       (currentCategory === 'convert' && card.category === 'convert') ||
                       (currentCategory === 'organize' && card.category === 'organize') ||
                       (currentCategory === 'core' && card.category === 'core');

      if (!matchCat) return false;

      if (!searchQuery) return true;

      const q = searchQuery.toLowerCase().trim();
      const inName = card.name.toLowerCase().includes(q);
      const inDesc = card.desc.toLowerCase().includes(q);
      const inKeywords = card.keywords?.some(k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));

      return inName || inDesc || inKeywords;
    });
  }

  function renderCardsHtml(cards) {
    if (cards.length === 0) {
      return `
        <div style="grid-column: 1 / -1; text-align:center; padding:var(--space-12) var(--space-4); background:var(--color-bg-secondary); border:1px dashed var(--color-border); border-radius:var(--radius-xl)">
          <div style="width:48px; height:48px; margin:0 auto var(--space-3); color:var(--color-text-tertiary)">
            ${icon('search', 40)}
          </div>
          <h3 style="font-size:var(--text-lg); font-weight:var(--weight-semibold); margin-bottom:6px">No matching PDF tools found</h3>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); max-width:400px; margin:0 auto var(--space-4)">
            Try searching for "signature on pdf", "sign", "word", "excel", "compress", or "protect".
          </p>
          <button class="btn btn-secondary btn-sm" id="btn-clear-search-empty">
            Clear Search
          </button>
        </div>
      `;
    }

    return cards.map(card => `
      <a class="tool-card" href="${card.hash}" id="tool-${card.id}">
        <div class="tool-card__icon tool-card__icon--${card.iconClass}">
          ${icon(card.iconName, 26)}
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; width:100%">
          <span class="tool-card__name">${card.name}</span>
          ${card.badge ? `<span style="font-size:10px; font-weight:700; background:rgba(99,102,241,0.1); color:var(--color-primary); padding:2px 6px; border-radius:4px">${card.badge}</span>` : ''}
        </div>
        <span class="tool-card__desc">${card.desc}</span>
      </a>
    `).join('');
  }

  container.innerHTML = `
    <div class="home">
      <div class="home__hero">
        <h1 class="home__title">All-in-One Local PDF & Document Suite</h1>
        <p class="home__subtitle">
          Free, fast, and secure PDF tools and document conversions. 
          Sign, convert, merge, edit, and protect your PDF documents directly in your browser.
        </p>

        <!-- Live Instant Search Bar -->
        <div class="search-container">
          <div class="search-input-wrap">
            <span style="color:var(--color-accent)">${icon('search', 20)}</span>
            <input 
              type="text" 
              id="home-search-input" 
              class="search-input" 
              placeholder='Search PDF tools (e.g., "signature on pdf", "word", "compress", "protect")...'
              autocomplete="off"
              spellcheck="false"
            />
            <button id="home-search-clear" style="background:none; border:none; color:var(--color-text-tertiary); cursor:pointer; display:none; padding:4px" title="Clear Search">
              ${icon('x', 18)}
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="search-filter-pills" id="home-filter-pills">
            <button class="filter-pill filter-pill--active" data-category="all">All Tools (${TOOL_REGISTRY.length})</button>
            <button class="filter-pill" data-category="popular">Popular</button>
            <button class="filter-pill" data-category="sign">Sign & Security</button>
            <button class="filter-pill" data-category="convert">Convert Office</button>
            <button class="filter-pill" data-category="organize">Organize & Edit</button>
            <button class="filter-pill" data-category="core">Core Utilities</button>
          </div>
        </div>

        <!-- Search Status Bar -->
        <div class="search-stats-bar" id="home-search-stats" style="display:none">
          <span id="home-stats-text"></span>
          <button class="btn btn-ghost btn-sm" id="btn-stats-clear" style="font-size:11px">Reset filter</button>
        </div>

        <!-- AdSense / Engagement Leaderboard Slot -->
        <div style="margin-top:var(--space-6)">
          ${renderAdSlot('leaderboard', 'homeBanner')}
        </div>
      </div>

      <!-- Tools Grid -->
      <div class="home__tools" id="home-tools-grid">
        ${renderCardsHtml(TOOL_REGISTRY)}
      </div>

      <!-- Feature Highlights & User Engagement Cards -->
      <section class="home-features" style="margin-top:var(--space-12); display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-4)">
        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(99,102,241,0.1); color:var(--color-primary); display:flex; align-items:center; justify-content:center">
            ${icon('zap', 20)}
          </div>
          <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Instant Local Speed</h3>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Files never queue on a remote server. Document conversions, OCR character extraction, and digital signatures render instantaneously in memory.
          </p>
        </div>

        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center">
            ${icon('shieldCheck', 20)}
          </div>
          <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Private By Architecture</h3>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Confidential contracts, tax records, and legal forms stay strictly inside your browser. No telemetry or server retention.
          </p>
        </div>

        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(234,179,8,0.1); color:#ca8a04; display:flex; align-items:center; justify-content:center">
            ${icon('fileSpreadsheet', 20)}
          </div>
          <h3 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Smart Office Suite</h3>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Turn PDF reports into editable Word (.docx), tables into Excel (.xlsx), and decks into PowerPoint (.pptx) with full formatting intact.
          </p>
        </div>
      </section>

      <!-- Bottom Engagement Banner -->
      <div style="margin-top:var(--space-8)">
        ${renderAdSlot('banner', 'workspaceBottom')}
      </div>
    </div>
  `;

  // Bind Search & Filters
  const searchInput = container.querySelector('#home-search-input');
  const searchClear = container.querySelector('#home-search-clear');
  const toolsGrid = container.querySelector('#home-tools-grid');
  const statsBar = container.querySelector('#home-search-stats');
  const statsText = container.querySelector('#home-stats-text');
  const pills = container.querySelectorAll('.filter-pill');

  function updateGrid() {
    const cards = getFilteredCards();
    toolsGrid.innerHTML = renderCardsHtml(cards);

    // Update clear button
    if (searchClear) {
      searchClear.style.display = searchQuery ? 'block' : 'none';
    }

    // Update stats bar
    if (statsBar && statsText) {
      if (searchQuery || currentCategory !== 'all') {
        statsBar.style.display = 'flex';
        const parts = [];
        if (searchQuery) parts.push(`matching "<strong>${escapeHtml(searchQuery)}</strong>"`);
        if (currentCategory !== 'all') parts.push(`in category <em>${escapeHtml(currentCategory)}</em>`);
        statsText.innerHTML = `Showing ${cards.length} tool${cards.length === 1 ? '' : 's'} ${parts.join(' ')}`;
      } else {
        statsBar.style.display = 'none';
      }
    }

    // Re-bind empty state clear button if visible
    const emptyClear = container.querySelector('#btn-clear-search-empty');
    if (emptyClear) {
      emptyClear.addEventListener('click', resetSearch);
    }
  }

  function resetSearch() {
    searchQuery = '';
    currentCategory = 'all';
    if (searchInput) searchInput.value = '';
    pills.forEach(p => p.classList.toggle('filter-pill--active', p.getAttribute('data-category') === 'all'));
    updateGrid();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateGrid();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      updateGrid();
    });
  }

  container.querySelector('#btn-stats-clear')?.addEventListener('click', resetSearch);

  pills.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-category');
      pills.forEach(p => p.classList.toggle('filter-pill--active', p === btn));
      updateGrid();
    });
  });
}
