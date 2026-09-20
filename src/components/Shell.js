/**
 * App Shell — header, navigation, privacy badge, theme toggle.
 */

import { icon } from './icons.js';

const TOOLS = [
  { id: 'sign', label: 'Sign PDF', hash: '#/sign-pdf' },
  { id: 'pages', label: 'Page Editor', hash: '#/pages' },
  { id: 'convert', label: 'Convert', hash: '#/convert' },
  { id: 'merge', label: 'Merge', hash: '#/merge' },
  { id: 'split', label: 'Split', hash: '#/split' },
  { id: 'compress', label: 'Compress', hash: '#/compress' },
];

/**
 * Render the app shell (header + content container + footer).
 * Returns the content container element.
 */
export function renderShell(appEl) {
  const currentHash = window.location.hash || '#/';

  appEl.innerHTML = `
    <header class="app-header" id="app-header">
      <a class="app-header__logo" href="#/" id="logo-link" aria-label="PDF Home Home">
        <span class="app-header__logo-mark">
          <img src="/favicon.svg" alt="PDFHome" class="app-header__logo-img" width="32" height="32" />
        </span>
        <span class="app-header__logo-text">PDF<span class="logo-accent">Home</span></span>
      </a>
      <nav class="app-header__nav" id="main-nav">
        ${TOOLS.map(t => `
          <a class="app-header__nav-link ${isLinkActive(currentHash, t) ? 'app-header__nav-link--active' : ''}"
             href="${t.hash}"
             data-tool="${t.id}">
            ${t.label}
          </a>
        `).join('')}
      </nav>
      <div class="app-header__right">
        <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle dark mode">
          ${(document.documentElement.getAttribute('data-theme') === 'dark') ? icon('sun', 18) : icon('moon', 18)}
        </button>
      </div>
    </header>

    <main class="main-content" id="main-content"></main>

    <footer class="app-footer" id="app-footer">
      <div class="app-footer__inner">
        <div class="app-footer__grid">
          
          <!-- Column 1: Brand & Contact -->
          <div style="display:flex; flex-direction:column; gap:var(--space-3)">
            <a class="app-header__logo" href="#/" style="margin-bottom:4px">
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
              <a href="mailto:waqarahmed4071@gmail.com" class="app-footer__link" style="color:var(--color-accent); font-weight:600">
                ${icon('mail', 14)} waqarahmed4071@gmail.com
              </a>
            </div>
          </div>

          <!-- Column 2: Core PDF Tools -->
          <div>
            <div class="app-footer__col-title">Core Tools</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="#/sign-pdf">${icon('chevronRight', 12)} Sign PDF Online</a></li>
              <li><a class="app-footer__link" href="#/merge">${icon('chevronRight', 12)} Merge PDF</a></li>
              <li><a class="app-footer__link" href="#/split">${icon('chevronRight', 12)} Split PDF</a></li>
              <li><a class="app-footer__link" href="#/compress">${icon('chevronRight', 12)} Compress PDF</a></li>
              <li><a class="app-footer__link" href="#/pdf-to-image">${icon('chevronRight', 12)} PDF to Image</a></li>
              <li><a class="app-footer__link" href="#/image-to-pdf">${icon('chevronRight', 12)} Image to PDF</a></li>
            </ul>
          </div>

          <!-- Column 3: Office Conversions -->
          <div>
            <div class="app-footer__col-title">Office Conversions</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="#/pdf-to-docx">${icon('chevronRight', 12)} PDF to Word (DOCX)</a></li>
              <li><a class="app-footer__link" href="#/docx-to-pdf">${icon('chevronRight', 12)} Word to PDF</a></li>
              <li><a class="app-footer__link" href="#/pdf-to-excel">${icon('chevronRight', 12)} PDF to Excel (XLSX)</a></li>
              <li><a class="app-footer__link" href="#/excel-to-pdf">${icon('chevronRight', 12)} Excel to PDF</a></li>
              <li><a class="app-footer__link" href="#/pdf-to-slides">${icon('chevronRight', 12)} PDF to Slides (PPTX)</a></li>
              <li><a class="app-footer__link" href="#/ocr-pdf">${icon('chevronRight', 12)} Searchable OCR PDF</a></li>
            </ul>
          </div>

          <!-- Column 4: Page & Security -->
          <div>
            <div class="app-footer__col-title">Page & Security</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="#/protect-pdf">${icon('chevronRight', 12)} Protect PDF</a></li>
              <li><a class="app-footer__link" href="#/watermark-pdf">${icon('chevronRight', 12)} Watermark PDF</a></li>
              <li><a class="app-footer__link" href="#/crop-pdf">${icon('chevronRight', 12)} Crop PDF Margins</a></li>
              <li><a class="app-footer__link" href="#/page-numbers">${icon('chevronRight', 12)} Number Pages</a></li>
              <li><a class="app-footer__link" href="#/organize-pdf">${icon('chevronRight', 12)} Organize & Rotate</a></li>
            </ul>
          </div>

          <!-- Column 5: Company & Legal -->
          <div>
            <div class="app-footer__col-title">Company & Legal</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="#/privacy">${icon('chevronRight', 12)} Privacy Policy</a></li>
              <li><a class="app-footer__link" href="#/terms">${icon('chevronRight', 12)} Terms of Service</a></li>
              <li><a class="app-footer__link" href="#/contact">${icon('chevronRight', 12)} Contact Us</a></li>
              <li><a class="app-footer__link" href="mailto:waqarahmed4071@gmail.com">${icon('chevronRight', 12)} Direct Support</a></li>
            </ul>
          </div>

        </div>

        <div class="app-footer__bottom">
          <div style="display:flex; align-items:center; gap:8px">
            <span style="color:var(--color-text-tertiary)">${icon('shieldCheck', 16)}</span>
            <span>Client-Side Document Suite · Zero Server File Storage · Free Online Tools</span>
          </div>
          <div>
            © 2026 PDF Home. All rights reserved. Created by <a href="mailto:waqarahmed4071@gmail.com" style="color:var(--color-text-secondary); text-decoration:underline">Waqar Ahmed</a>.
          </div>
        </div>
      </div>
    </footer>
  `;

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  function updateThemeButton(theme) {
    const isDark = theme === 'dark';
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.innerHTML = isDark ? icon('sun', 18) : icon('moon', 18);
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeButton(currentTheme);

  themeBtn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = active === 'dark' ? 'light' : 'dark';
    
    // Enable transition only during deliberate user toggle
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.backgroundColor = next === 'dark' ? '#0b0f19' : '#f8fafc';
    document.documentElement.style.colorScheme = next;

    try {
      localStorage.setItem('pdf-home-theme', next);
    } catch (e) {}
    updateThemeButton(next);

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  });

  return document.getElementById('main-content');
}

