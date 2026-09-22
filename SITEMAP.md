# PDFHome — XML Sitemap & Search Engine Indexing Guide

This document details the XML Sitemap structure, URL inventory, technical SEO specifications, and Google Search Console submission instructions for **PDFHome** ([https://pdfhome.site](https://pdfhome.site)).

---

## 1. Executive Summary

| Property | Value |
| :--- | :--- |
| **Primary Domain** | `https://pdfhome.site` |
| **Canonical Policy** | All URLs strictly use `https://pdfhome.site/` — no `.app` or `.pages.dev` domains. |
| **Sitemap URL** | `https://pdfhome.site/sitemap.xml` |
| **Robots.txt URL** | `https://pdfhome.site/robots.txt` |
| **Total Included URLs** | **22** |
| **Pre-rendered Pages** | **22 / 22 (100%)** |
| **Encoding** | UTF-8 |
| **Standard** | [Sitemaps XML Protocol 0.9](https://www.sitemaps.org/schemas/sitemap/0.9/) |

---

## 2. Robots.txt Integration

Search engine spiders discover the sitemap directly via `robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /assets/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yandex
Allow: /

User-agent: DuckDuckBot
Allow: /

Sitemap: https://pdfhome.site/sitemap.xml
```

---

## 3. Sitemap URL Inventory (All 22 Valid Pages)

Every URL listed in `public/sitemap.xml` corresponds to a real, public, indexable page with unique pre-rendered HTML, distinct `<title>`, `<meta name="description">`, `<h1>`, How-To guide, FAQ section, and Schema.org JSON-LD structured data.

| # | Route | Full URL | Page Title | Schema.org Type |
| :- | :--- | :--- | :--- | :--- |
| 1 | `/` | `https://pdfhome.site/` | PDFHome — Free Online PDF Tools (No File Limits) | WebSite, Organization, SoftwareApplication |
| 2 | `/merge-pdf` | `https://pdfhome.site/merge-pdf` | Merge PDF Files Online Free — Combine Multiple PDFs \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 3 | `/split-pdf` | `https://pdfhome.site/split-pdf` | Split PDF Pages Online Free — Extract Pages from PDF \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 4 | `/compress-pdf` | `https://pdfhome.site/compress-pdf` | Compress PDF Online Free — Reduce PDF File Size \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 5 | `/pdf-to-word` | `https://pdfhome.site/pdf-to-word` | Convert PDF to Word (DOCX) Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 6 | `/pdf-to-excel` | `https://pdfhome.site/pdf-to-excel` | Convert PDF to Excel (XLSX) Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 7 | `/pdf-to-powerpoint` | `https://pdfhome.site/pdf-to-powerpoint` | Convert PDF to PowerPoint (PPTX) Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 8 | `/pdf-to-jpg` | `https://pdfhome.site/pdf-to-jpg` | Convert PDF to JPG Images Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 9 | `/jpg-to-pdf` | `https://pdfhome.site/jpg-to-pdf` | Convert JPG to PDF Online Free — Image to PDF Converter \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 10 | `/ocr-pdf` | `https://pdfhome.site/ocr-pdf` | Free OCR PDF Online — Recognize Text in Scanned PDFs \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 11 | `/rotate-pdf` | `https://pdfhome.site/rotate-pdf` | Rotate PDF Pages Online Free — Permanent PDF Rotation \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 12 | `/delete-pdf-pages` | `https://pdfhome.site/delete-pdf-pages` | Delete Pages from PDF Online Free — Remove PDF Pages \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 13 | `/watermark-pdf` | `https://pdfhome.site/watermark-pdf` | Add Watermark to PDF Online Free — Text & Image Watermarks \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 14 | `/sign-pdf` | `https://pdfhome.site/sign-pdf` | Sign PDF Online Free — Add Digital Signature to PDF \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 15 | `/protect-pdf` | `https://pdfhome.site/protect-pdf` | Protect PDF with Password Online Free — Encrypt PDF \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 16 | `/crop-pdf` | `https://pdfhome.site/crop-pdf` | Crop PDF Margins Online Free — Trim PDF Pages \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 17 | `/page-numbers` | `https://pdfhome.site/page-numbers` | Add Page Numbers to PDF Online Free — Number PDF Pages \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 18 | `/word-to-pdf` | `https://pdfhome.site/word-to-pdf` | Convert Word to PDF (DOCX to PDF) Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 19 | `/excel-to-pdf` | `https://pdfhome.site/excel-to-pdf` | Convert Excel to PDF (XLSX to PDF) Online Free \| PDFHome | SoftwareApplication, HowTo, FAQPage, BreadcrumbList |
| 20 | `/privacy` | `https://pdfhome.site/privacy` | Privacy Policy — PDFHome | WebPage |
| 21 | `/terms` | `https://pdfhome.site/terms` | Terms of Service — PDFHome | WebPage |
| 22 | `/contact` | `https://pdfhome.site/contact` | Contact Us — PDFHome | ContactPage |

---

## 4. Excluded Routes & Exclusion Rationale

The following routes are intentionally **omitted** from `sitemap.xml` to prevent crawl budget waste, avoid duplicate content penalties, and maintain 100% indexing quality:

| Route | Why Excluded | Better Alternative |
| :--- | :--- | :--- |
| `/pages` | Internal generic editor workbench that loads the multi-page manager. It lacks standalone tool SEO content, unique FAQs, and pre-rendered HTML. | Individual tool URLs: `/rotate-pdf`, `/delete-pdf-pages`, `/watermark-pdf`, `/sign-pdf`, `/protect-pdf`, `/crop-pdf`, `/page-numbers`. |
| `/convert` | Internal umbrella converter wrapper defaulting to `pdf-to-docx`. Including it would create duplicate content issues with `/pdf-to-word`. | Individual conversion URLs: `/pdf-to-word`, `/pdf-to-excel`, `/pdf-to-powerpoint`, `/pdf-to-jpg`, `/jpg-to-pdf`, `/word-to-pdf`, `/excel-to-pdf`. |
| `/docx-to-pdf` | Alias route redirecting/routing internally to `/word-to-pdf`. | Canonical URL `/word-to-pdf`. |
| `/slides-to-pdf` | Secondary converter route without pre-rendered SEO content. | Canonical URL `/pdf-to-powerpoint`. |
| `/assets/*` | Static script, stylesheet, and binary chunks blocked in `robots.txt`. | Not user-facing pages. |

---

## 5. Technical Specifications & Best Practices

1. **No Deprecated Tags**: Google Search Central officially states that Googlebot ignores `<priority>` and `<changefreq>`. In accordance with modern standards, `sitemap.xml` contains only `<loc>` and `<lastmod>`.
2. **Standard Date Format**: `<lastmod>` uses the W3C datetime format `YYYY-MM-DD` (`2026-09-22`).
3. **Canonical Consistency**: Every `<loc>` value matches the `<link rel="canonical">` tag embedded in the pre-rendered HTML of each corresponding page.
4. **Trailing Slash Convention**:
   - Root URL uses a trailing slash: `https://pdfhome.site/`
   - Sub-routes omit trailing slashes: `https://pdfhome.site/merge-pdf`
   - Configured uniformly in Vite, Cloudflare Pages `_redirects`, and `sitemap.xml`.

---

## 6. Submitting the Sitemap to Google Search Console

Follow these steps to submit and monitor your sitemap in Google Search Console:

### Step 1: Open Google Search Console
Navigate to [https://search.google.com/search-console](https://search.google.com/search-console) and ensure you are logged into the Google account that verified ownership of `https://pdfhome.site`.

### Step 2: Select the Property
In the top-left dropdown, select your property:
- **URL Prefix Property**: `https://pdfhome.site/`
- Or **Domain Property**: `pdfhome.site`

### Step 3: Navigate to Sitemaps
In the left-hand navigation sidebar under the **Indexing** section, click **Sitemaps**.

### Step 4: Enter the Sitemap URL
Under **Add a new sitemap**, you will see your domain prefix (`https://pdfhome.site/`).
In the input box next to it, enter:
```
sitemap.xml
```

### Step 5: Click Submit
Click the **SUBMIT** button.
- You should see a confirmation notification: *"Sitemap submitted successfully. Google will periodically process it and look for changes."*

### Step 6: Verify Status
In the **Submitted sitemaps** table below:
- **Status**: Should display **Success** (green).
- **Discovered pages**: Should show **22**.
- If status displays *Couldn't fetch* immediately, wait a few minutes and click refresh — Googlebot typically takes between a few minutes to 24 hours to crawl and parse the file.

---

## 7. Troubleshooting Common GSC Sitemap Messages

| Message | Cause | Resolution |
| :--- | :--- | :--- |
| **"Couldn't fetch"** | Googlebot hasn't attempted the fetch yet, or temporary DNS cache delay. | Check that `curl -I https://pdfhome.site/sitemap.xml` returns HTTP 200. If 200 OK, click into the sitemap row and click "Resubmit". |
| **"Sitemap has format errors"** | Invalid XML markup or characters. | Our sitemap has been validated against W3C XML schema. Ensure no unescaped `&` characters exist. |
| **"Discovered URLs < 22"** | Google is currently parsing sub-routes in batches. | Allow up to 48 hours for Googlebot to crawl and evaluate all 22 pre-rendered pages. |

---

## 8. Ongoing Sitemap Maintenance

When adding a new PDF tool in the future:
1. Register tool metadata in `src/seo/seo-metadata.js` (`TOOL_SEO_DATA`).
2. Add the tool route to `public/sitemap.xml` inside `<urlset>`.
3. Update `<lastmod>` to today's date for updated pages.
4. Run `npm run build` so `scripts/prerender.js` creates the pre-rendered HTML in `dist/`.
5. Deploy to production and re-submit in Google Search Console if a major structural update occurs.
