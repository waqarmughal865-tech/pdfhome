/**
 * Static Pre-Rendering Engine for PDFHome (https://pdfhome.site)
 * 
 * Generates SEO-ready, fully pre-rendered static HTML files for every route:
 * - Homepage (/) -> dist/index.html
 * - 18 Dedicated Tool routes -> dist/[tool]/index.html
 * - Legal & Info routes -> dist/[legal]/index.html
 * 
 * Ensures search engine crawlers (Googlebot, Bingbot, Yandex, social scrapers)
 * detect 100% of the content, H1 headings, How-To steps, FAQs, canonical URLs,
 * and Schema.org structured data on the initial HTTP response without waiting for JS.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMAIN, TOOL_SEO_DATA } from '../src/seo/seo-metadata.js';
import { TOOL_REGISTRY } from '../src/tools/home.js';
import { icon } from '../src/components/icons.js';
import { renderAdSlot } from '../src/components/AdSlot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const DIST_INDEX = path.resolve(DIST_DIR, 'index.html');

if (!fs.existsSync(DIST_INDEX)) {
  console.error('Error: dist/index.html not found. Run "vite build" first.');
  process.exit(1);
}

// H4: strip the keyword-stuffed <noscript> block (contains a second <h1>)
// from the base template so every generated page has exactly one visible H1.
let baseTemplate = fs.readFileSync(DIST_INDEX, 'utf-8');
baseTemplate = baseTemplate.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');

// Copy the render-blocking theme-init script to dist/. Vite does not bundle
// plain <script src> tags, so without this /theme-init.js would 404 and
// zero-flash theming would regress. (vite build empties dist/ first, and this
// script runs after the build, so the copy is safe.)
const themeInitSrc = path.resolve(ROOT_DIR, 'src', 'theme-init.js');
if (fs.existsSync(themeInitSrc)) {
  fs.copyFileSync(themeInitSrc, path.resolve(DIST_DIR, 'theme-init.js'));
  console.log('  ✓ Copied: src/theme-init.js -> dist/theme-init.js');
}

/**
 * Shell Navigation Links
 */
const NAV_TOOLS = [
  { id: 'sign', label: 'Sign PDF', path: '/sign-pdf' },
  { id: 'pages', label: 'Page Editor', path: '/pages' },
  { id: 'convert', label: 'Convert', path: '/convert' },
  { id: 'merge', label: 'Merge', path: '/merge-pdf' },
  { id: 'split', label: 'Split', path: '/split-pdf' },
  { id: 'compress', label: 'Compress', path: '/compress-pdf' },
];

/**
 * Build App Shell (Header + Main Container + Footer)
 */
