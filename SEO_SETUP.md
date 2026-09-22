# PDFHome — SEO Setup & Google Search Console Guide

**Primary Domain:** `https://pdfhome.site/`
**Last Updated:** 2026-09-22

---

## ✅ What Was Implemented in the Codebase

### 1. Google Search Console Verification

| Method | Location | Status |
|:---|:---|:---|
| **HTML File** | `public/google73c663b734ee22d8.html` → `dist/google73c663b734ee22d8.html` | ✅ Done |
| **Meta Tag** | `<meta name="google-site-verification" content="73c663b734ee22d8" />` in `index.html` | ✅ Done |

**Verification URL:** `https://pdfhome.site/google73c663b734ee22d8.html`
**File contents (exact, unchanged):** `google-site-verification: google73c663b734ee22d8.html`

> The file lives in `public/` — Vite copies it verbatim to `dist/` on every build. It will never be removed by builds.

---

### 2. Canonical Domain — `https://pdfhome.site/`

All SEO references point exclusively to `https://pdfhome.site/`:

| File | What Was Set |
|:---|:---|
| `index.html` | `<link rel="canonical" href="https://pdfhome.site/" />` |
| `index.html` | All OG, Twitter, Schema.org JSON-LD use `https://pdfhome.site/` |
| `src/seo/seo-metadata.js` | `DOMAIN = 'https://pdfhome.site'` constant |
| `src/seo/seo-helper.js` | All dynamic canonical, OG, Twitter, JSON-LD resolved via `DOMAIN` |
| `public/sitemap.xml` | All 23 URLs use `https://pdfhome.site/*` |
| `public/robots.txt` | `Sitemap: https://pdfhome.site/sitemap.xml` |

**Old domain references removed:**
- `pdfhome.app` — ✅ Fully removed from all source code
- `pdfhome.pages.dev` — ✅ Fully removed from all source code (needs Cloudflare redirect — see Section 4 below)

---

### 3. Static Pre-Rendering (SSG) — All 22 Routes

The build pipeline (`npm run build`) runs `scripts/prerender.js` after Vite, generating complete static HTML for every route so crawlers receive full content on the initial HTTP request with zero JavaScript dependency:

| Route | Pre-rendered File |
|:---|:---|
| `/` | `dist/index.html` |
| `/merge-pdf` | `dist/merge-pdf/index.html` |
| `/split-pdf` | `dist/split-pdf/index.html` |
| `/compress-pdf` | `dist/compress-pdf/index.html` |
| `/pdf-to-word` | `dist/pdf-to-word/index.html` |
| `/pdf-to-excel` | `dist/pdf-to-excel/index.html` |
| `/pdf-to-powerpoint` | `dist/pdf-to-powerpoint/index.html` |
| `/pdf-to-jpg` | `dist/pdf-to-jpg/index.html` |
| `/jpg-to-pdf` | `dist/jpg-to-pdf/index.html` |
| `/ocr-pdf` | `dist/ocr-pdf/index.html` |
| `/rotate-pdf` | `dist/rotate-pdf/index.html` |
| `/delete-pdf-pages` | `dist/delete-pdf-pages/index.html` |
| `/watermark-pdf` | `dist/watermark-pdf/index.html` |
| `/sign-pdf` | `dist/sign-pdf/index.html` |
| `/protect-pdf` | `dist/protect-pdf/index.html` |
| `/crop-pdf` | `dist/crop-pdf/index.html` |
| `/page-numbers` | `dist/page-numbers/index.html` |
| `/word-to-pdf` | `dist/word-to-pdf/index.html` |
| `/excel-to-pdf` | `dist/excel-to-pdf/index.html` |
| `/privacy` | `dist/privacy/index.html` |
| `/terms` | `dist/terms/index.html` |
| `/contact` | `dist/contact/index.html` |

Each pre-rendered page includes: unique `<title>`, `<meta description>`, `<link rel="canonical">`, `<h1>`, intro text, How-To steps, feature bullets, FAQs, related tools, hreflang tags, and Schema.org JSON-LD.

---

### 4. Schema.org Structured Data

| Schema Type | Pages | Status |
|:---|:---|:---|
| `WebSite` + `SearchAction` | Homepage | ✅ |
| `WebApplication` | Homepage + all tool pages | ✅ |
| `Organization` | Homepage | ✅ |
| `FAQPage` | Homepage + all tool pages | ✅ |
| `HowTo` + `HowToStep` | All tool pages | ✅ |
| `BreadcrumbList` | All tool pages | ✅ |

---

### 5. Sitemap & Robots

- **`public/sitemap.xml`** — 23 canonical URLs, all `https://pdfhome.site/*`, no hash fragments, current `<lastmod>` dates
- **`public/robots.txt`** — `Allow: /` for all major bots, `Sitemap: https://pdfhome.site/sitemap.xml`

---

### 6. Cloudflare Redirect Rules (`public/_redirects`)

Legacy URL 301 redirects handled server-side by Cloudflare Pages:

