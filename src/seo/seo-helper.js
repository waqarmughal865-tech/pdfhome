/**
 * Dynamic SEO & Structured Data Helper for PDFHome
 * Updates document.title, meta descriptions, canonical URLs,
 * Open Graph / Twitter cards, and Schema.org JSON-LD on route changes.
 */

import { DOMAIN } from './seo-metadata.js';

/**
 * Update document head metadata for the current tool page.
 */
export function updatePageSeo(seoData) {
  if (!seoData) return;

  // 1. Page Title
  document.title = seoData.metaTitle || `${seoData.name} — PDFHome`;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = seoData.metaDescription || '';

  // 3. Canonical URL
  const canonicalUrl = `${DOMAIN}${seoData.slug}`;
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonicalUrl;

  // 4. Open Graph Tags
  updateMetaProperty('og:title', seoData.metaTitle || seoData.name);
  updateMetaProperty('og:description', seoData.metaDescription || '');
  updateMetaProperty('og:url', canonicalUrl);
  updateMetaProperty('og:type', 'website');
  updateMetaProperty('og:image', `${DOMAIN}/icon.png`);

  // 5. Twitter Card Tags
  updateMetaName('twitter:title', seoData.metaTitle || seoData.name);
  updateMetaName('twitter:description', seoData.metaDescription || '');
  updateMetaName('twitter:image', `${DOMAIN}/icon.png`);

  // 6. Inject Schema.org JSON-LD (SoftwareApplication + BreadcrumbList + FAQPage)
  injectToolSchema(seoData, canonicalUrl);
}

/**
 * Reset document head metadata back to Homepage defaults.
 */
export function resetHomeSeo() {
  const homeTitle = 'PDFHome — 100% Free Online PDF Tools & Office Converter (Private & Fast)';
  const homeDesc = 'Free online PDF tools. Merge, split, compress, sign, and convert PDF to Word, Excel, PowerPoint, and JPG directly in your browser. 100% private, no file uploads, and no limits.';
  const homeUrl = `${DOMAIN}/`;

  document.title = homeTitle;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = homeDesc;

  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (linkCanonical) linkCanonical.href = homeUrl;

  updateMetaProperty('og:title', homeTitle);
  updateMetaProperty('og:description', homeDesc);
  updateMetaProperty('og:url', homeUrl);

  updateMetaName('twitter:title', homeTitle);
  updateMetaName('twitter:description', homeDesc);

  // Remove tool-specific schema, keep base schema
  const toolSchema = document.getElementById('tool-seo-schema');
  if (toolSchema) toolSchema.remove();
}

/**
 * Helper to update meta property tags.
 */
function updateMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Helper to update meta name tags.
 */
function updateMetaName(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Injects valid, non-misleading Schema.org JSON-LD for the tool.
 */
function injectToolSchema(seoData, canonicalUrl) {
  let scriptEl = document.getElementById('tool-seo-schema');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.id = 'tool-seo-schema';
    document.head.appendChild(scriptEl);
  }

  const graph = [
    // 1. Breadcrumbs
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
    // 2. Software Application
    {
      '@type': 'WebApplication',
      '@id': `${canonicalUrl}#software`,
      'name': `${seoData.name} — PDFHome`,
      'url': canonicalUrl,
      'description': seoData.metaDescription,
      'applicationCategory': 'UtilitiesApplication',
      'operatingSystem': 'All modern web browsers',
      'offers': {
        '@type': 'Offer',
        'price': '0.00',
        'priceCurrency': 'USD'
      }
    }
  ];

  // 3. HowTo Steps if available
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

  // 4. FAQ Schema if FAQs are present
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

  scriptEl.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  }, null, 2);
}

/**
 * Update metadata for static/legal pages (Privacy, Terms, Contact)
 */
export function updateSimpleSeo({ title, description, slug }) {
  document.title = title || 'PDFHome';

  let metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = description || '';

  const canonicalUrl = `${DOMAIN}${slug}`;
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (linkCanonical) linkCanonical.href = canonicalUrl;

  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', description || '');
  updateMetaProperty('og:url', canonicalUrl);
  updateMetaProperty('og:type', 'website');
  updateMetaProperty('og:image', `${DOMAIN}/icon.png`);

  updateMetaName('twitter:title', title);
  updateMetaName('twitter:description', description || '');
  updateMetaName('twitter:image', `${DOMAIN}/icon.png`);

  const toolSchema = document.getElementById('tool-seo-schema');
  if (toolSchema) toolSchema.remove();
}