function buildShellHtml(mainContentHtml, currentPath = '/') {
  const navHtml = NAV_TOOLS.map(t => {
    const isActive = t.path === currentPath;
    return `
      <a class="app-header__nav-link ${isActive ? 'app-header__nav-link--active' : ''}"
         href="${t.path}"
         data-tool="${t.id}">
        ${t.label}
      </a>
    `;
  }).join('');

  const navHtmlMobile = NAV_TOOLS.map(t => {
    const isActive = t.path === currentPath;
    return `
      <a class="app-header__nav-link mobile-nav__link ${isActive ? 'app-header__nav-link--active' : ''}"
         href="${t.path}"
         data-tool="${t.id}">
        ${t.label}
      </a>
    `;
  }).join('');

  return `
    <header class="app-header" id="app-header">
      <a class="app-header__logo" href="/" id="logo-link" aria-label="PDF Home">
        <span class="app-header__logo-mark">
          <img src="/favicon.svg" alt="PDFHome" class="app-header__logo-img" width="32" height="32" />
        </span>
        <span class="app-header__logo-text">PDF<span class="logo-accent">Home</span></span>
      </a>
      <nav class="app-header__nav" id="main-nav" aria-label="Primary">
        ${navHtml}
      </nav>
      <div class="app-header__right">
        <button class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
          ${icon('menu', 20)}
        </button>
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle dark mode">
          ${icon('moon', 18)}
        </button>
      </div>
      <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>
        ${navHtmlMobile}
      </nav>
    </header>

    <main class="main-content" id="main-content">
      ${mainContentHtml}
    </main>

    <footer class="app-footer" id="app-footer">
      <div class="app-footer__inner">
        <div class="app-footer__grid">
          
          <!-- Column 1: Brand & Contact -->
          <div style="display:flex; flex-direction:column; gap:var(--space-3)">
            <a class="app-header__logo" href="/" style="margin-bottom:4px">
              <span class="app-header__logo-mark">
                <img src="/favicon.svg" alt="PDFHome" class="app-header__logo-img" width="32" height="32" />
              </span>
              <span class="app-header__logo-text">PDF<span class="logo-accent">Home</span></span>
            </a>
            <p style="font-size:13px; color:var(--color-text-secondary); line-height:1.6; margin:0">
              High-performance, private document suite. Fast in-memory editing, bidirectional office conversion, and digital signatures with zero file retention.
            </p>
            <div style="margin-top:var(--space-2); display:flex; flex-direction:column; gap:6px">
              <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-tertiary)">
                Contact & Support
              </span>
              <a href="/contact" class="app-footer__link" style="color:var(--color-accent); font-weight:600; text-decoration:none; display:flex; align-items:center; gap:6px">
                ${icon('mail', 14)} Send Us a Message
              </a>
            </div>
          </div>

          <!-- Column 2: Core PDF Tools -->
          <div>
            <div class="app-footer__col-title">Core Tools</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="/merge-pdf">${icon('chevronRight', 12)} Merge PDF</a></li>
              <li><a class="app-footer__link" href="/split-pdf">${icon('chevronRight', 12)} Split PDF</a></li>
              <li><a class="app-footer__link" href="/compress-pdf">${icon('chevronRight', 12)} Compress PDF</a></li>
              <li><a class="app-footer__link" href="/sign-pdf">${icon('chevronRight', 12)} Sign PDF Online</a></li>
              <li><a class="app-footer__link" href="/rotate-pdf">${icon('chevronRight', 12)} Rotate PDF</a></li>
              <li><a class="app-footer__link" href="/delete-pdf-pages">${icon('chevronRight', 12)} Delete PDF Pages</a></li>
            </ul>
          </div>

          <!-- Column 3: Office Conversions -->
          <div>
            <div class="app-footer__col-title">Office & Images</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="/pdf-to-word">${icon('chevronRight', 12)} PDF to Word</a></li>
              <li><a class="app-footer__link" href="/pdf-to-excel">${icon('chevronRight', 12)} PDF to Excel</a></li>
              <li><a class="app-footer__link" href="/pdf-to-powerpoint">${icon('chevronRight', 12)} PDF to PowerPoint</a></li>
              <li><a class="app-footer__link" href="/pdf-to-jpg">${icon('chevronRight', 12)} PDF to JPG</a></li>
              <li><a class="app-footer__link" href="/jpg-to-pdf">${icon('chevronRight', 12)} JPG to PDF</a></li>
              <li><a class="app-footer__link" href="/ocr-pdf">${icon('chevronRight', 12)} OCR PDF</a></li>
            </ul>
          </div>

          <!-- Column 4: Page & Security -->
          <div>
            <div class="app-footer__col-title">Page & Security</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="/protect-pdf">${icon('chevronRight', 12)} Protect PDF</a></li>
              <li><a class="app-footer__link" href="/watermark-pdf">${icon('chevronRight', 12)} Watermark PDF</a></li>
              <li><a class="app-footer__link" href="/crop-pdf">${icon('chevronRight', 12)} Crop PDF</a></li>
              <li><a class="app-footer__link" href="/page-numbers">${icon('chevronRight', 12)} Number Pages</a></li>
            </ul>
          </div>

          <!-- Column 5: Company & Legal -->
          <div>
            <div class="app-footer__col-title">Company & Legal</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="/privacy">${icon('chevronRight', 12)} Privacy Policy</a></li>
              <li><a class="app-footer__link" href="/terms">${icon('chevronRight', 12)} Terms of Service</a></li>
              <li><a class="app-footer__link" href="/about">${icon('chevronRight', 12)} About Us</a></li>
              <li><a class="app-footer__link" href="/contact">${icon('chevronRight', 12)} Contact Us</a></li>
              <li><button type="button" class="app-footer__link" data-cookie-settings style="background:none; border:none; padding:0; cursor:pointer; font-family:inherit; color:inherit; text-align:left; display:flex; align-items:center; gap:var(--space-1)">${icon('chevronRight', 12)} Cookie Settings</button></li>
            </ul>
          </div>

        </div>

        <div class="app-footer__bottom">
          <div class="app-footer__copy">
            &copy; 2026 PDFHome. All rights reserved. 100% In-Browser Local Document Processing.
          </div>
          <div class="app-footer__privacy-badge">
            <span class="privacy-badge__dot"></span>
            <span>Zero Remote Storage Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Build Homepage Content
 */
function buildHomeContentHtml() {
// Only link prerendered routes in static HTML: /pages and /convert are real
// SPA routes but have no static page, so linking them here would serve
// crawler-facing 404s. They remain reachable via in-app navigation.
const prerenderedCards = TOOL_REGISTRY.filter(card => TOOL_SEO_DATA[card.id]);
  const cardsHtml = prerenderedCards.map(card => `
    <a class="tool-card" href="${card.path}" data-category="${card.category}">
      <div class="tool-card__header">
        <div class="tool-card__icon tool-card__icon--${card.iconClass}">
          ${icon(card.iconName, 22)}
        </div>
        <span class="tool-card__name">${card.name}</span>
        ${card.badge ? `<span style="font-size:10px; font-weight:700; background:rgba(99,102,241,0.1); color:var(--color-primary); padding:2px 6px; border-radius:4px">${card.badge}</span>` : ''}
      </div>
      <span class="tool-card__desc">${card.desc}</span>
    </a>
  `).join('');

  return `
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
            <button class="filter-pill filter-pill--active" data-category="all">All Tools (${prerenderedCards.length})</button>
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
      </div>

      <!-- Tools Grid -->
      <div class="home__tools" id="home-tools-grid">
        ${cardsHtml}
      </div>

      <!-- Feature Highlights & User Engagement Cards -->
      <section class="home-features" style="margin-top:var(--space-12); display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:var(--space-4)">
        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(99,102,241,0.1); color:var(--color-primary); display:flex; align-items:center; justify-content:center">
            ${icon('zap', 20)}
          </div>
          <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Instant Local Speed</h2>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Files never queue on a remote server. Document conversions, OCR character extraction, and digital signatures render instantaneously in memory.
          </p>
        </div>

        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center">
            ${icon('shieldCheck', 20)}
          </div>
          <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Private By Architecture</h2>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Confidential contracts, tax records, and legal forms stay strictly inside your browser. Document files never leave your browser; ads use cookies per our privacy policy.
          </p>
        </div>

        <div class="feature-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
          <div style="width:38px; height:38px; border-radius:var(--radius-lg); background:rgba(234,179,8,0.1); color:#ca8a04; display:flex; align-items:center; justify-content:center">
            ${icon('fileSpreadsheet', 20)}
          </div>
          <h2 style="font-size:var(--text-md); font-weight:var(--weight-bold); margin:4px 0 0 0">Smart Office Suite</h2>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin:0; line-height:1.5">
            Turn PDF reports into editable Word (.docx), tables into Excel (.xlsx), and decks into PowerPoint (.pptx) with full formatting intact.
          </p>
        </div>
      </section>

      <!-- Homepage FAQ Section for SEO -->
      <section class="seo-faq-section" style="margin-top:var(--space-12)" aria-labelledby="home-faq-title">
        <h2 id="home-faq-title" class="seo-section-title" style="text-align:center">Frequently Asked Questions</h2>
        <p style="text-align:center; color:var(--color-text-secondary); font-size:var(--text-sm); max-width:600px; margin:0 auto var(--space-6)">
          Everything you need to know about our privacy-first, zero-upload PDF tools.
        </p>
        <div class="seo-faq-list">
          <details class="seo-faq-item" open>
            <summary class="seo-faq-question">What is PDFHome and how does it process files?</summary>
            <div class="seo-faq-answer">
              PDFHome is a comprehensive, client-side PDF utility suite. All operations—including merging, splitting, compressing, e-signing, and converting to Word/Excel—execute directly within your web browser using HTML5 Canvas, WebAssembly, and modern JavaScript engines.
            </div>
          </details>
          <details class="seo-faq-item">
            <summary class="seo-faq-question">Are my PDF documents uploaded to external servers?</summary>
            <div class="seo-faq-answer">
              No. PDFHome has zero server upload infrastructure for document processing. Your files remain 100% on your local machine and never leave your computer or phone memory.
            </div>
          </details>
          <details class="seo-faq-item">
            <summary class="seo-faq-question">Is PDFHome completely free without watermarks or limits?</summary>
            <div class="seo-faq-answer">
              Yes, all PDF tools on PDFHome are completely free to use with no account registration, no subscriptions, and no watermarks added to your downloaded documents.
            </div>
          </details>
          <details class="seo-faq-item">
            <summary class="seo-faq-question">Which document formats can I convert?</summary>
            <div class="seo-faq-answer">
              PDFHome supports bidirectional conversions between PDF and Microsoft Word (.docx), Excel (.xlsx), PowerPoint (.pptx), JPG, PNG, and WebP, plus optical character recognition (OCR) for scanned PDFs.
            </div>
          </details>
          <details class="seo-faq-item">
            <summary class="seo-faq-question">Does PDFHome work on mobile devices and all browsers?</summary>
            <div class="seo-faq-answer">
              Yes. PDFHome is fully responsive and compatible with all modern browsers including Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge across desktop, tablet, and mobile devices.
            </div>
          </details>
        </div>
      </section>

      <!-- Semantic SEO Content Section — Visible to all crawlers including JS-rendering bots -->
      <article class="seo-semantic-content" style="margin-top:var(--space-12); background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8)">
        <h2 style="font-size:var(--text-lg); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-4)">About PDFHome — Free Online PDF Tools</h2>
        <p style="font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.7; margin-bottom:var(--space-4)">
          PDFHome is a free online PDF editor and document converter. Merge PDF files, split PDF pages, compress PDF size, convert PDF to Word, convert PDF to Excel, convert PDF to PowerPoint, convert PDF to JPG images, convert JPG to PDF, add digital signatures to PDF, add watermarks to PDF, password protect PDF, crop PDF margins, add page numbers to PDF, rotate PDF pages, delete PDF pages, and perform OCR on scanned PDFs — all 100% free, private, and directly in your web browser with zero server uploads.
        </p>
        <p style="font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.7; margin-bottom:var(--space-4)">
          Unlike other online PDF tools that upload your files to remote servers, PDFHome processes everything locally on your device using advanced HTML5, WebAssembly, and JavaScript technologies. Your confidential contracts, tax documents, legal forms, resumes, financial statements, and personal files never leave your computer or mobile device.
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-3); margin-top:var(--space-4)">
          <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); line-height:1.6">
            <strong style="color:var(--color-text-secondary)">PDF Editor Tools:</strong>
            Merge PDF, Split PDF, Compress PDF, Rotate PDF, Delete PDF Pages, Crop PDF Margins, Add Page Numbers to PDF
          </div>
          <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); line-height:1.6">
            <strong style="color:var(--color-text-secondary)">PDF Conversion Tools:</strong>
            PDF to Word DOCX, PDF to Excel XLSX, PDF to PowerPoint PPTX, PDF to JPG PNG, JPG to PDF, Word to PDF, Excel to PDF
          </div>
          <div style="font-size:var(--text-xs); color:var(--color-text-tertiary); line-height:1.6">
            <strong style="color:var(--color-text-secondary)">PDF Security Tools:</strong>
            Sign PDF Online, E-Sign PDF, Digital Signature PDF, Watermark PDF, Password Protect PDF, Encrypt PDF, OCR PDF Text Recognition
          </div>
        </div>
      </article>

      <!-- Bottom Engagement Banner -->
      <div style="margin-top:var(--space-8)">
        ${renderAdSlot('banner', 'workspaceBottom')}
      </div>
    </div>
  `;
}

/**
 * Build Tool Page Content
 */
function buildToolPageHtml(seoData) {
  // Related cards
  const relatedCardsHtml = (seoData.relatedTools || [])
    .map(relKey => {
      const relTool = TOOL_SEO_DATA[relKey];
      if (!relTool) return '';
      return `
        <a href="${relTool.slug}" class="related-tool-card">
          <div class="related-tool-card__header">
            <span class="related-tool-card__icon">${icon('fileText', 20)}</span>
            <span class="related-tool-card__name">${relTool.name}</span>
          </div>
          <p class="related-tool-card__desc">${relTool.metaDescription.slice(0, 110)}...</p>
          <span class="related-tool-card__link">Use tool ${icon('chevronRight', 14)}</span>
        </a>
      `;
    })
    .join('');

  // How-To steps
  const howToHtml = (seoData.howTo || [])
    .map(step => `
      <div class="seo-step-card">
        <div class="seo-step-card__badge">${step.step}</div>
        <h3 class="seo-step-card__title">${step.title}</h3>
        <p class="seo-step-card__desc">${step.desc}</p>
      </div>
    `)
    .join('');

  // Features
  const featuresHtml = (seoData.features || [])
    .map(feat => `
      <div class="seo-feature-item">
        <div class="seo-feature-item__icon">${icon('check', 18)}</div>
        <div>
          <h4 class="seo-feature-item__title">${feat.title}</h4>
          <p class="seo-feature-item__desc">${feat.desc}</p>
        </div>
      </div>
    `)
    .join('');

  // FAQs
  const faqsHtml = (seoData.faqs || [])
    .map((faq, idx) => `
      <details class="seo-faq-item" ${idx === 0 ? 'open' : ''}>
        <summary class="seo-faq-item__question">
          <span>${faq.q}</span>
          <span class="seo-faq-item__chevron">${icon('chevronDown', 16)}</span>
        </summary>
        <div class="seo-faq-item__answer">
          <p>${faq.a}</p>
        </div>
      </details>
    `)
    .join('');

  return `
    <div class="tool-page-wrapper">
      
      <!-- Top Breadcrumbs -->
      <nav class="seo-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li aria-hidden="true">${icon('chevronRight', 12)}</li>
          <li aria-current="page">${seoData.name}</li>
        </ol>
      </nav>

      <!-- Page Header with H1 and Intro -->
      <header class="tool-page-header">
        <h1 class="tool-page-header__title">${seoData.h1}</h1>
        <p class="tool-page-header__intro">${seoData.intro}</p>
      </header>

      <!-- Interactive Tool Workspace Mount Area with Instant Upload Dropzone -->
      <div class="tool-workspace-mount" id="tool-interactive-mount">
        <div class="dropzone" id="dropzone" role="button" tabindex="0">
          <div class="dropzone__icon">${icon('upload', 44)}</div>
          <div class="dropzone__title">Select or drag &amp; drop files here</div>
          <div class="dropzone__subtitle">In-browser processing · Document files never leave your browser</div>
          <div class="dropzone__btn-wrap" style="margin-top:var(--space-3)">
            <button class="btn btn-primary btn-lg" type="button">Choose Files</button>
          </div>
        </div>
      </div>

      <!-- How to Use Step-by-Step Guide -->
      <section class="seo-section seo-how-to" aria-labelledby="how-to-heading">
        <h2 id="how-to-heading" class="seo-section__title">How to Use ${seoData.name} Online</h2>
        <div class="seo-steps-grid">
          ${howToHtml}
        </div>
      </section>

      <!-- Key Features & Privacy Trust Section -->
      <section class="seo-section seo-features" aria-labelledby="features-heading">
        <h2 id="features-heading" class="seo-section__title">Why Use PDFHome for ${seoData.name}?</h2>
        <div class="seo-features-grid">
          ${featuresHtml}
        </div>
      </section>

      <!-- Frequently Asked Questions (FAQ) -->
      <section class="seo-section seo-faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="seo-section__title">Frequently Asked Questions</h2>
        <div class="seo-faq-list">
          ${faqsHtml}
        </div>
      </section>

      <!-- Related PDF Tools -->
      ${relatedCardsHtml ? `
        <section class="seo-section seo-related" aria-labelledby="related-heading">
          <h2 id="related-heading" class="seo-section__title">Related PDF Tools</h2>
          <div class="seo-related-grid">
            ${relatedCardsHtml}
          </div>
        </section>
      ` : ''}

      <!-- Bottom Engagement Slot -->
      <div style="margin-top:var(--space-8)">
        ${renderAdSlot('banner', 'toolPageBottom')}
      </div>

    </div>
  `;
}

/**
 * Shared Schema.org nodes reused across tool and legal pages.
 */
const ORG_SCHEMA_NODE = {
  '@type': 'Organization',
  '@id': `${DOMAIN}/#organization`,
  'name': 'PDFHome',
  'url': `${DOMAIN}/`,
  'logo': `${DOMAIN}/icon.png`,
  'contactPoint': {
    '@type': 'ContactPoint',
    'url': `${DOMAIN}/contact`,
    'contactType': 'customer support'
  }
};

