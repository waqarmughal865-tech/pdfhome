/**
 * App Shell — header, navigation, privacy badge, theme toggle.
 */

import { icon } from './icons.js';
import { initContactModal } from './ContactModal.js';

const TOOLS = [
  { id: 'sign', label: 'Sign PDF', path: '/sign-pdf' },
  { id: 'pages', label: 'Page Editor', path: '/pages' },
  { id: 'convert', label: 'Convert', path: '/convert' },
  { id: 'merge', label: 'Merge', path: '/merge-pdf' },
  { id: 'split', label: 'Split', path: '/split-pdf' },
  { id: 'compress', label: 'Compress', path: '/compress-pdf' },
];

/**
 * Render the app shell (header + content container + footer).
 * Returns the content container element.
 */
export function renderShell(appEl) {
  const currentPath = window.location.pathname || '/';

  appEl.innerHTML = `
    <header class="app-header" id="app-header">
      <a class="app-header__logo" href="/" id="logo-link" aria-label="PDF Home">
        <span class="app-header__logo-mark">
          <img src="/favicon.svg" alt="PDFHome" class="app-header__logo-img" width="32" height="32" />
        </span>
        <span class="app-header__logo-text">PDF<span class="logo-accent">Home</span></span>
      </a>
      <nav class="app-header__nav" id="main-nav">
        ${TOOLS.map(t => `
          <a class="app-header__nav-link ${isLinkActive(currentPath, t) ? 'app-header__nav-link--active' : ''}"
             href="${t.path}"
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
              <button type="button" data-open-contact class="app-footer__link" style="color:var(--color-accent); font-weight:600; background:none; border:none; padding:0; cursor:pointer; font-family:inherit; display:flex; align-items:center; gap:6px">
                ${icon('mail', 14)} Send Us a Message
              </button>
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
              <li><a class="app-footer__link" href="/pages">${icon('chevronRight', 12)} Page Editor</a></li>
            </ul>
          </div>

          <!-- Column 5: Company & Legal -->
          <div>
            <div class="app-footer__col-title">Company & Legal</div>
            <ul class="app-footer__list">
              <li><a class="app-footer__link" href="/privacy">${icon('chevronRight', 12)} Privacy Policy</a></li>
              <li><a class="app-footer__link" href="/terms">${icon('chevronRight', 12)} Terms of Service</a></li>
              <li><a class="app-footer__link" href="/contact" data-open-contact>${icon('chevronRight', 12)} Contact Us</a></li>
              <li><button type="button" class="app-footer__link" data-open-contact style="background:none; border:none; padding:0; cursor:pointer; font-family:inherit; color:inherit; text-align:left; display:flex; align-items:center; gap:var(--space-1)">${icon('chevronRight', 12)} Help & Support</button></li>
            </ul>
          </div>

        </div>

        <div class="app-footer__bottom">
          <div style="display:flex; align-items:center; gap:8px">
            <span style="color:var(--color-text-tertiary)">${icon('shieldCheck', 16)}</span>
            <span>Fast, Private & 100% Free Online PDF Tools</span>
          </div>
          <div>
            © 2026 PDF Home. All rights reserved. Created with privacy by Waqar Ahmed.
          </div>
        </div>
      </div>
    </footer>
  `;

  // Initialize Contact Modal
  initContactModal();

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

function isLinkActive(rawPath, tool) {
  const norm = (rawPath || '/').replace(/^#/, '');
  if (norm === tool.path) return true;
  if (tool.id === 'sign') {
    return norm === '/sign-pdf';
  }
  if (tool.id === 'pages') {
    return norm === '/pages' || 
           norm === '/watermark-pdf' || 
           norm === '/protect-pdf' || 
           norm === '/crop-pdf' || 
           norm === '/page-numbers' || 
           norm === '/rotate-pdf' ||
           norm === '/delete-pdf-pages' ||
           norm === '/organize-pdf';
  }
  if (tool.id === 'convert') {
    return norm === '/convert' ||
           norm === '/pdf-to-word' ||
           norm === '/pdf-to-excel' ||
           norm === '/pdf-to-powerpoint' ||
           norm === '/pdf-to-jpg' ||
           norm === '/jpg-to-pdf' ||
           norm === '/ocr-pdf' ||
           norm.startsWith('/pdf-to-') || 
           norm.startsWith('/docx-to-') || 
           norm.startsWith('/excel-to-') || 
           norm.startsWith('/slides-to-') ||
           norm.startsWith('/ocr-');
  }
  if (tool.id === 'merge') {
    return norm === '/merge-pdf' || norm === '/merge';
  }
  if (tool.id === 'split') {
    return norm === '/split-pdf' || norm === '/split';
  }
  if (tool.id === 'compress') {
    return norm === '/compress-pdf' || norm === '/compress';
  }
  return false;
}

/**
 * Update the active nav link based on current path or hash.
 */
export function updateActiveNav(rawPath) {
  const links = document.querySelectorAll('.app-header__nav-link');
  links.forEach(link => {
    const toolId = link.getAttribute('data-tool');
    const toolObj = TOOLS.find(t => t.id === toolId);
    const linkHref = link.getAttribute('href');
    link.classList.toggle(
      'app-header__nav-link--active',
      toolObj ? isLinkActive(rawPath, toolObj) : linkHref === rawPath
    );
  });
}

export { TOOLS };
