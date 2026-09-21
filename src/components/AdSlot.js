/**
 * Reusable Google AdSense & Engagement Slot Component
 * 
 * Provides policy-compliant ad placement containers (Leaderboard, Rectangle, Responsive)
 * with automatic graceful fallback to informative "Pro Tip & Feature Spotlight" cards
 * when AdSense is not yet configured or blocked, filling empty UI gaps beautifully.
 */

import { icon } from './icons.js';

// Configuration: Google AdSense Publisher ID
export const ADSENSE_CONFIG = {
  enabled: true,
  caPubId: 'ca-pub-9649951726869483',
  slots: {
    homeBanner: '',       // Responsive Leaderboard
    workspaceBottom: '',  // Workspace Bottom Banner
    sidebarSquare: '',    // 300x250 Sidebar Rectangle
    toolPageBottom: '',   // Tool Page Bottom Banner
  }
};

const PRO_TIPS = [
  {
    icon: 'shieldCheck',
    title: 'Client-Side Security',
    desc: 'All PDF processing runs directly in your browser using in-memory WebAssembly. Your files are never uploaded or stored on any server.'
  },
  {
    icon: 'penTool',
    title: 'Transparent Signatures',
    desc: 'Draw signatures in blue or black ink, or upload transparent PNG stamps. You can scale, rotate, and snap to 9 alignment anchors.'
  },
  {
    icon: 'fileText',
    title: 'High-Fidelity Office Conversion',
    desc: 'Convert PDF tables into structured Excel sheets (.xlsx), pages into Word (.docx), or slides into PowerPoint (.pptx) with ease.'
  },
  {
    icon: 'eye',
    title: 'OCR Scanned Picture PDFs',
    desc: 'Transform image-only scanned PDFs into searchable, selectable documents with an integrated client-side OCR character engine.'
  }
];

/**
 * Render an AdSense or Engagement container.
 * @param {'leaderboard' | 'rectangle' | 'banner'} type 
 * @param {string} slotKey 
 */
export function renderAdSlot(type = 'banner', slotKey = 'workspaceBottom') {
  const slotId = ADSENSE_CONFIG.slots[slotKey] || '';

  // When live AdSense is active and configured
  if (ADSENSE_CONFIG.enabled && ADSENSE_CONFIG.caPubId) {
    return `
      <div class="ad-container ad-container--${type}" data-slot="${slotKey}">
        <span class="ad-label">Advertisement</span>
        <ins class="adsbygoogle"
             style="display:block; text-align:center"
             data-ad-client="${ADSENSE_CONFIG.caPubId}"
             ${slotId ? `data-ad-slot="${slotId}"` : ''}
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      </div>
    `;
  }

  // Graceful Fallback: Engaging, interactive Pro-Tip & Feature Spotlight card
  const randomTip = PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)] || PRO_TIPS[0];

  return `
    <div class="ad-container ad-container--fallback ad-container--${type}">
      <div class="ad-fallback-card">
        <div class="ad-fallback-icon">${icon(randomTip.icon, 20)}</div>
        <div class="ad-fallback-content">
          <div class="ad-fallback-title">
            <span>PRO TIP:</span> ${randomTip.title}
          </div>
          <p class="ad-fallback-desc">${randomTip.desc}</p>
        </div>
        <a href="/sign-pdf" class="ad-fallback-link" title="Explore Tool">
          Try Tool ${icon('arrowRight', 12)}
        </a>
      </div>
    </div>
  `;
}

/**
 * Safely push AdSense requests after DOM updates.
 */
export function refreshAds() {
  if (typeof window === 'undefined') return;
  try {
    const uninitialized = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
    if (uninitialized.length > 0) {
      uninitialized.forEach(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
      });
    }
  } catch (e) {}
}
