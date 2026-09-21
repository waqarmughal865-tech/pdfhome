/**
 * ToolPageWrapper — Provides the complete SEO structure around any interactive PDF tool:
 * - Breadcrumb navigation
 * - Semantic H1 & informative introduction
 * - Interactive workspace mount container
 * - Step-by-step How-To section
 * - Privacy & capability feature highlights
 * - FAQ section (with matching Schema.org FAQPage data)
 * - Related tools internal links
 */

import { icon } from './icons.js';
import { TOOL_SEO_DATA } from '../seo/seo-metadata.js';
import { updatePageSeo } from '../seo/seo-helper.js';
import { renderAdSlot } from './AdSlot.js';

export function renderToolPage(container, seoKey, renderToolCallback) {
  const seoData = TOOL_SEO_DATA[seoKey];
  if (!seoData) {
    // Fallback if key not found
    renderToolCallback(container);
    return;
  }

  // 1. Update Head Meta Tags, Canonical, & Structured Data
  updatePageSeo(seoData);

  // 2. Build Related Tools cards
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

  // 3. Build How-To Steps HTML
  const howToHtml = (seoData.howTo || [])
    .map(step => `
      <div class="seo-step-card">
        <div class="seo-step-card__badge">${step.step}</div>
        <h3 class="seo-step-card__title">${step.title}</h3>
        <p class="seo-step-card__desc">${step.desc}</p>
      </div>
    `)
    .join('');

  // 4. Build Features HTML
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

  // 5. Build FAQs HTML
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

  // 6. Assemble the Complete Semantic Tool Page HTML
  container.innerHTML = `
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

      <!-- Interactive Tool Workspace Mount Area -->
      <div class="tool-workspace-mount" id="tool-interactive-mount"></div>

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

  // 7. Mount the actual interactive tool inside the mount container
  const mountEl = container.querySelector('#tool-interactive-mount');
  if (mountEl) {
    renderToolCallback(mountEl);
  }
}
