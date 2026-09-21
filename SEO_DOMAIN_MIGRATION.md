# PDFHome SEO Domain Migration Guide

This document details the domain migration of PDFHome to its permanent production domain, provides step-by-step Cloudflare 301 redirect setup, and outlines the Google Search Console (GSC) transition procedure.

---

## 1. Domain Configuration Overview

- **Primary / Canonical Domain**: `https://pdfhome.site/`
- **Previous Domains**:
  - `https://pdfhome.pages.dev/` (Cloudflare Pages default subdomain — to be 301 redirected)
  - `https://pdfhome.app/` (Legacy domain — all references permanently removed)

---

## 2. Summary of Changes Made in Codebase

| File / Component | Changes Made |
| :--- | :--- |
| [`index.html`](file:///c:/Users/Waqar/Desktop/pdfweb/index.html) | Updated canonical URL (`https://pdfhome.site/`), Open Graph URL & Image tags, Twitter Card metadata, and Schema.org JSON-LD entities (`WebSite`, `WebApplication`, `Organization`, SearchAction, ContactPoint). |
| [`src/seo/seo-metadata.js`](file:///c:/Users/Waqar/Desktop/pdfweb/src/seo/seo-metadata.js) | Updated `DOMAIN` constant to `https://pdfhome.site`. Added complete SEO metadata (H1, meta title, meta description, How-To steps, feature highlights, and FAQs) for `/word-to-pdf` and `/excel-to-pdf`. |
| [`src/seo/seo-helper.js`](file:///c:/Users/Waqar/Desktop/pdfweb/src/seo/seo-helper.js) | Dynamic canonical, OG, Twitter, and Schema.org JSON-LD generators now resolve to `https://pdfhome.site`. Added `updateSimpleSeo()` helper for legal and static routes (`/privacy`, `/terms`, `/contact`, `/pages`, `/convert`). |
| [`src/main.js`](file:///c:/Users/Waqar/Desktop/pdfweb/src/main.js) | Added dedicated SEO route handlers for `/word-to-pdf` and `/excel-to-pdf`. Added automated title/meta updates on legal pages (`/privacy`, `/terms`, `/contact`). Updated alias table for clean backward compatibility. |
| [`src/components/Legal.js`](file:///c:/Users/Waqar/Desktop/pdfweb/src/components/Legal.js) | Updated domain reference in Terms of Service to `https://pdfhome.site`. Converted hash-based back navigation links to standard SPA paths (`/` and `/contact`). |
| [`src/services/firebase-contact.js`](file:///c:/Users/Waqar/Desktop/pdfweb/src/services/firebase-contact.js) | Updated inquiry origin tracker `source` attribute from `pdfhome.pages.dev` to `pdfhome.site`. |
| [`public/robots.txt`](file:///c:/Users/Waqar/Desktop/pdfweb/public/robots.txt) | Pointed Sitemap directive directly to `https://pdfhome.site/sitemap.xml`. |
| [`public/sitemap.xml`](file:///c:/Users/Waqar/Desktop/pdfweb/public/sitemap.xml) | Replaced all URLs with `https://pdfhome.site/*`. Removed non-canonical alias URLs (such as `/organize-pdf` in favor of canonical `/rotate-pdf`). Excluded hash fragments. Refreshed `<lastmod>` timestamps. |
| [`README.md`](file:///c:/Users/Waqar/Desktop/pdfweb/README.md) | Updated live production URL to `https://pdfhome.site/`. |

---

## 3. Cloudflare Configuration (Exact 301 Redirect Steps)

> [!IMPORTANT]
> **Do not use client-side JavaScript redirects (e.g. `window.location.replace`) for domain migration.**
> Search engine crawlers (Googlebot, Bingbot) require an HTTP 301 status code at the network layer to transfer PageRank, link equity, and indexing signals to `https://pdfhome.site/`.

### Step 3.1: Connect Custom Domain to Cloudflare Pages Project
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > select your **pdfweb** (or PDFHome) project.
3. Click the **Custom domains** tab.
4. Click **Set up a custom domain**.
5. Enter: `pdfhome.site` (and optionally `www.pdfhome.site`).
6. Follow the prompts to configure DNS (CNAME pointing to your `*.pages.dev` project). Cloudflare will automatically provision a free universal SSL/TLS certificate for `pdfhome.site`.

### Step 3.2: Configure HTTP 301 Redirect from `pdfhome.pages.dev` to `pdfhome.site`

Cloudflare provides multiple ways to set up permanent redirects. Choose **Method A** (recommended for Cloudflare Pages) or **Method B** (Cloudflare Rules):

#### Method A: Cloudflare Snippet / Worker (Recommended for Cloudflare Pages subdomains)
Since Cloudflare does not allow DNS management on `*.pages.dev` domains directly, create a lightweight Cloudflare Worker or Pages redirect rule:

1. In the Cloudflare Dashboard, navigate to **Workers & Pages** > **Overview** > **Create Application** > **Worker**.
2. Name the worker: `pages-dev-redirect`.
3. Paste the following script:
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('pdfhome.pages.dev')) {
      const targetUrl = `https://pdfhome.site${url.pathname}${url.search}`;
      return Response.redirect(targetUrl, 301);
    }
    return fetch(request);
  }
};
```
4. Click **Deploy**.
5. Go to your Pages project > **Settings** > **Functions** (or **Triggers**) > route or bind the worker to `pdfhome.pages.dev/*`.

#### Method B: Cloudflare Redirect Rules (When DNS zone is in Cloudflare)
If you manage `pdfhome.site` and any secondary domains inside a Cloudflare Zone:
1. In Cloudflare Dashboard, select your domain zone.
2. Go to **Rules** > **Redirect Rules** (or **Page Rules**).
3. Click **Create rule**:
   - **Rule name**: `Redirect old domain to pdfhome.site`
   - **When incoming requests match**: Custom filter expression
     - Field: `Hostname`
     - Operator: `equals`
     - Value: `pdfhome.pages.dev` (or any old domain)
   - **Then**:
     - Type: `Dynamic`
     - Expression: `concat("https://pdfhome.site", http.request.uri.path)`
     - Status code: `301` (Moved Permanently)
     - Preserve query string: `Checked`
4. Click **Deploy**.

---

## 4. Google Search Console (GSC) Steps

### Step 4.1: Add & Verify `https://pdfhome.site/`
1. Go to the [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** in the top-left dropdown.
3. Select **Domain property** and enter `pdfhome.site`:
   - Copy the provided `TXT` verification token.
   - Go to your DNS provider (Cloudflare DNS) and add a `TXT` record with `@` host and the verification token.
   - Return to GSC and click **Verify**.
   *(Alternatively, add a **URL prefix** property for `https://pdfhome.site/` and verify via HTML tag or file upload).*

### Step 4.2: Submit the New Sitemap
1. Inside the property for `https://pdfhome.site/`, click **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Full URL submitted: `https://pdfhome.site/sitemap.xml`
4. Click **Submit**. Verify status is **Success**.

### Step 4.3: Use the Change of Address Tool (If previous domain had a GSC property)
1. Open the property for the old domain in Google Search Console.
2. Navigate to **Settings** (gear icon) > **Change of address**.
3. Select the new property: `https://pdfhome.site/`.
4. Run the pre-validation checks:
   - 301 redirects are functional.
   - Verification of the new domain is active.
5. Click **Confirm & Submit**. Google will prioritize updating search index records from the old domain to `pdfhome.site`.

### Step 4.4: Request Indexing for Key Pages
Inspect the following core URLs using the URL Inspection tool and click **Request Indexing**:
- `https://pdfhome.site/`
- `https://pdfhome.site/merge-pdf`
- `https://pdfhome.site/split-pdf`
- `https://pdfhome.site/compress-pdf`
- `https://pdfhome.site/pdf-to-word`
- `https://pdfhome.site/pdf-to-excel`
- `https://pdfhome.site/pdf-to-powerpoint`
- `https://pdfhome.site/pdf-to-jpg`
- `https://pdfhome.site/jpg-to-pdf`
- `https://pdfhome.site/ocr-pdf`
- `https://pdfhome.site/rotate-pdf`
- `https://pdfhome.site/delete-pdf-pages`
- `https://pdfhome.site/watermark-pdf`
- `https://pdfhome.site/sign-pdf`
- `https://pdfhome.site/protect-pdf`
- `https://pdfhome.site/crop-pdf`
- `https://pdfhome.site/page-numbers`
- `https://pdfhome.site/word-to-pdf`
- `https://pdfhome.site/excel-to-pdf`

---

## 5. Post-Migration Verification Checklist

- [x] **No references to old domains** (`pdfhome.app`, `pdfhome.pages.dev`) exist in repository source code, meta tags, sitemap, or robots.txt.
- [x] **Canonical Tag**: `<link rel="canonical" href="https://pdfhome.site/" />` on home and `${DOMAIN}${slug}` on all tool pages.
- [x] **Open Graph & Twitter tags**: Use `https://pdfhome.site/` and `https://pdfhome.site/icon.png`.
- [x] **Structured Data (JSON-LD)**: No fake ratings or misleading claim schema. Valid `WebSite`, `WebApplication`, `Organization`, `HowTo`, `FAQPage`, and `BreadcrumbList`.
- [x] **Client-Side Integrity**: All PDF manipulation tools run 100% in-browser with zero remote uploads.
- [x] **Sitemap Validated**: `https://pdfhome.site/sitemap.xml` contains clean canonical paths only, without hashes.
- [x] **Robots.txt Validated**: Directs crawlers to `https://pdfhome.site/sitemap.xml`.
- [x] **Build Verification**: `npm run build` succeeds cleanly without errors or broken imports.
