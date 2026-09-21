/**
 * Comprehensive SEO Metadata Registry for PDFHome (https://pdfhome.site)
 * Contains high-intent keywords, titles, meta descriptions, H1 headings,
 * step-by-step How-To instructions, FAQs, and related internal links.
 */

import { MULTILINGUAL_QUERIES } from './multilingual-queries.js';

export const DOMAIN = 'https://pdfhome.site';
export { MULTILINGUAL_QUERIES };

export const TOOL_SEO_DATA = {
  'merge-pdf': {
    slug: '/merge-pdf',
    aliases: ['/merge', '#/merge', '#/merge-pdf'],
    name: 'Merge PDF',
    toolId: 'merge',
    metaTitle: 'Merge PDF Online Free — Combine Multiple PDF Files | PDFHome',
    metaDescription: 'Combine multiple PDF files into one document in seconds. 100% free, private in-browser PDF merger with custom drag-and-drop page ordering and zero server uploads.',
    h1: 'Merge PDF Files Online Free',
    intro: 'Combine multiple PDF files, documents, and images into a single unified PDF in seconds. Drag and drop your files to arrange them in your preferred reading order. All processing runs 100% locally in your browser for instant speed and absolute privacy.',
    howTo: [
      { step: 1, title: 'Upload PDF Files', desc: 'Select or drag and drop two or more PDF files from your device into the upload box.' },
      { step: 2, title: 'Arrange Document Order', desc: 'Drag the file cards up or down to set the exact sequence you want them to appear in the combined document.' },
      { step: 3, title: 'Merge & Download', desc: 'Click "Merge PDF" to generate and download your combined document instantly with zero file uploads.' }
    ],
    features: [
      { title: '100% In-Browser Privacy', desc: 'Your confidential documents never touch any cloud server or database.' },
      { title: 'Custom File Ordering', desc: 'Easily reorder, add, or remove documents before compiling.' },
      { title: 'Preserve Visual Quality', desc: 'Retains original fonts, vector sharpness, and high-resolution images.' },
      { title: 'Zero Limits & No Sign-Up', desc: 'Free forever with no queues, email requirements, or file size paywalls.' }
    ],
    faqs: [
      { q: 'Is merging PDF files on PDFHome completely free?', a: 'Yes, merging PDFs on PDFHome is 100% free with no registration, subscriptions, or hidden limits.' },
      { q: 'Are my uploaded files stored on a server?', a: 'No. PDFHome processes all documents in-memory directly in your web browser. Your files never leave your device.' },
      { q: 'Can I reorder PDF files before merging?', a: 'Yes. You can easily drag and drop file cards to change their order before clicking the Merge button.' },
      { q: 'Can I combine images and PDFs together?', a: 'Yes, you can add images (JPG, PNG) alongside PDF files to compile a single unified document.' },
      { q: 'Will merging PDFs degrade page quality?', a: 'Not at all. PDFHome preserves original vector outlines, fonts, color profiles, and image resolutions without re-encoding.' }
    ],
    relatedTools: ['split-pdf', 'compress-pdf', 'rotate-pdf', 'pdf-to-word']
  },

  'split-pdf': {
    slug: '/split-pdf',
    aliases: ['/split', '#/split', '#/split-pdf'],
    name: 'Split PDF',
    toolId: 'split',
    metaTitle: 'Split PDF Online Free — Extract Pages from PDF | PDFHome',
    metaDescription: 'Extract specific pages or divide multi-page PDF documents into individual files. Fast, free, and private client-side PDF splitter with zero server file storage.',
    h1: 'Split PDF Files & Extract Pages Online',
    intro: 'Easily separate PDF documents into individual pages or extract custom page ranges (e.g. 1-3, 5, 8-10). Ideal for isolating specific chapters, invoices, or sections from large files without uploading documents to remote servers.',
    howTo: [
      { step: 1, title: 'Choose PDF File', desc: 'Drop your PDF document into the designated file area or click to browse.' },
      { step: 2, title: 'Select Split Mode', desc: 'Choose between extracting every page as a separate PDF or entering custom page ranges (e.g. 1-4, 7).' },
      { step: 3, title: 'Extract & Download', desc: 'Click "Split PDF" to instantly generate and download your extracted files directly.' }
    ],
    features: [
      { title: 'Flexible Page Selection', desc: 'Extract individual pages, sequential ranges, or all pages at once.' },
      { title: 'Instant ZIP Packaging', desc: 'Download multiple extracted pages in a convenient, compressed archive.' },
      { title: 'Total Data Confidentiality', desc: 'Sensitive legal and financial records never leave your local browser memory.' },
      { title: 'Lossless Extraction', desc: 'Page elements, embedded fonts, and vector artwork remain pixel-perfect.' }
    ],
    faqs: [
      { q: 'Can I extract only specific pages from a PDF?', a: 'Yes, select the custom range mode and specify exact pages or intervals like "1-3, 5, 8-12".' },
      { q: 'How many pages can I extract at once?', a: 'There are no artificial limits. You can split documents with hundreds of pages smoothly in your browser.' },
      { q: 'Do I need to install any software to split PDFs?', a: 'No, PDFHome works completely online in any modern browser on Windows, Mac, Linux, iOS, and Android.' },
      { q: 'Is my data secure while splitting files?', a: 'Completely. Because PDFHome is client-side, your files are processed locally on your device with zero server storage.' }
    ],
    relatedTools: ['merge-pdf', 'delete-pdf-pages', 'rotate-pdf', 'compress-pdf']
  },

  'compress-pdf': {
    slug: '/compress-pdf',
    aliases: ['/compress', '#/compress', '#/compress-pdf'],
    name: 'Compress PDF',
    toolId: 'compress',
    metaTitle: 'Compress PDF Online Free — Reduce PDF File Size | PDFHome',
    metaDescription: 'Reduce PDF file size quickly without losing visual quality. Free in-browser PDF compressor with smart size-guard protection and zero server uploads.',
    h1: 'Compress PDF Files Online Free',
    intro: 'Shrink large PDF documents for faster email sharing and web uploads. PDFHome optimizes structural streams, duplicate font descriptors, and image compression while actively ensuring file size never inflates.',
    howTo: [
      { step: 1, title: 'Upload PDF Document', desc: 'Select or drop the PDF file you want to compress into the tool workspace.' },
      { step: 2, title: 'Select Compression Level', desc: 'Choose your desired compression strength from Recommended, High, or Extreme modes.' },
      { step: 3, title: 'Download Smaller PDF', desc: 'Review the live file size reduction percentage and save your optimized PDF immediately.' }
    ],
    features: [
      { title: 'Smart Size-Guard', desc: 'Guarantees the compressed output is smaller than the original; never expands files.' },
      { title: 'Balanced Visual Fidelity', desc: 'Optimizes embedded data streams while preserving crisp text readability.' },
      { title: 'Real-Time Reduction Stats', desc: 'See before and after byte measurements and savings percentages live.' },
      { title: 'Private & Serverless', desc: 'Documents remain on your computer throughout the entire optimization process.' }
    ],
    faqs: [
      { q: 'Will compressing a PDF make text blurry?', a: 'No. PDFHome uses vector-aware optimization that preserves font outlines and crisp text rendering.' },
      { q: 'What is Smart Size-Guard?', a: 'Smart Size-Guard prevents accidental file inflation on already-compressed PDFs, guaranteeing only smaller files are saved.' },
      { q: 'How much file size reduction can I expect?', a: 'Typical reduction ranges between 30% and 80% depending on embedded images and metadata streams in the original document.' },
      { q: 'Is there a file size limit for compression?', a: 'Since compression is done locally in your browser memory, you can compress large documents without server timeouts.' }
    ],
    relatedTools: ['merge-pdf', 'pdf-to-word', 'split-pdf', 'pdf-to-jpg']
  },

  'pdf-to-word': {
    slug: '/pdf-to-word',
    aliases: ['/pdf-to-docx', '#/pdf-to-docx', '#/pdf-to-word'],
    name: 'PDF to Word',
    toolId: 'convert-word',
    metaTitle: 'PDF to Word Converter Free — Convert PDF to Editable DOCX | PDFHome',
    metaDescription: 'Convert PDF documents into 100% editable Microsoft Word DOCX files. Preserves tables, columns, headings, and formatting with Adobe Acrobat layout fidelity.',
    h1: 'Convert PDF to Word (DOCX) Online Free',
    intro: 'Transform PDF documents into fully editable Microsoft Word (.docx) files with outstanding layout accuracy. Preserves tables, two-column sidebars, bold headings, bullet lists, divider lines, and embedded photos with fixed table stability.',
    howTo: [
      { step: 1, title: 'Select PDF Document', desc: 'Drop your PDF file into the converter area or click to browse files.' },
      { step: 2, title: 'Instant Layout Analysis', desc: 'The engine parses text clusters, font metrics, columns, and embedded images in memory.' },
      { step: 3, title: 'Download Editable Word DOCX', desc: 'Save your generated Microsoft Word document ready for editing in Word, Google Docs, or LibreOffice.' }
    ],
    features: [
      { title: 'Adobe-Grade Layout Fidelity', desc: 'Accurately reconstructs complex multi-column resumes, reports, and tabular data.' },
      { title: '100% Editable Text & Tables', desc: 'Produces genuine WordprocessingML paragraphs, headings, bullet lists, and tables.' },
      { title: 'Image & Photo Preservation', desc: 'Extracts and scales embedded profile pictures and logos directly into the document.' },
      { title: 'Zero Cloud Storage', desc: 'Your private resumes, contracts, and financial sheets are never uploaded to any cloud server.' }
    ],
    faqs: [
      { q: 'Can I edit the converted Word document in Google Docs or LibreOffice?', a: 'Yes. The generated .docx file is 100% standard OpenXML compliant and opens cleanly in Microsoft Word, Google Docs, and LibreOffice.' },
      { q: 'Does PDF to Word keep my document layout and tables intact?', a: 'Yes. PDFHome uses fixed column grids, cantSplit row rules, and cell padding to ensure tables and columns never collapse or move.' },
      { q: 'Are embedded images and photos extracted?', a: 'Yes. All raster photos and vector graphics are extracted and positioned accurately in their respective columns.' },
      { q: 'Is there any fee or file limit for PDF to Word conversion?', a: 'No, PDFHome is completely free with no restrictions, subscriptions, or watermarks.' }
    ],
    relatedTools: ['word-to-pdf', 'pdf-to-excel', 'pdf-to-powerpoint', 'ocr-pdf']
  },

  'pdf-to-excel': {
    slug: '/pdf-to-excel',
    aliases: ['#/pdf-to-excel'],
    name: 'PDF to Excel',
    toolId: 'convert-excel',
    metaTitle: 'PDF to Excel Converter Free — Extract Tables to XLSX | PDFHome',
    metaDescription: 'Convert PDF tables and tabular data into editable Microsoft Excel XLSX spreadsheets. Free client-side table extraction with zero file uploads.',
    h1: 'Convert PDF to Excel (XLSX) Online Free',
    intro: 'Extract financial tables, accounting statements, and data columns from PDF files directly into structured Microsoft Excel (.xlsx) spreadsheets. Fast, accurate, and completely private.',
    howTo: [
      { step: 1, title: 'Upload PDF with Tables', desc: 'Select or drop your PDF document containing data tables or invoices.' },
      { step: 2, title: 'Automated Table Recognition', desc: 'The converter detects horizontal rows and vertical column boundaries across pages.' },
      { step: 3, title: 'Download Excel Spreadsheet', desc: 'Download your formatted .xlsx spreadsheet ready for analysis and formula computation.' }
    ],
    features: [
      { title: 'Intelligent Column Detection', desc: 'Identifies grid lines, gutters, and whitespace splits to separate numbers accurately.' },
      { title: 'Formula-Ready Data', desc: 'Numbers and dates are cleanly formatted for instant calculation in Excel.' },
      { title: 'Multi-Page Table Support', desc: 'Extracts multi-page invoices and ledger statements into organized sheets.' },
      { title: 'Strict Privacy', desc: 'Financial data never leaves your computer memory.' }
    ],
    faqs: [
      { q: 'Can PDFHome convert scanned receipts or invoices to Excel?', a: 'Yes, tabular columns and numbers are extracted into clean rows and columns in Excel (.xlsx).' },
      { q: 'Will formatting and numbers be preserved in the spreadsheet?', a: 'Yes, numeric cells are properly formatted for calculation and sorting in Microsoft Excel.' },
      { q: 'Can I open the resulting spreadsheet in Google Sheets?', a: 'Yes, the generated .xlsx file is fully compatible with Google Sheets, Apple Numbers, and Excel.' }
    ],
    relatedTools: ['excel-to-pdf', 'pdf-to-word', 'compress-pdf', 'ocr-pdf']
  },

  'pdf-to-powerpoint': {
    slug: '/pdf-to-powerpoint',
    aliases: ['/pdf-to-slides', '#/pdf-to-slides', '#/pdf-to-powerpoint'],
    name: 'PDF to PowerPoint',
    toolId: 'convert-slides',
    metaTitle: 'PDF to PowerPoint Converter Free — Convert PDF to PPTX | PDFHome',
    metaDescription: 'Convert PDF slides and presentations into editable Microsoft PowerPoint PPTX decks. Free, fast, and private in-browser presentation converter.',
    h1: 'Convert PDF to PowerPoint (PPTX) Online Free',
    intro: 'Transform PDF presentations, slide decks, and lecture notes into widescreen Microsoft PowerPoint (.pptx) slide decks. Each PDF page is converted into a high-definition presentation slide ready to present and edit.',
    howTo: [
      { step: 1, title: 'Upload PDF Presentation', desc: 'Select or drop the PDF presentation file you want to convert.' },
      { step: 2, title: 'Slide Generation', desc: 'The tool structures slides in 16:9 widescreen format preserving text and graphics.' },
      { step: 3, title: 'Download PowerPoint PPTX', desc: 'Download your slide deck ready for Microsoft PowerPoint, Google Slides, or Keynote.' }
    ],
    features: [
      { title: '16:9 Widescreen Layout', desc: 'Generates modern widescreen presentation decks matching standard display formats.' },
      { title: 'High-Resolution Visuals', desc: 'Maintains crisp diagrams, vector charts, and background graphics.' },
      { title: 'Compatible with Google Slides', desc: 'Opens smoothly in PowerPoint, Google Slides, and Apple Keynote.' },
      { title: 'Zero Server Storage', desc: 'Client-side processing guarantees your presentation content stays confidential.' }
    ],
    faqs: [
      { q: 'Can I edit the slides in Microsoft PowerPoint after conversion?', a: 'Yes, the output is a standard .pptx file that can be opened and edited in PowerPoint and Google Slides.' },
      { q: 'Does it support landscape and portrait slides?', a: 'Yes, slide dimensions are automatically mapped to maintain optimal visual proportions.' },
      { q: 'Is there a limit on how many slides I can convert?', a: 'No, you can convert full presentation decks without arbitrary slide limits.' }
    ],
    relatedTools: ['pdf-to-word', 'pdf-to-jpg', 'compress-pdf', 'split-pdf']
  },

  'pdf-to-jpg': {
    slug: '/pdf-to-jpg',
    aliases: ['/pdf-to-image', '#/pdf-to-image', '#/pdf-to-jpg'],
    name: 'PDF to JPG',
    toolId: 'pdf-to-image',
    metaTitle: 'PDF to JPG Converter Free — Convert PDF Pages to Images | PDFHome',
    metaDescription: 'Convert PDF pages into high-resolution JPG or PNG images online. Free, secure, client-side PDF to picture converter with ZIP download.',
    h1: 'Convert PDF to JPG Images Online Free',
    intro: 'Render and extract high-resolution JPG or PNG pictures from any PDF document. Download individual pages as clear pictures or save all pages in a single ZIP archive. 100% private in-browser image rendering.',
    howTo: [
      { step: 1, title: 'Select PDF File', desc: 'Choose the PDF document whose pages you want to convert into images.' },
      { step: 2, title: 'Choose Image Format', desc: 'Select JPG or PNG and adjust rendering resolution (DPI).' },
      { step: 3, title: 'Download Images', desc: 'Save single page images or download all rendered pages in a convenient ZIP file.' }
    ],
    features: [
      { title: 'High-DPI Clarity', desc: 'Render sharp, print-quality images up to 300 DPI for crystal clear text.' },
      { title: 'JPG & PNG Options', desc: 'Choose lightweight JPG for photo-heavy pages or lossless PNG for text sharpness.' },
      { title: 'Batch ZIP Download', desc: 'Download all rendered page images simultaneously in one convenient package.' },
      { title: 'Fast Client-Side Render', desc: 'Powered by HTML5 canvas rendering directly on your GPU without server lag.' }
    ],
    faqs: [
      { q: 'What resolution are the extracted JPG images?', a: 'You can choose between standard web resolution (150 DPI) and high-resolution print quality (300 DPI).' },
      { q: 'Can I download all pages at once?', a: 'Yes, click "Download All as ZIP" to get all converted pages in one archive.' },
      { q: 'Are my images uploaded to the internet?', a: 'No, image rendering occurs completely inside your web browser using HTML5 canvas.' }
    ],
    relatedTools: ['jpg-to-pdf', 'compress-pdf', 'split-pdf', 'crop-pdf']
  },

  'jpg-to-pdf': {
    slug: '/jpg-to-pdf',
    aliases: ['/image-to-pdf', '#/image-to-pdf', '#/jpg-to-pdf'],
    name: 'JPG to PDF',
    toolId: 'image-to-pdf',
    metaTitle: 'JPG to PDF Converter Free — Convert Images to PDF Online | PDFHome',
    metaDescription: 'Convert JPG, PNG, and WebP pictures into a clean, uniform PDF document online. Free, fast, and secure client-side image to PDF compiler.',
    h1: 'Convert JPG to PDF Online Free',
    intro: 'Turn your photos, scanned documents, and image files into a single, polished PDF file. Combine multiple JPG, PNG, or WebP images, reorder them, adjust margins, and download your consolidated PDF instantly.',
    howTo: [
      { step: 1, title: 'Upload Image Files', desc: 'Select or drag multiple JPG, PNG, or WebP pictures into the tool.' },
      { step: 2, title: 'Arrange & Configure', desc: 'Drag image cards to set page order. Adjust page orientation (portrait/landscape) and margins.' },
      { step: 3, title: 'Convert & Save PDF', desc: 'Click "Convert to PDF" to generate and download your uniform PDF document.' }
    ],
    features: [
      { title: 'Multiple Format Support', desc: 'Combine JPG, JPEG, PNG, WebP, and BMP images seamlessly.' },
      { title: 'Smart Page Sizing', desc: 'Fit to standard A4, US Letter, or auto-scale to the natural image aspect ratio.' },
      { title: 'Reorder Before Creating', desc: 'Drag-and-drop thumbnail sorting to organize picture order.' },
      { title: 'Zero Cloud Uploads', desc: 'Your private family photos, receipts, and ID documents remain 100% on your device.' }
    ],
    faqs: [
      { q: 'Can I combine multiple pictures into one PDF?', a: 'Yes, you can upload as many pictures as you need and combine them into a single PDF document.' },
      { q: 'Does it support PNG and WebP images as well as JPG?', a: 'Yes, JPG, PNG, WebP, and other standard image formats are fully supported.' },
      { q: 'Can I change the order of images before generating the PDF?', a: 'Yes, simply drag and drop the image thumbnails to reorder them before converting.' }
    ],
    relatedTools: ['pdf-to-jpg', 'merge-pdf', 'compress-pdf', 'rotate-pdf']
  },

  'ocr-pdf': {
    slug: '/ocr-pdf',
    aliases: ['#/ocr-pdf'],
    name: 'OCR PDF',
    toolId: 'ocr-pdf',
    metaTitle: 'OCR PDF Online Free — Convert Scanned PDF to Searchable Text | PDFHome',
    metaDescription: 'Transform scanned image PDFs into searchable, selectable text documents using free client-side optical character recognition (OCR) with zero server uploads.',
    h1: 'OCR PDF — Convert Scanned PDF to Searchable Text',
    intro: 'Unlock text locked inside scanned picture PDFs, book scans, and photo documents. Our optical character recognition (OCR) engine runs directly in your browser, recognizing letters and words to create a pristine PDF where you can search, highlight, and copy text.',
    howTo: [
      { step: 1, title: 'Upload Scanned PDF', desc: 'Select your scanned picture PDF or photo document.' },
      { step: 2, title: 'Run Client-Side OCR', desc: 'The optical character recognition engine analyzes text characters across pages.' },
      { step: 3, title: 'Download Searchable PDF', desc: 'Download your searchable PDF with selectable, copyable text layered cleanly.' }
    ],
    features: [
      { title: 'Searchable & Selectable Text', desc: 'Search keywords, copy paragraphs, and index documents easily.' },
      { title: 'High Recognition Accuracy', desc: 'Recognizes printed text, column layouts, and various typefaces.' },
      { title: '100% Private In-Browser OCR', desc: 'Scanned confidential medical and tax records are never sent to external AI servers.' },
      { title: 'No Subscription Required', desc: 'Free OCR character recognition without quotas or paywalls.' }
    ],
    faqs: [
      { q: 'What does OCR PDF do?', a: 'OCR (Optical Character Recognition) detects letters in scanned picture PDFs and creates a searchable PDF where you can select, copy, and search text.' },
      { q: 'Are my scanned documents uploaded to any remote server?', a: 'No. OCR processing runs in-browser, ensuring complete privacy for confidential scans.' },
      { q: 'Can I copy text from the output PDF?', a: 'Yes, the resulting PDF contains full selectable and copyable text that works in Adobe Reader, Chrome, and any PDF viewer.' }
    ],
    relatedTools: ['pdf-to-word', 'pdf-to-excel', 'compress-pdf', 'rotate-pdf']
  },

  'rotate-pdf': {
    slug: '/rotate-pdf',
    aliases: ['/organize-pdf', '#/organize-pdf', '#/rotate-pdf'],
    name: 'Rotate PDF',
    toolId: 'pages-rotate',
    metaTitle: 'Rotate PDF Pages Online Free — Turn PDF 90, 180, 270 Degrees | PDFHome',
    metaDescription: 'Rotate PDF pages permanently online. Turn individual pages or all pages 90, 180, or 270 degrees clockwise or counter-clockwise. Free and 100% private.',
    h1: 'Rotate PDF Pages Online Free',
    intro: 'Fix upside-down or sideways pages in your PDF documents. Rotate individual pages or all pages at once by 90°, 180°, or 270° clockwise or counter-clockwise. Save your rotated PDF permanently with zero server storage.',
    howTo: [
      { step: 1, title: 'Upload PDF Document', desc: 'Drop your PDF file into the page organizer workspace.' },
      { step: 2, title: 'Rotate Specific or All Pages', desc: 'Click the rotation buttons on individual page thumbnails or use the bulk rotate tools.' },
      { step: 3, title: 'Save & Download', desc: 'Click "Save & Export PDF" to instantly download your properly oriented PDF.' }
    ],
    features: [
      { title: 'Per-Page Rotation', desc: 'Rotate single misoriented pages without affecting the rest of the document.' },
      { title: 'Bulk Rotation', desc: 'Rotate all portrait or landscape pages simultaneously in one click.' },
      { title: 'Permanent Orientation Save', desc: 'Saves standard PDF rotation metadata compatible with all viewers.' },
      { title: 'Fast Visual Thumbnails', desc: 'Instant preview thumbnails let you verify orientation before exporting.' }
    ],
    faqs: [
      { q: 'Will rotating my PDF reduce document quality?', a: 'No, rotation updates the page orientation metadata losslessly without altering image or text quality.' },
      { q: 'Can I rotate only one sideways page?', a: 'Yes, you can click the rotate icon on any specific page thumbnail to turn only that page.' },
      { q: 'Is the rotation permanent when opened in Adobe Reader?', a: 'Yes, the saved PDF writes standard orientation tags recognized by all PDF viewers and printers.' }
    ],
    relatedTools: ['delete-pdf-pages', 'crop-pdf', 'split-pdf', 'merge-pdf']
  },

  'delete-pdf-pages': {
    slug: '/delete-pdf-pages',
    aliases: ['#/delete-pdf-pages'],
    name: 'Delete PDF Pages',
    toolId: 'pages-delete',
    metaTitle: 'Delete PDF Pages Online Free — Remove Pages from PDF | PDFHome',
    metaDescription: 'Delete unwanted or blank pages from any PDF document online. Fast, secure, and free client-side page remover with zero server uploads.',
    h1: 'Delete Pages from PDF Online Free',
    intro: 'Quickly remove blank sheets, duplicate pages, or unwanted sections from any PDF document. View visual page thumbnails, click to select pages for deletion, and download your trimmed document in seconds.',
    howTo: [
      { step: 1, title: 'Upload Your PDF', desc: 'Select or drop your PDF document into the organizer workbench.' },
      { step: 2, title: 'Select Pages to Remove', desc: 'Click the trash icon on any page thumbnail or select multiple pages to delete.' },
      { step: 3, title: 'Export Trimmed PDF', desc: 'Click "Save & Export" to download your cleaned PDF file immediately.' }
    ],
    features: [
      { title: 'Visual Page Previews', desc: 'Clear thumbnail previews allow you to identify and remove unwanted pages with confidence.' },
      { title: 'Undo & Reorder Support', desc: 'Restore accidentally deleted pages before final export.' },
      { title: 'Smaller Output Size', desc: 'Removing unnecessary pages reduces total file size for sharing.' },
      { title: 'Private & In-Browser', desc: 'Confidential documents are modified locally with zero cloud exposure.' }
    ],
    faqs: [
      { q: 'Can I delete multiple pages at once?', a: 'Yes, you can select and delete multiple pages throughout the document before exporting.' },
      { q: 'What happens if I accidentally delete the wrong page?', a: 'You can undo your actions or reload the original file before saving the final PDF.' },
      { q: 'Are my files kept secure?', a: 'Yes. All page editing occurs entirely in your browser without uploading your document anywhere.' }
    ],
    relatedTools: ['rotate-pdf', 'split-pdf', 'merge-pdf', 'crop-pdf']
  },

  'watermark-pdf': {
    slug: '/watermark-pdf',
    aliases: ['#/watermark-pdf'],
    name: 'Watermark PDF',
    toolId: 'pages-watermark',
    metaTitle: 'Watermark PDF Online Free — Add Text & Image Stamps | PDFHome',
    metaDescription: 'Add custom text watermarks or logo stamps to your PDF documents online. Control opacity, rotation, scale, and positioning with zero server file storage.',
    h1: 'Watermark PDF Documents Online Free',
    intro: 'Protect your intellectual property or label sensitive documents with custom text stamps (e.g. "CONFIDENTIAL", "DRAFT", "SAMPLE") or company logo watermarks. Fine-tune opacity, angle, font size, and page placement with live visual preview.',
    howTo: [
      { step: 1, title: 'Choose PDF File', desc: 'Upload the PDF document you want to stamp with a watermark.' },
      { step: 2, title: 'Customize Your Watermark', desc: 'Enter custom text or upload a logo image. Adjust opacity, font, color, rotation, and position.' },
      { step: 3, title: 'Apply & Export', desc: 'Preview your stamped document live and click "Save & Export" to download.' }
    ],
    features: [
      { title: 'Text & Logo Watermarks', desc: 'Stamp both text labels and transparent PNG company logos.' },
      { title: 'Full Opacity & Angle Control', desc: 'Fine-tune transparency from subtle background tint to bold overlay stamps.' },
      { title: 'Exclude Cover Pages', desc: 'Optionally skip title or cover pages when applying watermarks.' },
      { title: 'Live Real-Time Preview', desc: 'See exact watermark placement on your actual document before saving.' }
    ],
    faqs: [
      { q: 'Can I use a custom image logo as a watermark?', a: 'Yes, you can upload transparent PNG or JPG image logos and scale them to your desired size.' },
      { q: 'Can I change the transparency of the watermark?', a: 'Yes, an opacity slider lets you set the watermark to be faint or bold.' },
      { q: 'Can I apply watermarks to only specific pages?', a: 'Yes, you can choose to apply watermarks across all pages or exclude cover pages.' }
    ],
    relatedTools: ['sign-pdf', 'protect-pdf', 'page-numbers', 'crop-pdf']
  },

  'sign-pdf': {
    slug: '/sign-pdf',
    aliases: ['#/sign-pdf'],
    name: 'Sign PDF',
    toolId: 'pages-sign',
    metaTitle: 'Sign PDF Online Free — Draw Electronic & Digital Signatures | PDFHome',
    metaDescription: 'Sign PDF documents online for free. Draw your handwritten signature or upload a transparent signature stamp with precise 9-point grid positioning.',
    h1: 'Sign PDF Documents Online Free',
    intro: 'Add a professional handwritten signature or signature stamp to contracts, invoices, and agreements in seconds. Draw smoothly on our signature canvas or upload a transparent PNG signature, position it with precision, and export your signed PDF with zero cloud storage.',
    howTo: [
      { step: 1, title: 'Upload Document', desc: 'Select or drag the PDF contract or form you need to sign.' },
      { step: 2, title: 'Draw or Upload Signature', desc: 'Draw your signature on the smooth canvas in black or blue ink, or upload a transparent PNG signature.' },
      { step: 3, title: 'Position & Save', desc: 'Place your signature anywhere on the page, adjust size, and click "Save & Export" to download.' }
    ],
    features: [
      { title: 'Smooth Ink Canvas', desc: 'Pressure-sensitive signature drawing pad with blue and black ink options.' },
      { title: 'Transparent Stamp Upload', desc: 'Upload pre-made signature graphics and overlay them cleanly on signature lines.' },
      { title: '9-Point Grid Alignment', desc: 'Snap your signature precisely to standard contract signature boxes.' },
      { title: '100% Private Signing', desc: 'Confidential contracts and personal signatures are never stored on any remote server.' }
    ],
    faqs: [
      { q: 'Is signing a PDF on PDFHome free?', a: 'Yes, signing PDFs is 100% free with no account creation or monthly subscription.' },
      { q: 'Is my digital signature legally binding?', a: 'Electronic signatures placed on documents are widely recognized for commercial and personal agreements in most jurisdictions.' },
      { q: 'Does PDFHome store my signature or documents?', a: 'No. Signatures and documents are processed entirely in your browser memory and are deleted the moment you close the tab.' }
    ],
    relatedTools: ['watermark-pdf', 'protect-pdf', 'pdf-to-word', 'merge-pdf']
  },

  'protect-pdf': {
    slug: '/protect-pdf',
    aliases: ['#/protect-pdf'],
    name: 'Protect PDF',
    toolId: 'pages-protect',
    metaTitle: 'Password Protect PDF Online Free — Encrypt PDF Documents | PDFHome',
    metaDescription: 'Protect confidential PDF files with strong password encryption online. Free in-browser PDF security with zero server uploads.',
    h1: 'Password Protect & Encrypt PDF Online Free',
    intro: 'Secure sensitive PDF reports, contracts, and personal records with robust password encryption. Anyone attempting to open the document must enter your chosen password. All cryptographic processing runs locally on your device.',
    howTo: [
      { step: 1, title: 'Choose PDF to Lock', desc: 'Select or drop your PDF document into the security workbench.' },
      { step: 2, title: 'Enter Secure Password', desc: 'Type and confirm your desired document opening password.' },
      { step: 3, title: 'Encrypt & Download', desc: 'Click "Protect PDF" to download your securely encrypted document immediately.' }
    ],
    features: [
      { title: 'Standard 128-Bit Encryption', desc: 'Universal encryption compatible with all major PDF viewers and mobile devices.' },
      { title: 'Zero Cloud Password Exposure', desc: 'Your password is never transmitted across the network or stored in any database.' },
      { title: 'Prevent Unauthorized Access', desc: 'Stops unauthorized viewing, printing, or extracting of confidential data.' }
    ],
    faqs: [
      { q: 'Can anyone open the PDF without the password?', a: 'No. The document cannot be viewed or printed without entering the correct password.' },
      { q: 'Does PDFHome know my password?', a: 'No. Encryption happens entirely in your local browser runtime. We never see or store your password.' },
      { q: 'Will the encrypted PDF work on mobile devices?', a: 'Yes, standard encrypted PDFs open on iOS, Android, macOS, and Windows with any standard viewer.' }
    ],
    relatedTools: ['watermark-pdf', 'sign-pdf', 'compress-pdf', 'merge-pdf']
  },

  'crop-pdf': {
    slug: '/crop-pdf',
    aliases: ['#/crop-pdf'],
    name: 'Crop PDF Margins',
    toolId: 'pages-crop',
    metaTitle: 'Crop PDF Margins Online Free — Trim PDF Pages | PDFHome',
    metaDescription: 'Crop PDF margins and trim scanner borders online for free. Visual boundary framing with live preview and zero server file storage.',
    h1: 'Crop PDF Margins & Trim Borders Online',
    intro: 'Visually trim margins, cut black scanner edges, and adjust page boundaries for clean printing and reading on tablets and e-readers. Preview your crop box live and apply changes across all pages.',
    howTo: [
      { step: 1, title: 'Upload PDF', desc: 'Select the PDF file with borders or margins you want to crop.' },
      { step: 2, title: 'Adjust Crop Box', desc: 'Drag the visual crop boundary box or enter precise margin trimming values.' },
      { step: 3, title: 'Save Cropped PDF', desc: 'Apply the crop to your document and download the trimmed PDF.' }
    ],
    features: [
      { title: 'Visual Boundary Box', desc: 'Interactive handles allow intuitive dragging to frame content precisely.' },
      { title: 'Trim Scanner Edges', desc: 'Eliminate black scanner streaks and unwanted printer margins effortlessly.' },
      { title: 'Apply to All Pages', desc: 'One-click application across the entire document.' }
    ],
    faqs: [
      { q: 'Can I crop all pages uniformly?', a: 'Yes, you can set margin trim values and apply them to all pages in the document simultaneously.' },
      { q: 'Does cropping reduce PDF file size?', a: 'Cropping adjusts visible viewport bounds without degrading content resolution.' }
    ],
    relatedTools: ['rotate-pdf', 'delete-pdf-pages', 'compress-pdf', 'pdf-to-jpg']
  },

  'page-numbers': {
    slug: '/page-numbers',
    aliases: ['#/page-numbers'],
    name: 'Page Numbers',
    toolId: 'pages-numbers',
    metaTitle: 'Add Page Numbers to PDF Online Free — Bates Numbering | PDFHome',
    metaDescription: 'Insert clean page numbers and headers or footers into PDF documents online. Choose custom formats (Page X of Y), positions, and exclude covers.',
    h1: 'Add Page Numbers to PDF Online Free',
    intro: 'Insert clear, professional page numbering into multi-page PDF documents. Choose top or bottom positioning, left/center/right alignment, custom formats (e.g. "Page 1 of 10"), and exclude cover pages with ease.',
    howTo: [
      { step: 1, title: 'Upload PDF Document', desc: 'Choose the PDF file that requires page numbers.' },
      { step: 2, title: 'Configure Numbering Style', desc: 'Select header or footer placement, alignment, numbering format, and starting page number.' },
      { step: 3, title: 'Export Numbered PDF', desc: 'Save and download your newly numbered PDF document immediately.' }
    ],
    features: [
      { title: 'Flexible Number Formats', desc: 'Supports "1", "Page 1", "Page 1 of 10", and custom prefixes.' },
      { title: 'Cover Page Exclusion', desc: 'Start numbering from page 2 to keep title and cover sheets clean.' },
      { title: '6 Anchor Positions', desc: 'Place numbers at top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right.' }
    ],
    faqs: [
      { q: 'Can I skip the first page when adding page numbers?', a: 'Yes, check "Exclude First Page" to leave cover pages unnumbered.' },
      { q: 'Can I change the font size and color of page numbers?', a: 'Yes, you can customize typography, size, and ink color to match your document.' }
    ],
    relatedTools: ['watermark-pdf', 'rotate-pdf', 'merge-pdf', 'sign-pdf']
  },

  'word-to-pdf': {
    slug: '/word-to-pdf',
    aliases: ['/docx-to-pdf', '#/word-to-pdf', '#/docx-to-pdf'],
    name: 'Word to PDF',
    toolId: 'convert-word',
    metaTitle: 'Word to PDF Converter Free — Convert DOCX to PDF Online | PDFHome',
    metaDescription: 'Convert Microsoft Word (.docx) documents to PDF online for free. Fast, accurate, and 100% private in-browser conversion with layout preservation and zero server uploads.',
    h1: 'Word to PDF Converter Free Online',
    intro: 'Convert DOCX Word documents into professional, high-resolution PDF files right in your browser. Preserve fonts, formatting, margins, and layouts with zero server uploads and complete privacy.',
    howTo: [
      { step: 1, title: 'Upload Word Document', desc: 'Select or drag and drop your .docx file into the converter workbench.' },
      { step: 2, title: 'Review & Process', desc: 'Our client-side engine parses and renders your document structure in memory.' },
      { step: 3, title: 'Download PDF', desc: 'Click to export and download your clean, print-ready PDF file instantly.' }
    ],
    features: [
      { title: '100% In-Browser Privacy', desc: 'Confidential business contracts and personal documents never leave your device.' },
      { title: 'Precise Layout Rendering', desc: 'Preserves tables, headings, lists, font styling, and margin alignment.' },
      { title: 'No Installation or Sign-Up', desc: 'Free forever with no queues, email registration, or file size limits.' }
    ],
    faqs: [
      { q: 'Can I convert DOCX files without Microsoft Word installed?', a: 'Yes. PDFHome converts Word documents directly inside your web browser without requiring Office.' },
      { q: 'Are my confidential Word documents uploaded to any server?', a: 'No. All processing happens entirely in your local browser session with zero server retention.' },
      { q: 'Does converting Word to PDF add any watermark?', a: 'No, PDFHome never adds watermarks or branding to your converted PDF documents.' }
    ],
    relatedTools: ['pdf-to-word', 'merge-pdf', 'compress-pdf', 'sign-pdf']
  },

  'excel-to-pdf': {
    slug: '/excel-to-pdf',
    aliases: ['#/excel-to-pdf'],
    name: 'Excel to PDF',
    toolId: 'convert-excel',
    metaTitle: 'Excel to PDF Converter Free — Convert XLSX to PDF Online | PDFHome',
    metaDescription: 'Convert Microsoft Excel (.xlsx) spreadsheets into formatted PDF tables online for free. Private client-side conversion with zero file uploads.',
    h1: 'Excel to PDF Converter Free Online',
    intro: 'Convert Excel workbooks and sheets (.xlsx) into clean, printable PDF tables. Retain column structures, numbers, and grid alignment with instant client-side processing.',
    howTo: [
      { step: 1, title: 'Upload Excel Workbook', desc: 'Drop your .xlsx spreadsheet file into the converter area.' },
      { step: 2, title: 'Table Formatting', desc: 'Our in-browser parser structures spreadsheet cells and rows into paginated tables.' },
      { step: 3, title: 'Export PDF', desc: 'Download your formatted PDF tables ready for distribution or printing.' }
    ],
    features: [
      { title: 'Instant Local Rendering', desc: 'Fast client-side spreadsheet parsing with no server queues.' },
      { title: 'Zero Cloud Data Storage', desc: 'Sensitive financial sheets and numbers never leave your local computer.' },
      { title: 'Clean Table Pagination', desc: 'Structures rows and columns into neatly styled, readable PDF pages.' }
    ],
    faqs: [
      { q: 'Can I convert multi-sheet Excel files to PDF?', a: 'Yes, your spreadsheet sheets are converted into clean, sequential PDF pages.' },
      { q: 'Are my financial spreadsheets secure?', a: 'Completely. All data processing is client-side in your browser; nothing is uploaded.' }
    ],
    relatedTools: ['pdf-to-excel', 'merge-pdf', 'compress-pdf', 'pdf-to-word']
  }
};

