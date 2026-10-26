/**
 * Blog — list page and article page renderers.
 * Follows the codebase's tool-page visual language.
 */

import { icon } from '../components/icons.js';
import { ARTICLES } from './articles.js';
import { TOOL_SEO_DATA } from '../seo/seo-metadata.js';

export function getArticle(slug) {
  return ARTICLES.find(a => a.slug === slug) || null;
}

function articleCard(a) {
  const tool = a.toolSlug && TOOL_SEO_DATA[a.toolSlug.replace(/^\//, '')];
  return `
    <a class="tool-card" href="/blog/${a.slug}/" data-category="guide">
      <div class="tool-card__header">
        <div class="tool-card__icon tool-card__icon--pdf-to-word">${icon('fileText', 22)}</div>
        <span class="tool-card__badge">Guide</span>
      </div>
      <h3 class="tool-card__title">${a.title}</h3>
      <p class="tool-card__desc">${a.excerpt}</p>
      <div class="tool-card__meta">
        <span>${a.readTime}</span>
        ${tool ? `<span>· Uses ${a.toolName}</span>` : ''}
      </div>
    </a>`;
}

export function renderBlogList(container) {
  container.innerHTML = `
    <div class="tool-page">
      <div class="tool-page__header">
        <a class="tool-page__back" href="#/" title="Back to home">${icon('chevronLeft')}</a>
        <div>
          <h2 class="tool-page__title">Guides & How-Tos</h2>
          <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:2px">
            Practical PDF guides written by humans, for humans — no fluff
          </p>
        </div>
      </div>
      <div class="tool-page__body">
        <div class="tools-grid">
          ${ARTICLES.map(articleCard).join('')}
        </div>
      </div>
    </div>`;
}

export function renderArticle(container, slug) {
  const a = getArticle(slug);
  if (!a) {
    container.innerHTML = `
      <div class="tool-page-wrapper" style="text-align:center; padding:var(--space-12) var(--space-4);">
        <h1 style="font-size:var(--text-xl); font-weight:700;">Article Not Found</h1>
        <p style="color:var(--color-text-secondary); margin: var(--space-4) 0;">This guide doesn't exist or was moved.</p>
        <a href="/blog/" class="btn btn-primary">← All Guides</a>
      </div>`;
    return;
  }

  const related = ARTICLES.filter(x => x.slug !== a.slug).slice(0, 3);

  container.innerHTML = `
    <div class="tool-page">
      <div class="tool-page__header">
        <a class="tool-page__back" href="/blog/" title="All guides">${icon('chevronLeft')}</a>
        <div>
          <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin:0 0 4px">
            <a href="/" style="color:var(--color-text-tertiary)">Home</a> ·
            <a href="/blog/" style="color:var(--color-text-tertiary)">Guides</a>
          </p>
          <h1 class="tool-page__title" style="font-size:var(--text-2xl)">${a.h1}</h1>
          <p style="font-size:var(--text-xs); color:var(--color-text-tertiary); margin-top:6px">
            ${a.readTime} · Updated ${a.publishDate}
          </p>
        </div>
      </div>

      <div class="tool-page__body">
        <article class="article-body" style="max-width:760px; margin:0 auto; line-height:1.75; color:var(--color-text-secondary); font-size:var(--text-md)">
          ${a.intro.map(p => `<p style="margin-bottom:var(--space-4)">${p}</p>`).join('')}

          ${a.sections.map(s => `
            <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:var(--space-8) 0 var(--space-4)">${s.heading}</h2>
            ${s.body.map(p => p.startsWith('<ul>') ? `<div style="margin-bottom:var(--space-4)">${p}</div>` : `<p style="margin-bottom:var(--space-4)">${p}</p>`).join('')}
          `).join('')}

          ${a.toolSlug ? `
            <div style="margin:var(--space-10) 0; padding:var(--space-6); background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); text-align:center">
              <h3 style="font-size:var(--text-lg); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:0 0 var(--space-2)">Try it right now — free</h3>
              <p style="margin:0 0 var(--space-4); font-size:var(--text-sm)">No signup, no uploads, runs entirely in your browser.</p>
              <a href="${a.toolSlug}/" class="btn btn-primary btn-lg">${icon('arrowRight', 18)} Open ${a.toolName}</a>
            </div>
          ` : ''}

          ${a.faqs && a.faqs.length ? `
            <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:var(--space-8) 0 var(--space-4)">Common questions</h2>
            <div class="seo-faq">
              ${a.faqs.map(f => `
                <details class="seo-faq-item">
                  <summary class="seo-faq-question">${f.q}</summary>
                  <div class="seo-faq-answer">${f.a}</div>
                </details>
              `).join('')}
            </div>
          ` : ''}

          ${related.length ? `
            <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin:var(--space-10) 0 var(--space-4)">Keep reading</h2>
            <div class="tools-grid" style="grid-template-columns:repeat(auto-fill, minmax(220px, 1fr))">
              ${related.map(articleCard).join('')}
            </div>
          ` : ''}
        </article>
      </div>
    </div>`;
}
