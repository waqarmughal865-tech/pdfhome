# PDFHome — Privacy-First Client-Side PDF & Document Suite

Live URL: [https://pdfhome.site/](https://pdfhome.site/)

PDFHome is a high-performance, 100% client-side document workstation. All PDF operations, digital signing, file conversions, optical character recognition (OCR), and document edits occur entirely in memory within the user's web browser using HTML5 Canvas, WebAssembly, and native modern web APIs. Files are never uploaded or retained on any remote server.

## Features & SEO Routes

### Core Tools
- **Merge PDF** (`/merge-pdf`): Combine multiple PDF documents and images into a single file with custom reordering.
- **Split PDF** (`/split-pdf`): Extract specific page numbers, split by ranges, or burst into individual documents.
- **Compress PDF** (`/compress-pdf`): Downsize file size with real-time visual side-by-side quality comparison and size-guard protection.
- **Sign PDF Online** (`/sign-pdf`): Draw handwritten digital signatures or place transparent signature stamps with 9-point grid snapping.
- **Rotate PDF** (`/rotate-pdf`): Rotate pages 90° clockwise/counterclockwise and fix page orientations.
- **Delete PDF Pages** (`/delete-pdf-pages`): Selectively remove unwanted pages or blank sheets.

### Office & Media Conversions
- **PDF to Word** (`/pdf-to-word`): Convert PDF files to editable Microsoft Word (`.docx`) documents with layout preservation.
- **Word to PDF** (`/docx-to-pdf`): Render `.docx` files to clean, print-ready PDF files.
- **PDF to Excel** (`/pdf-to-excel`): Extract structured tabular data into Microsoft Excel spreadsheets (`.xlsx`).
- **Excel to PDF** (`/excel-to-pdf`): Export formatted spreadsheets into PDF documents.
- **PDF to PowerPoint** (`/pdf-to-powerpoint`): Convert PDF slides into editable Microsoft PowerPoint presentations (`.pptx`).
- **PDF to JPG** (`/pdf-to-jpg`): Render high-definition JPG or PNG images from PDF pages with ZIP downloads.
- **JPG to PDF** (`/jpg-to-pdf`): Convert JPG, PNG, and WebP images into formatted PDF documents.
- **OCR PDF** (`/ocr-pdf`): Picture PDF to searchable, selectable text PDF via client-side optical character recognition.

### Page Tools & Security
- **Watermark PDF** (`/watermark-pdf`): Add text or image stamps with opacity, scale, and rotation controls.
- **Protect PDF** (`/protect-pdf`): Apply password lock and standard 128-bit PDF encryption.
- **Crop PDF Margins** (`/crop-pdf`): Trim page margins, remove scanner borders, or crop to custom box dimensions.
- **Number PDF Pages** (`/page-numbers`): Add customized headers or footers with page numbering.

## Technical Architecture & SEO
- **Zero Server Uploads**: 100% client-side processing using `pdf-lib`, `pdfjs-dist`, `docx`, `xlsx`, and modern browser APIs.
- **Clean HTML5 Routing**: Distinct SEO URLs for every tool with deep linking and fallback SPA redirection.
- **Dynamic SEO Engine**: Updates canonical URLs, Open Graph tags, Twitter Cards, and injects Schema.org JSON-LD structured data (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`) dynamically.
- **Code-Splitting**: Dynamic `import()` statements lazy-load heavy PDF and conversion engines only when a user accesses that tool, maximizing Core Web Vitals and Lighthouse scores.