function isLinkActive(currentHash, tool) {
  if (currentHash === tool.hash) return true;
  if (tool.id === 'sign') {
    return currentHash === '#/sign-pdf';
  }
  if (tool.id === 'pages') {
    return currentHash === '#/pages' || 
           currentHash === '#/watermark-pdf' || 
           currentHash === '#/protect-pdf' || 
           currentHash === '#/crop-pdf' || 
           currentHash === '#/page-numbers' || 
           currentHash === '#/organize-pdf';
  }
  if (tool.id === 'convert') {
    return currentHash === '#/convert' ||
           currentHash.startsWith('#/pdf-to-') || 
           currentHash.startsWith('#/docx-to-') || 
           currentHash.startsWith('#/excel-to-') || 
           currentHash.startsWith('#/slides-to-') ||
           currentHash.startsWith('#/ocr-');
  }
  return false;
}

/**
 * Update the active nav link based on current hash.
 */
export function updateActiveNav(hash) {
  const links = document.querySelectorAll('.app-header__nav-link');
  links.forEach(link => {
    const toolId = link.getAttribute('data-tool');
    const toolObj = TOOLS.find(t => t.id === toolId);
    link.classList.toggle(
      'app-header__nav-link--active',
      toolObj ? isLinkActive(hash, toolObj) : link.getAttribute('href') === hash
    );
  });
}

export { TOOLS };
