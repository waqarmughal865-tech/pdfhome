/**
 * Cookie Consent Banner (GDPR/ePrivacy)
 *
 * Shows a small, non-blocking bottom banner on first visit. The visitor's
 * choice is stored in localStorage under 'pdfhome-consent' as
 * JSON: { adConsent: true|false, ts: <timestamp> }.
 *
 * Privacy design choice (documented): ads are NEVER loaded by default.
 * The Google AdSense script is injected dynamically ONLY after the visitor
 * explicitly clicks "Accept". On "Reject" (or while undecided) no ad script
 * is ever loaded, which is strictly stronger than non-personalized ads
 * (NPA): no ad cookies, no ad beacons, no personalization at all.
 *
 * Wiring: this module self-initializes on DOMContentLoaded and is imported
 * (for its side effect) by src/components/AdSlot.js, which is statically
 * imported by src/main.js — so it runs at app boot without touching files
 * owned by other workers. On consent it calls refreshAds() to initialize
 * any AdSlot placeholders already on the page.
 */

import { refreshAds } from './AdSlot.js';

export const CONSENT_KEY = 'pdfhome-consent';
export const ADSENSE_SCRIPT_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9649951726869483';

let bannerEl = null;
let initialized = false;

/**
 * Read the stored consent choice. Returns { adConsent, ts } or null when
 * the visitor has not decided yet (or storage is unavailable/corrupt).
 */
export function getConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if (typeof parsed.adConsent !== 'boolean') return null;
    return { adConsent: parsed.adConsent, ts: parsed.ts || 0 };
  } catch (_) {
    return null;
  }
}

/**
 * Persist the visitor's consent choice.
 */
function setConsent(adConsent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ adConsent: !!adConsent, ts: Date.now() }));
  } catch (_) {}
}

/**
 * Inject the AdSense loader script (idempotent). Only ever called after
 * explicit opt-in (Accept) or when a stored opt-in exists.
 */
export function loadAdScript() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
    return; // already injected
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = ADSENSE_SCRIPT_SRC;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

function bannerStyles() {
  const style = document.createElement('style');
  style.id = 'pdfhome-consent-styles';
  style.textContent = `
    .pdfhome-consent-banner {
      position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 9999;
      max-width: 560px; margin: 0 auto;
      background: var(--color-bg-secondary, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,.18);
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 10px;
      font-size: 13px; line-height: 1.5;
      color: var(--color-text-secondary, #4b5563);
    }
    .pdfhome-consent-banner a { color: var(--color-accent, #6366f1); text-decoration: underline; }
    .pdfhome-consent-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .pdfhome-consent-btn {
      border: 1px solid var(--color-border, #e5e7eb); border-radius: 8px;
      padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
      background: var(--color-bg-tertiary, #f3f4f6);
      color: var(--color-text-primary, #111827);
    }
    .pdfhome-consent-btn--accept {
      background: var(--color-accent, #6366f1); border-color: transparent; color: #fff;
    }
    .pdfhome-consent-btn:hover { opacity: .9; }
  `;
  document.head.appendChild(style);
}

function renderBanner() {
  if (bannerEl || typeof document === 'undefined') return;
  if (!document.getElementById('pdfhome-consent-styles')) bannerStyles();

  bannerEl = document.createElement('div');
  bannerEl.className = 'pdfhome-consent-banner';
  bannerEl.setAttribute('role', 'dialog');
  bannerEl.setAttribute('aria-label', 'Cookie consent');
  bannerEl.innerHTML = `
    <div>
      We use cookies for ads (Google AdSense) and to remember your preferences.
      You can accept or reject advertising cookies — PDF tools work the same either way.
      See our <a href="/privacy">Privacy Policy</a> for details.
    </div>
    <div class="pdfhome-consent-actions">
      <button type="button" class="pdfhome-consent-btn pdfhome-consent-btn--accept" data-consent="accept">Accept</button>
      <button type="button" class="pdfhome-consent-btn" data-consent="reject">Reject</button>
      <button type="button" class="pdfhome-consent-btn" data-consent="dismiss" aria-label="Dismiss for now" style="margin-left:auto">✕</button>
    </div>
  `;

  bannerEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-consent]');
    if (!btn) return;
    const choice = btn.getAttribute('data-consent');
    if (choice === 'accept') {
      setConsent(true);
      hideBanner();
      // Consent given: load ads and initialize any placeholders on the page.
      loadAdScript();
      setTimeout(refreshAds, 100);
    } else if (choice === 'reject') {
      setConsent(false);
      hideBanner();
      // Rejected: never load the ad script; AdSlot.refreshAds() will hide
      // ad containers based on this stored choice.
    } else {
      // Dismissed for this session only — banner returns on next visit.
      hideBanner();
    }
  });

  document.body.appendChild(bannerEl);
}

function hideBanner() {
  if (bannerEl && bannerEl.parentNode) {
    bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }
}

/**
 * Boot the consent flow. Idempotent: safe to call multiple times.
 */
export function initConsentBanner() {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;

  const consent = getConsent();
  if (consent && consent.adConsent === true) {
    // Returning visitor who opted in: load ads now so refreshAds() can push.
    loadAdScript();
    return;
  }
  if (consent && consent.adConsent === false) {
    // Returning visitor who opted out: no banner, no ad script.
    return;
  }
  // First visit (undecided): show the banner. Non-blocking; tools render first.
  renderBanner();
}

// Self-initialize at app boot (safe fallback: this module is imported for its
// side effect by AdSlot.js, which main.js statically imports).
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsentBanner);
  } else {
    initConsentBanner();
  }
}