const WEBSITE_SCHEMA_NODE = {
  '@type': 'WebSite',
  '@id': `${DOMAIN}/#website`,
  'url': `${DOMAIN}/`,
  'name': 'PDFHome',
  'description': 'Free, private, in-browser PDF suite for converting, signing, merging, compressing, and editing PDF files.'
};

/**
 * Build Schema JSON-LD Graph
 */
function buildToolSchemaJson(seoData, canonicalUrl) {
  const graph = [
    WEBSITE_SCHEMA_NODE,
    ORG_SCHEMA_NODE,
    {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': `${DOMAIN}/`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': seoData.name,
          'item': canonicalUrl
        }
      ]
    },
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#software`,
      'name': `${seoData.name} — PDFHome`,
      'url': canonicalUrl,
      'description': seoData.metaDescription,
      'applicationCategory': 'UtilitiesApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0.00',
        'priceCurrency': 'USD'
      }
    }
  ];

  if (seoData.howTo && seoData.howTo.length > 0) {
    graph.push({
      '@type': 'HowTo',
      'name': `How to use ${seoData.name} Online`,
      'description': seoData.intro,
      'step': seoData.howTo.map((h, idx) => ({
        '@type': 'HowToStep',
        'position': idx + 1,
        'name': h.title,
        'text': h.desc
      }))
    });
  }

  if (seoData.faqs && seoData.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      'mainEntity': seoData.faqs.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': f.a
        }
      }))
    });
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  }, null, 2);
}