```
/merge          -> /merge-pdf          301
/split          -> /split-pdf          301
/compress       -> /compress-pdf       301
/pdf-to-docx    -> /pdf-to-word        301
/docx-to-pdf    -> /word-to-pdf        301
/pdf-to-slides  -> /pdf-to-powerpoint  301
/pdf-to-image   -> /pdf-to-jpg         301
/image-to-pdf   -> /jpg-to-pdf         301
/organize-pdf   -> /rotate-pdf         301
/*              -> /index.html         200  (SPA fallback)
```

---

## 🔧 Manual Steps Required — Google Search Console

### Step 1: Add and Verify the Property

1. Go to https://search.google.com/search-console
2. Click **Add Property** → select **URL prefix**
3. Enter: `https://pdfhome.site/`
4. Choose **HTML file** verification method
5. Google will detect `https://pdfhome.site/google73c663b734ee22d8.html` automatically
6. Click **Verify**

> Alternatively, the `<meta name="google-site-verification" content="73c663b734ee22d8" />` tag
> in `index.html` can also be used for the HTML tag method.

### Step 2: Submit the Sitemap

1. In GSC, navigate to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Full URL: `https://pdfhome.site/sitemap.xml`
4. Click **Submit** → confirm status is **Success**

### Step 3: Request Indexing for Priority Pages

Use the **URL Inspection** tool for each of these and click **Request Indexing**:

```
https://pdfhome.site/
https://pdfhome.site/merge-pdf
https://pdfhome.site/split-pdf
https://pdfhome.site/compress-pdf
https://pdfhome.site/pdf-to-word
https://pdfhome.site/pdf-to-excel
https://pdfhome.site/pdf-to-powerpoint
https://pdfhome.site/pdf-to-jpg
https://pdfhome.site/jpg-to-pdf
https://pdfhome.site/ocr-pdf
https://pdfhome.site/rotate-pdf
https://pdfhome.site/delete-pdf-pages
https://pdfhome.site/watermark-pdf
https://pdfhome.site/sign-pdf
https://pdfhome.site/protect-pdf
https://pdfhome.site/word-to-pdf
https://pdfhome.site/excel-to-pdf
```

### Step 4: Verify Crawled Content (Test Live URL)

For any key URL (e.g. `https://pdfhome.site/merge-pdf`):
1. Paste URL in the GSC top search bar
2. Click **Test Live URL** → **View Tested Page**
3. **HTML tab**: Should show full H1, intro, FAQ, structured data in raw HTML
4. **Screenshot tab**: Page should render visually with no blank sections
5. Confirm HTTP 200 response, zero blocked resources

### Step 5: (Optional) Change of Address Tool

If you had a previous GSC property for `pdfhome.pages.dev` or `pdfhome.app`:
1. Open that old property in GSC
2. Go to **Settings** → **Change of address**
3. Select `https://pdfhome.site/` as the new destination
4. Click **Confirm & Submit**

---

## 🔧 Manual Steps Required — Cloudflare

### Redirect `pdfhome.pages.dev` → `pdfhome.site` (301)

Since `*.pages.dev` is not a DNS zone you control in Cloudflare, use a Cloudflare Worker:

1. In Cloudflare Dashboard → **Workers & Pages** → **Create Application** → **Worker**
2. Name: `pages-dev-redirect`
3. Paste this script:

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('pdfhome.pages.dev')) {
      return Response.redirect(
        `https://pdfhome.site${url.pathname}${url.search}`,
        301
      );
    }
    return fetch(request);
  }
};
```

4. Click **Deploy**
5. Bind the Worker route to: `pdfhome.pages.dev/*`

### Ensure Custom Domain Is Connected

1. In Cloudflare → **Workers & Pages** → your project → **Custom domains**
2. Confirm `pdfhome.site` is listed and **Active**
3. Confirm SSL/TLS certificate is provisioned (automatic via Cloudflare Universal SSL)

---

## 📋 Final Verification Checklist

| Item | Status |
|:---|:---|
| `public/google73c663b734ee22d8.html` in place (Vite copies to dist/) | ✅ Done |
| `dist/google73c663b734ee22d8.html` confirmed present after build | ✅ Done |
| `<meta name="google-site-verification" content="73c663b734ee22d8" />` in `index.html` | ✅ Done |
| All 22 routes pre-rendered in `dist/` | ✅ Done |
| All canonical URLs point to `https://pdfhome.site/` | ✅ Done |
| OG and Twitter metadata use `https://pdfhome.site/` | ✅ Done |
| `sitemap.xml` valid, all URLs `https://pdfhome.site/*` | ✅ Done |
| `robots.txt` points to `https://pdfhome.site/sitemap.xml` | ✅ Done |
| Schema.org JSON-LD: WebSite, WebApplication, FAQPage, HowTo, BreadcrumbList | ✅ Done |
| No `pdfhome.app` references in source code | ✅ Done |
| No `pdfhome.pages.dev` references in source code | ✅ Done |
| `npm run build` completes successfully | ✅ Done |
| All existing PDF tools unchanged | ✅ Done |
| Submit sitemap in Google Search Console | ⏳ Manual step |
| Request indexing for key pages in GSC | ⏳ Manual step |
| Cloudflare Worker redirect: `pdfhome.pages.dev` → `pdfhome.site` | ⏳ Manual step |
| GSC Change of Address (if old property existed) | ⏳ Manual step |
