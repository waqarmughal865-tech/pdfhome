# PDFHome — Sitemap Documentation

**Last Updated:** September 23, 2026  
**Primary Domain:** `https://pdfhome.site/`

---

## URLs

| Resource | URL |
|----------|-----|
| **Sitemap** | `https://pdfhome.site/sitemap.xml` |
| **Robots.txt** | `https://pdfhome.site/robots.txt` |
| **Primary Domain** | `https://pdfhome.site/` |

---

## Included URLs (21 pages)

All URLs use the canonical domain `https://pdfhome.site/`.

### Homepage
| URL | Title |
|-----|-------|
| `/` | PDFHome — 100% Free Online PDF Tools & Office Converter |

### Core PDF Tools (8 pages)
| URL | Title |
|-----|-------|
| `/merge-pdf` | Merge PDF Online Free — Combine Multiple PDF Files |
| `/split-pdf` | Split PDF Online Free — Extract Pages from PDF |
| `/compress-pdf` | Compress PDF Online Free — Reduce PDF File Size |
| `/rotate-pdf` | Rotate PDF Pages Online Free |
| `/delete-pdf-pages` | Delete PDF Pages Online Free — Remove Pages from PDF |
| `/watermark-pdf` | Watermark PDF Online Free — Add Text & Image Stamps |
| `/sign-pdf` | Sign PDF Online Free — Draw Electronic & Digital Signatures |
| `/protect-pdf` | Password Protect PDF Online Free — Encrypt PDF Documents |

### Conversion Tools (6 pages)
| URL | Title |
|-----|-------|
| `/pdf-to-word` | PDF to Word Converter Free — Convert PDF to Editable DOCX |
| `/pdf-to-excel` | PDF to Excel Converter Free — Extract Tables to XLSX |
| `/pdf-to-powerpoint` | PDF to PowerPoint Converter Free — Convert PDF to PPTX |
| `/pdf-to-jpg` | PDF to JPG Converter Free — Convert PDF Pages to Images |
| `/jpg-to-pdf` | JPG to PDF Converter Free — Convert Images to PDF Online |
| `/ocr-pdf` | OCR PDF Online Free — Convert Scanned PDF to Searchable Text |

### Page Tools (3 pages)
| URL | Title |
|-----|-------|
| `/crop-pdf` | Crop PDF Margins Online Free — Trim PDF Pages |
| `/page-numbers` | Add Page Numbers to PDF Online Free — Bates Numbering |
| `/word-to-pdf` | Word to PDF Converter Free — Convert DOCX to PDF Online |

### Office Conversion (1 page)
| URL | Title |
|-----|-------|
| `/excel-to-pdf` | Excel to PDF Converter Free — Convert XLSX to PDF Online |

### Legal & Info (3 pages)
| URL | Title |
|-----|-------|
| `/privacy` | Privacy Policy — PDFHome |
| `/terms` | Terms of Service — PDFHome |
| `/contact` | Contact & Support Desk — PDFHome |

---

## Excluded URLs

| URL | Reason |
|-----|--------|
| `/pages` | Internal workbench hub — overlaps with `/rotate-pdf`, `/delete-pdf-pages`, `/watermark-pdf`, `/sign-pdf`, `/protect-pdf`, `/crop-pdf`, `/page-numbers` |
| `/convert` | Internal converter hub — overlaps with `/pdf-to-word`, `/pdf-to-excel`, `/pdf-to-powerpoint` |
| `/docx-to-pdf` | Alias that redirects to `/word-to-pdf` via `_redirects` |
| `/slides-to-pdf` | Minor supplementary route, not a primary landing page |
| `/merge` | Legacy alias, 301 redirects to `/merge-pdf` |
| `/split` | Legacy alias, 301 redirects to `/split-pdf` |
| `/compress` | Legacy alias, 301 redirects to `/compress-pdf` |
| `/pdf-to-docx` | Legacy alias, 301 redirects to `/pdf-to-word` |
| `/pdf-to-slides` | Legacy alias, 301 redirects to `/pdf-to-powerpoint` |
| `/pdf-to-image` | Legacy alias, 301 redirects to `/pdf-to-jpg` |
| `/image-to-pdf` | Legacy alias, 301 redirects to `/jpg-to-pdf` |
| `/organize-pdf` | Legacy alias, 301 redirects to `/rotate-pdf` |

---

## Sitemap Maintenance Rules

1. **Only include real, implemented routes** that serve unique content to visitors
2. **Never include redirected aliases** — only include the canonical target URL
3. **Never include internal application states** (e.g., tab switches, modal dialogs)
4. **Never create fake pages** solely to inflate the sitemap
5. **Update `<lastmod>` dates** when page content actually changes
6. **All URLs must use `https://pdfhome.site/`** — never use `pdfhome.pages.dev`, `pdfhome.app`, or `localhost`
7. **Every sitemap URL must have** a unique `<title>`, unique `<meta description>`, a visible `<h1>`, and a `<link rel="canonical">` pointing to itself

---

## Canonical Domain Rules

- **Always use:** `https://pdfhome.site/`
- **Never use:** `https://pdfhome.pages.dev/`, `https://pdfhome.app/`, `http://pdfhome.site/`
- Canonical URLs must match the `<link rel="canonical">`, `og:url`, and JSON-LD `url` values
- No trailing slashes on tool pages (e.g., `/merge-pdf` not `/merge-pdf/`)

---

## Google Search Console — Sitemap Submission

### Submit the Sitemap

```
1. Go to Google Search Console
   → https://search.google.com/search-console

2. Select property:
   → https://pdfhome.site/

3. Navigate to:
   → Sitemaps (left sidebar)

4. In "Add a new sitemap" field, enter:
   → sitemap.xml

5. Click:
   → Submit
```

### URL Inspection

To check if a specific page is indexed:

```
1. Go to Google Search Console
   → URL Inspection (left sidebar)

2. Enter the full URL:
   → https://pdfhome.site/merge-pdf

3. Review the result:
   → "URL is on Google" = indexed ✅
   → "URL is not on Google" = not yet indexed

4. If not indexed, click:
   → Request Indexing
```

### Requesting Indexing

```
1. Use URL Inspection for each priority page
2. Click "Request Indexing"
3. Wait for Google's crawl schedule
```

> **Important:** Sitemap submission does not guarantee immediate indexing or ranking. Google crawls and indexes pages on its own schedule based on page quality, relevance, and crawl budget. Requesting indexing provides a signal but does not force indexing.

### Priority Pages for Inspection

| Priority | URL |
|----------|-----|
| 1 | `https://pdfhome.site/` |
| 2 | `https://pdfhome.site/merge-pdf` |
| 3 | `https://pdfhome.site/split-pdf` |
| 4 | `https://pdfhome.site/compress-pdf` |
| 5 | `https://pdfhome.site/pdf-to-word` |
| 6 | `https://pdfhome.site/sign-pdf` |
| 7 | `https://pdfhome.site/pdf-to-jpg` |
| 8 | `https://pdfhome.site/ocr-pdf` |