/**
 * H6: page-appropriate schema for legal/info pages — minimal
 * Organization + BreadcrumbList only, no FAQPage/WebApplication.
 */
function buildLegalSchemaJson(pageName, canonicalUrl) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      ORG_SCHEMA_NODE,
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': `${DOMAIN}/`
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': pageName,
            'item': canonicalUrl
          }
        ]
      }
    ]
  }, null, 2);
}

/**
 * Build Full HTML Page from Base Template
 */
function createPageHtml({ title, description, canonicalUrl, mainContentHtml, currentPath = '/', customSchemaJson = null, noindex = false, modulePreloadTags = '' }) {
  let html = baseTemplate;

  // L2: drop the legacy meta keywords tag entirely (spam-signal pattern)
  html = html.replace(/<meta name="keywords" content="[\s\S]*?" \/>\n?/, '');

  // Robots (noindex for 404 page)
  if (noindex) {
    html = html.replace(/<meta name="robots" content="[\s\S]*?" \/>/, '<meta name="robots" content="noindex, follow" />');
  }

  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

  // Meta Description
  html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${description}" />`);

  // Canonical (dropped on noindex pages such as the 404 to avoid conflicting signals)
  if (noindex) {
    html = html.replace(/<link rel="canonical"[^>]*\/?>\n?/, '');
  } else {
    html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  }

  // Open Graph
  html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Twitter
  html = html.replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/, `<meta name="twitter:description" content="${description}" />`);

  // Schema.org JSON-LD
  if (customSchemaJson) {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${customSchemaJson}\n  </script>`);
  }

  // H11: modulepreload hints for shared engine chunks (tool pages only)
  if (modulePreloadTags) {
    html = html.replace('</head>', `${modulePreloadTags}\n</head>`);
  }

  // App Body
  const fullAppBody = buildShellHtml(mainContentHtml, currentPath);
  html = html.replace('<div id="app"></div>', `<div id="app">${fullAppBody}</div>`);

  return html;
}

/**
 * Write HTML file to destination path
 */
function writeHtmlFile(targetFilePath, content) {
  const dir = path.dirname(targetFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetFilePath, content, 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// EXECUTE PRE-RENDERING
// ─────────────────────────────────────────────────────────────

console.log('🚀 Starting PDFHome Static Pre-Rendering Engine...');

// 1. Homepage (/)
const homeHtml = createPageHtml({
  title: 'PDFHome — 100% Free Online PDF Tools & Office Converter (Private & Fast)',
  description: 'Free PDF tools — merge, split, compress, sign, convert to Word, Excel, JPG in your browser. Files never leave your browser; ads use cookies per our policy.',
  canonicalUrl: `${DOMAIN}/`,
  mainContentHtml: buildHomeContentHtml(),
  currentPath: '/'
});
writeHtmlFile(path.resolve(DIST_DIR, 'index.html'), homeHtml);
console.log('  ✓ Pre-rendered: / (dist/index.html)');

// 2. All 18 Tool Pages

// H11: modulepreload hints for the shared engine chunks (pdf-lib + pdf.js).
// Defensive: only inject chunk files that actually exist in dist/assets.
const ASSETS_DIR = path.resolve(DIST_DIR, 'assets');
const engineChunkFiles = fs.existsSync(ASSETS_DIR)
  ? fs.readdirSync(ASSETS_DIR).filter(f => /^es-.*\.js$/.test(f) || /^renderer-.*\.js$/.test(f))
  : [];
const toolPreloadTags = engineChunkFiles.map(f => `  <link rel="modulepreload" href="/assets/${f}" />`).join('\n');
if (engineChunkFiles.length > 0) {
  console.log(`  ℹ modulepreload hints: ${engineChunkFiles.join(', ')}`);
}

let toolCount = 0;
for (const [key, seoData] of Object.entries(TOOL_SEO_DATA)) {
  const cleanSlug = seoData.slug.replace(/^\//, '');
  const canonicalUrl = `${DOMAIN}${seoData.slug}`;
  const customSchema = buildToolSchemaJson(seoData, canonicalUrl);
  const toolContentHtml = buildToolPageHtml(seoData);

  const toolPageHtml = createPageHtml({
    title: seoData.metaTitle,
    description: seoData.metaDescription,
    canonicalUrl,
    mainContentHtml: toolContentHtml,
    currentPath: seoData.slug,
    customSchemaJson: customSchema,
    modulePreloadTags: toolPreloadTags
  });

  const outPath = path.resolve(DIST_DIR, cleanSlug, 'index.html');
  writeHtmlFile(outPath, toolPageHtml);
  toolCount++;
  console.log(`  ✓ Pre-rendered: ${seoData.slug} (dist/${cleanSlug}/index.html)`);
}

// 3. Privacy Policy (/privacy)
const privacyHtml = createPageHtml({
  title: 'Privacy Policy — PDFHome',
  description: 'Read the PDFHome Privacy Policy. 100% client-side, zero server uploads, and complete document confidentiality.',
  canonicalUrl: `${DOMAIN}/privacy`,
  mainContentHtml: `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Privacy Policy</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Effective Date: January 1, 2026 · Committed to 100% Client-Side In-Memory Execution
          </p>
        </div>
      </div>
      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">1. Introduction & In-Memory Architecture</h2>
          <p>
            PDFHome is designed from the ground up to protect your confidential documents, legal contracts, financial sheets, and signatures. All PDF editing, transparent handwritten signing, OCR text recognition, and bidirectional Office conversions execute <strong>100% in-memory within your local web browser session</strong>.
          </p>
          <p style="margin-top:var(--space-3)">
            <strong>We do not upload, transmit, store, or process your files on any remote server.</strong> Your files never leave your computer or phone.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">2. Information We Do Not Collect</h2>
          <ul style="list-style:disc; margin-left:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>No file uploads: Documents, PDFs, Word DOCX, Excel spreadsheets, or presentation slides are never sent to remote cloud storage.</li>
            <li>No digital signature storage: Transparent signatures and custom stamps drawn on your screen are destroyed when your browser tab is closed.</li>
            <li>No OCR document storage: Scanned text recognition runs locally via in-browser Web Workers.</li>
            <li>No personal tracking: We do not sell, rent, or trade user data to third parties.</li>
          </ul>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">3. Local Storage Usage</h2>
          <p>
            PDFHome uses browser <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">localStorage</code> on your device to keep the site working smoothly and remember your choices:
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-2); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>Your theme preference (Dark Mode or Light Mode).</li>
            <li>Your advertising-cookie choice for the consent banner (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdfhome-consent</code>).</li>
            <li>Contact-form support data: submission timestamps for rate limiting (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_history_v1</code>) and messages queued for delivery if you are offline (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_offline_queue</code>, which may include the name and email you typed). You can clear these at any time by clearing your browser's site data.</li>
          </ul>
          <p style="margin-top:var(--space-3)">
            No confidential document content, passwords, or document metadata are saved in permanent browser storage.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">4. Third-Party Libraries, Subprocessors & Network Destinations</h2>
          <p>
            Your <strong>document bytes</strong> never leave your browser, but loading and operating this website does involve the following third-party network destinations:
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2)">
            <li><strong>Google AdSense</strong> — serves advertisements and may set advertising cookies/beacons, but <em>only</em> after you click "Accept" on our cookie-consent banner. If you reject or ignore the banner, no AdSense code is loaded at all.</li>
            <li><strong>Google Fonts</strong> — font files are fetched per page view so the site renders correctly.</li>
            <li><strong>jsDelivr CDN</strong> — serves the tesseract.js and pdf.js worker files loaded at runtime when you use OCR or PDF rendering features.</li>
            <li><strong>Google Firebase Realtime Database</strong> — receives only the messages you intentionally submit through our contact form: your name, email address, message, topic, and browser locale. It never receives document content.</li>
          </ul>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">5. Third-Party Advertising & Google AdSense Cookie Disclosure</h2>
          <p>
            We partner with third-party advertising networks, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. These advertising partners may use cookies, web beacons, and similar technologies to gather information (not including your name, address, email, or telephone number) about your visits to this and other websites in order to deliver relevant ads about goods and services of interest to you.
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to PDFHome and/or other sites on the Internet.</li>
            <li>You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:var(--color-accent); text-decoration:underline">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendors' use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style="color:var(--color-accent); text-decoration:underline">aboutads.info</a>.</li>
          </ul>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">6. GDPR & CCPA Compliance</h2>
          <p>We respect the privacy rights of all visitors under the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Because our core document manipulation engine operates strictly client-side within your browser memory with zero file uploads or account profiling, we do not sell or share personal data derived from your files.</p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">7. Contact & Support Desk</h2>
          <p>
            If you have questions, inquiries, or feedback regarding this Privacy Policy, AdSense disclosures, or data security, please reach out via our secure online contact desk:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="/contact" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              Official PDF Home Support Desk
            </a>
          </div>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">8. Contact Data Retention & Deletion Requests</h2>
          <p>
            Messages submitted through our contact form are stored in our private Firebase Realtime Database (name, email address, message, topic, submission time, and browser locale) so our team can respond to your inquiry. We keep contact submissions only as long as needed to handle your request and maintain a support history, after which they are deleted.
          </p>
          <p style="margin-top:var(--space-3)">
            To request a copy or deletion of your contact submission, send a message through our <a href="/contact" style="color:var(--color-accent); text-decoration:underline">Support Desk</a> referencing the email address you used — we will honor deletion requests promptly. Messages you queued while offline (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_offline_queue</code>) stay only in your browser until delivered and can be removed by clearing site data.
          </p>
        </section>
      </div>
    </div>
  `,
  currentPath: '/privacy',
  customSchemaJson: buildLegalSchemaJson('Privacy Policy', `${DOMAIN}/privacy`)
});
writeHtmlFile(path.resolve(DIST_DIR, 'privacy', 'index.html'), privacyHtml);
console.log('  ✓ Pre-rendered: /privacy (dist/privacy/index.html)');

// 4. Terms of Service (/terms)
const termsHtml = createPageHtml({
  title: 'Terms of Service — PDFHome',
  description: 'Review the PDFHome Terms of Service for using our free, in-browser PDF utilities.',
  canonicalUrl: `${DOMAIN}/terms`,
  mainContentHtml: `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Terms of Service</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Effective Date: January 1, 2026 · Client-Side Document Platform Terms
          </p>
        </div>
      </div>
      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">1. Acceptance of Terms</h2>
          <p>
            By using PDF Home (https://pdfhome.site), you agree to these Terms of Service. If you disagree with any part of these terms, please discontinue using the service.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">2. Permitted Use & Ownership</h2>
          <p>
            PDF Home provides document utilities including digital signing, conversion to Word, Excel, and Slides, OCR text extraction, page reordering, watermark stamping, and encryption.
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-2); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>You retain 100% full legal ownership of all documents, images, and signatures processed with PDF Home.</li>
            <li>You agree not to use PDF Home to create counterfeit documents, forge signatures, or distribute malware.</li>
          </ul>
        </section>
      </div>
    </div>
  `,
  currentPath: '/terms',
  customSchemaJson: buildLegalSchemaJson('Terms of Service', `${DOMAIN}/terms`)
});
writeHtmlFile(path.resolve(DIST_DIR, 'terms', 'index.html'), termsHtml);
console.log('  ✓ Pre-rendered: /terms (dist/terms/index.html)');

// 5. Contact Desk (/contact)
const contactHtml = createPageHtml({
  title: 'Contact & Support Desk — PDFHome',
  description: 'Get in touch with the PDFHome team for support, questions, and feature requests.',
  canonicalUrl: `${DOMAIN}/contact`,
  mainContentHtml: `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Contact & Support</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            We are here to help. Send us your inquiry, suggestions, or bug reports directly.
          </p>
        </div>
      </div>
      <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-6)">
        <h2 style="font-size:var(--text-lg); font-weight:var(--weight-bold); margin-bottom:var(--space-2); color:var(--color-text-primary)">Official Support Desk</h2>
        <p style="font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.6">
          Have questions or need assistance? Reach out to our core developer team. All inquiries are delivered securely to our private admin desk.
        </p>
      </div>
    </div>
  `,
  currentPath: '/contact',
  customSchemaJson: buildLegalSchemaJson('Contact & Support', `${DOMAIN}/contact`)
});
writeHtmlFile(path.resolve(DIST_DIR, 'contact', 'index.html'), contactHtml);
console.log('  ✓ Pre-rendered: /contact (dist/contact/index.html)');

// 6. About Us (/about)
const aboutHtml = createPageHtml({
  title: 'About Us — PDFHome',
  description: 'Learn about PDFHome: free, privacy-first PDF tools that run 100% in your browser. No uploads, no accounts, no watermarks.',
  canonicalUrl: `${DOMAIN}/about`,
  mainContentHtml: `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">About PDFHome</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Free PDF tools that respect your privacy — everything runs in your browser.
          </p>
        </div>
      </div>
      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">What is PDFHome?</h2>
          <p>
            PDFHome is a free collection of PDF utilities that work entirely inside your web browser. Merge PDFs, split pages, compress files, convert to and from Word, Excel, PowerPoint and images, add page numbers, watermarks, passwords, digital signatures, and more — without installing software or creating an account.
          </p>
          <p style="margin-top:var(--space-3)">
            Most online PDF tools upload your documents to a remote server for processing. PDFHome was built on a different principle: <strong>your files never leave your device.</strong> Every operation runs locally in your browser's memory using modern web technology, and nothing is transmitted, stored, or seen by us.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">Why privacy-first?</h2>
          <p>
            PDFs often contain sensitive information — contracts, financial records, medical documents, legal filings, and personal identification. Uploading those files to a stranger's server just to merge two pages is an unnecessary risk. PDFHome eliminates that risk by design: there is no server-side processing, no file storage, and no document retention because your files are never sent anywhere.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">How PDFHome is supported</h2>
          <p>
            PDFHome is free and will remain free. The site is supported by unobtrusive advertising. Ads are only loaded after you accept our cookie-consent banner — if you decline, the tools work exactly the same with no ads. You can change your choice at any time using the "Cookie Settings" link in the footer. Read our <a href="/privacy" style="color:var(--color-accent)">Privacy Policy</a> for full details.
          </p>
        </section>
        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">Get in touch</h2>
          <p>
            Found a bug, have a feature request, or need help? Reach us through the <a href="/contact" style="color:var(--color-accent)">Contact &amp; Support desk</a>.
          </p>
        </section>
      </div>
    </div>
  `,
  currentPath: '/about',
  customSchemaJson: buildLegalSchemaJson('About Us', `${DOMAIN}/about`)
});
writeHtmlFile(path.resolve(DIST_DIR, 'about', 'index.html'), aboutHtml);
console.log('  ✓ Pre-rendered: /about (dist/about/index.html)');

// 7. Custom 404 Page
const notFoundHtml = createPageHtml({
  title: '404 — Page Not Found | PDFHome',
  description: 'The requested page was not found on PDFHome. Browse our free online PDF tools including merge, split, compress, and convert.',
  canonicalUrl: `${DOMAIN}/`,
  noindex: true,
  mainContentHtml: `
    <div class="tool-page-wrapper" style="text-align:center; padding:var(--space-12) var(--space-4);">
      <div style="font-size:72px; font-weight:800; background:linear-gradient(135deg, var(--color-primary), var(--color-accent)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:var(--space-2);">404</div>
      <h1 style="font-size:var(--text-xl); font-weight:700; color:var(--color-text-primary); margin-bottom:var(--space-2)">Page Not Found</h1>
      <p style="color:var(--color-text-secondary); margin-bottom:var(--space-6); max-width:480px; margin-left:auto; margin-right:auto; line-height:1.6">
        The page you're looking for doesn't exist. It may have been moved or removed.
      </p>
      <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); justify-content:center; margin-bottom:var(--space-8)">
        <a href="/" class="btn btn-primary">← Back to Home</a>
        <a href="/merge-pdf" class="btn btn-secondary">Merge PDF</a>
        <a href="/compress-pdf" class="btn btn-secondary">Compress PDF</a>
        <a href="/pdf-to-word" class="btn btn-secondary">PDF to Word</a>
      </div>
      <p style="font-size:12px; color:var(--color-text-tertiary)">
        Looking for a specific tool? Use the navigation above or browse all tools on the <a href="/" style="color:var(--color-primary)">homepage</a>.
      </p>
    </div>
  `,
  currentPath: '/404'
});
writeHtmlFile(path.resolve(DIST_DIR, '404.html'), notFoundHtml);
console.log('  ✓ Pre-rendered: /404 (dist/404.html)');

console.log(`\n🎉 Success: ${toolCount + 6} routes pre-rendered with complete static HTML, metadata, and structured data!`);
