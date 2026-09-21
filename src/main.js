/**
 * Main entry point — router with code-splitting, SEO tool wrappers, and dual route handling.
 */

import { renderShell, updateActiveNav } from './components/Shell.js';
import { renderToolPage } from './components/ToolPageWrapper.js';
import { resetHomeSeo } from './seo/seo-helper.js';

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

// ── Route Definitions with Code-Splitting ──
const routes = {
  // Home
  '/': async (container) => {
    resetHomeSeo();
    const { renderHome } = await import('./tools/home.js');
    renderHome(container);
  },

  // 12 Dedicated SEO Tool Routes
  '/merge-pdf': (container) => renderToolPage(container, 'merge-pdf', async (mount) => {
    const { renderMerge } = await import('./tools/merge.js');
    renderMerge(mount);
  }),

  '/split-pdf': (container) => renderToolPage(container, 'split-pdf', async (mount) => {
    const { renderSplit } = await import('./tools/split.js');
    renderSplit(mount);
  }),

  '/compress-pdf': (container) => renderToolPage(container, 'compress-pdf', async (mount) => {
    const { renderCompress } = await import('./tools/compress.js');
    renderCompress(mount);
  }),

  '/pdf-to-word': (container) => renderToolPage(container, 'pdf-to-word', async (mount) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(mount, 'pdf-to-docx');
  }),

  '/pdf-to-excel': (container) => renderToolPage(container, 'pdf-to-excel', async (mount) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(mount, 'pdf-to-excel');
  }),

  '/pdf-to-powerpoint': (container) => renderToolPage(container, 'pdf-to-powerpoint', async (mount) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(mount, 'pdf-to-slides');
  }),

  '/pdf-to-jpg': (container) => renderToolPage(container, 'pdf-to-jpg', async (mount) => {
    const { renderPdfToImage } = await import('./tools/pdf-to-image.js');
    renderPdfToImage(mount);
  }),

  '/jpg-to-pdf': (container) => renderToolPage(container, 'jpg-to-pdf', async (mount) => {
    const { renderImageToPdf } = await import('./tools/image-to-pdf.js');
    renderImageToPdf(mount);
  }),

  '/ocr-pdf': (container) => renderToolPage(container, 'ocr-pdf', async (mount) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(mount, 'ocr-pdf');
  }),

  '/rotate-pdf': (container) => renderToolPage(container, 'rotate-pdf', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'organize',
      title: 'Rotate PDF Pages',
      subtitle: 'Rotate pages 90° clockwise or counterclockwise'
    });
  }),

  '/delete-pdf-pages': (container) => renderToolPage(container, 'delete-pdf-pages', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'organize',
      title: 'Delete PDF Pages',
      subtitle: 'Remove unwanted pages, cover sheets, or blank pages'
    });
  }),

  '/watermark-pdf': (container) => renderToolPage(container, 'watermark-pdf', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'watermark',
      initialWmType: 'text',
      title: 'Watermark PDF — Text & Image Stamps',
      subtitle: 'Add customizable text stamps or logo watermarks'
    });
  }),

  // Additional Core Tools with SEO
  '/sign-pdf': (container) => renderToolPage(container, 'sign-pdf', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'watermark',
      initialWmType: 'draw',
      title: 'Sign PDF — Digital Signature',
      subtitle: 'Draw handwritten signatures or place transparent stamps'
    });
  }),

  '/protect-pdf': (container) => renderToolPage(container, 'protect-pdf', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'protect',
      title: 'Protect PDF — Password Encryption',
      subtitle: 'Apply secure password locking and standard 128-bit encryption'
    });
  }),

  '/crop-pdf': (container) => renderToolPage(container, 'crop-pdf', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'crop',
      title: 'Crop PDF Margins',
      subtitle: 'Visually trim page margins, scanner borders, or crop to custom box dimensions'
    });
  }),

  '/page-numbers': (container) => renderToolPage(container, 'page-numbers', async (mount) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(mount, {
      initialTab: 'numbers',
      title: 'Number PDF Pages',
      subtitle: 'Insert formatted headers or footers (Page X of Y) with cover page exclusion'
    });
  }),

  // General Workbench & Office Tools
  '/pages': async (container) => {
    const { renderPages } = await import('./tools/pages.js');
    renderPages(container);
  },

  '/convert': async (container) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(container, 'pdf-to-docx');
  },

  '/docx-to-pdf': async (container) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(container, 'docx-to-pdf');
  },

  '/excel-to-pdf': async (container) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(container, 'excel-to-pdf');
  },

  '/slides-to-pdf': async (container) => {
    const { renderConvert } = await import('./tools/convert.js');
    renderConvert(container, 'slides-to-pdf');
  },

  // Legal & Info Pages
  '/privacy': async (container) => {
    const { renderPrivacy } = await import('./components/Legal.js');
    renderPrivacy(container);
  },

  '/terms': async (container) => {
    const { renderTerms } = await import('./components/Legal.js');
    renderTerms(container);
  },

  '/contact': async (container) => {
    const { renderContact } = await import('./components/Legal.js');
    renderContact(container);
  }
};