// Attach multilingual search queries to each tool definition
for (const [toolKey, group] of Object.entries(MULTILINGUAL_QUERIES)) {
  if (TOOL_SEO_DATA[toolKey] && group.terms) {
    TOOL_SEO_DATA[toolKey].multilingual = group.terms;
    
    // Add international multilingual query FAQ
    if (TOOL_SEO_DATA[toolKey].faqs) {
      const topTerms = group.terms.slice(0, 4).map(t => `"${t.term}" (${t.lang})`).join(', ');
      TOOL_SEO_DATA[toolKey].faqs.push({
        q: `Can I use this tool if I am searching in Spanish, French, German, or other languages?`,
        a: `Yes! PDFHome is designed for international users worldwide. You can search and access this tool via common global queries such as ${topTerms}. All PDF processing runs locally in your browser with complete multi-language document support.`
      });
    }
  }
}

/**
 * Helper to retrieve SEO metadata by key or slug.
 */
export function getSeoMetadata(keyOrSlug) {
  if (!keyOrSlug) return null;
  const clean = keyOrSlug.replace(/^\//, '').replace(/^#\//, '');
  if (TOOL_SEO_DATA[clean]) return TOOL_SEO_DATA[clean];
  return Object.values(TOOL_SEO_DATA).find(t => t.slug === `/${clean}` || (t.aliases && t.aliases.includes(`/${clean}`))) || null;
}