// Aliases for backwards compatibility with legacy hash and older URLs
const aliases = {
  '/merge': '/merge-pdf',
  '/split': '/split-pdf',
  '/compress': '/compress-pdf',
  '/pdf-to-docx': '/pdf-to-word',
  '/pdf-to-slides': '/pdf-to-powerpoint',
  '/pdf-to-image': '/pdf-to-jpg',
  '/image-to-pdf': '/jpg-to-pdf',
  '/organize-pdf': '/rotate-pdf',
};

let contentEl = null;

/**
 * Resolve current pathname from URL or hash fallback.
 */
function getCurrentRoute() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    const hashPath = hash.replace(/^#/, '');
    return hashPath || '/';
  }
  return window.location.pathname || '/';
}

/**
 * Main navigation dispatcher.
 */
async function navigate() {
  let path = getCurrentRoute();
  
  // Normalize trailing slash if any (e.g. /merge-pdf/ -> /merge-pdf)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // Resolve alias if matched
  if (aliases[path]) {
    path = aliases[path];
  }

  const handler = routes[path] || routes['/'];

  updateActiveNav(path);

  if (contentEl) {
    // Show subtle transition indicator for heavy chunks
    contentEl.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; min-height:40vh;">
        <div class="spinner" style="width:32px; height:32px; border:3px solid var(--color-border); border-top-color:var(--color-primary); border-radius:50%; animation:spin 0.8s linear infinite;"></div>
      </div>
    `;
  }

  try {
    await handler(contentEl);
  } catch (err) {
    console.error('Route navigation error:', err);
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="text-align:center; padding:var(--space-12) var(--space-4);">
          <h2 style="font-size:var(--text-xl); font-weight:700; color:var(--color-text-primary); margin-bottom:8px">Unable to load tool</h2>
          <p style="color:var(--color-text-secondary); margin-bottom:var(--space-4)">An error occurred while loading this page. Please try refreshing.</p>
          <a href="/" class="btn btn-primary">Return to Home</a>
        </div>
      `;
    }
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Intercept internal link clicks for smooth HTML5 single-page transitions.
 */
function setupLinkInterceptor() {
  document.addEventListener('click', (e) => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;

    // Check if open contact button or explicit action
    if (link.hasAttribute('data-open-contact') || link.getAttribute('target') === '_blank') {
      return;
    }

    const href = link.getAttribute('href');
    if (!href) return;

    // Ignore external URLs, mailto, tel, javascript
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      return;
    }

    // Ignore hash-only clicks that don't match our routing format
    if (href.startsWith('#') && !href.startsWith('#/')) {
      return;
    }

    // Don't intercept if modifier keys are pressed (open in new tab/window)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    e.preventDefault();

    let targetPath = href;
    if (targetPath.startsWith('#/')) {
      targetPath = targetPath.replace(/^#/, '');
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    navigate();
  });
}

// ── Init ──
function init() {
  const appEl = document.getElementById('app');
  contentEl = renderShell(appEl);
  
  setupLinkInterceptor();

  window.addEventListener('popstate', navigate);
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
