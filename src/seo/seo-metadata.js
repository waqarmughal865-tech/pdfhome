/**
 * Comprehensive SEO Metadata Registry for PDFHome (https://pdfhome.site)
 * Contains high-intent keywords, titles, meta descriptions, H1 headings,
 * step-by-step How-To instructions, FAQs, and related internal links.
 */

export const DOMAIN = 'https://pdfhome.site';

export const TOOL_SEO_DATA = {
  'merge-pdf': {
    slug: '/merge-pdf',
    aliases: ['/merge', '#/merge', '#/merge-pdf'],
    name: 'Merge PDF',
    toolId: 'merge',
    metaTitle: 'Merge PDF Online Free — Combine Multiple PDF Files | PDFHome',
    metaDescription: 'Combine multiple PDF files into one document in seconds. 100% free, private in-browser PDF merger with custom drag-and-drop page ordering and zero server uploads.',
    h1: 'Merge PDF Files Online Free',
    intro: 'Combine multiple PDF files, documents, and images into a single unified PDF in seconds. Whether you are assembling a report from separate chapters, combining scanned receipts, or merging contracts, PDFHome handles it entirely in your browser. Drag and drop files to arrange them in your preferred reading order, preview each document, and download the merged result instantly. All processing runs locally — your documents never leave your device.',
    howTo: [
      { step: 1, title: 'Upload PDF Files', desc: 'Select or drag and drop two or more PDF files from your device into the upload box.' },
      { step: 2, title: 'Arrange Document Order', desc: 'Drag the file cards up or down to set the exact sequence you want them to appear in the combined document.' },
      { step: 3, title: 'Merge & Download', desc: 'Click "Merge PDF" to generate and download your combined document instantly with zero file uploads.' }
    ],
    features: [
      { title: 'In-Browser Privacy', desc: 'Your confidential documents never touch any cloud server or database. Document files never leave your browser; ads use cookies per our privacy policy.' },
      { title: 'Custom File Ordering', desc: 'Easily reorder, add, or remove documents before compiling.' },
      { title: 'Preserve Visual Quality', desc: 'Retains original fonts, vector sharpness, and high-resolution images.' },
      { title: 'Zero Limits & No Sign-Up', desc: 'Free forever with no queues, email requirements, or file size paywalls.' }
    ],
    faqs: [
      { q: 'Is merging PDF files on PDFHome completely free?', a: 'Yes, merging PDFs on PDFHome is 100% free with no registration, subscriptions, watermarks, or hidden limits. You can merge as many files as you need, as often as you need, without creating an account.' },
      { q: 'Are my files uploaded to a server when I merge them?', a: 'No. PDFHome processes all documents entirely in your browser memory using client-side technology. Your files never leave your device, are never transmitted over the network, and are never stored on any server — safe for confidential contracts and financial records.' },
      { q: 'Can I reorder PDF files before merging?', a: 'Yes. After adding your files, drag and drop the file cards up or down to arrange them in exactly the order you want. You can also remove individual files from the queue before merging.' },
      { q: 'Can I combine images and PDFs together?', a: 'Yes. PDFHome accepts PDF files and images (JPG, PNG, WebP). Images are automatically converted to PDF pages and merged into the final document, so mixed collections become one unified file.' },
      { q: 'Will merging PDFs reduce quality or change formatting?', a: 'No. PDFHome preserves original vector graphics, embedded fonts, color profiles, and image resolutions. Pages are combined without re-encoding, so the merged document looks identical to the sources.' },
      { q: 'How many PDFs can I merge at once?', a: 'There is no artificial limit. You can queue dozens of files per session — the only practical constraint is your device memory, since all processing happens locally in your browser.' },
      { q: 'Can I merge password-protected PDFs?', a: 'Password-protected PDFs must be unlocked first. If you know the password, remove it with a PDF unlocker, then merge the unlocked files here.' },
      { q: 'What happens to bookmarks and links in merged PDFs?', a: 'Page content, fonts, and images are fully preserved. Interactive elements like bookmarks or form fields may not carry over, so verify the output if your workflow depends on them.' }
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
    intro: 'Separate PDF documents into individual pages or extract custom page ranges with precision. Perfect for pulling a single invoice from a monthly statement, isolating chapters from an ebook, or dividing a large report into shareable sections. Choose thumbnails visually or type exact ranges like 1-3, 5, 8-10. Extracted pages download individually or as a convenient ZIP archive — all processed locally in your browser with zero uploads.',
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
      { q: 'Can I extract only specific pages from a PDF?', a: 'Yes. Use custom range mode and type exact pages or intervals like "1-3, 5, 8-12". You can also click thumbnails directly, or Shift-click to select a continuous range of pages visually.' },
      { q: 'How many pages can I extract at once?', a: 'There are no artificial limits. You can split documents with hundreds of pages smoothly, since everything runs locally in your browser memory rather than on a remote server.' },
      { q: 'Do I need to install any software to split PDFs?', a: 'No. PDFHome works completely in any modern browser on Windows, Mac, Linux, iOS, and Android. Nothing to download, install, or update.' },
      { q: 'Is my data secure while splitting files?', a: 'Completely. PDFHome is 100% client-side — your files are processed locally on your device with zero server uploads or storage. Even sensitive legal and financial documents are safe.' },
      { q: 'What format do the extracted files download in?', a: 'Each extracted selection downloads as a standard PDF file. If you extract multiple pages or ranges at once, they are packaged into a single ZIP archive for one convenient download.' },
      { q: 'Will the extracted pages keep their original quality?', a: 'Yes. Extraction is lossless — fonts, vector graphics, images, and layout are preserved exactly as they appeared in the source document.' },
      { q: 'Can I split a password-protected PDF?', a: 'The PDF must be unlocked before splitting. Remove the password first if you know it, then upload the unlocked file.' }
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
    intro: 'Shrink large PDF documents for faster email sharing, web uploads, and storage savings. PDFs often balloon in size from unoptimized images, duplicate fonts, and metadata — PDFHome recompresses these elements to dramatically reduce file size. Choose from three modes: Lossless (keeps everything selectable and searchable), Balanced (best size-to-quality ratio), or Strong (maximum savings). A live before-and-after comparison shows exactly how much space you saved, and Smart Size-Guard guarantees the output is never larger than the original.',
    howTo: [
      { step: 1, title: 'Upload PDF Document', desc: 'Select or drop the PDF file you want to compress into the tool workspace.' },
      { step: 2, title: 'Select Compression Level', desc: 'Choose your compression level: Lossless, Balanced (Recommended), or Strong (Maximum Savings).' },
      { step: 3, title: 'Download Smaller PDF', desc: 'Review the live file size reduction percentage and save your optimized PDF immediately.' }
    ],
    features: [
      { title: 'Smart Size-Guard', desc: 'Guarantees the compressed output is smaller than the original; never expands files.' },
      { title: 'Balanced Visual Fidelity', desc: 'Optimizes embedded data streams while preserving crisp text readability.' },
      { title: 'Real-Time Reduction Stats', desc: 'See before and after byte measurements and savings percentages live.' },
      { title: 'Private & Serverless', desc: 'Documents remain on your computer throughout the entire optimization process.' }
    ],
    faqs: [
      { q: 'Will compressing a PDF make text blurry?', a: 'Lossless mode preserves vector text so it stays crisp, selectable, and searchable — ideal for documents you still need to edit or search. Balanced and Strong modes recompress page images for maximum size reduction; text remains readable but may not be selectable in those outputs.' },
      { q: 'What is Smart Size-Guard?', a: 'Smart Size-Guard compares the compressed output against your original file and guarantees you only ever download a smaller file. If compression would not meaningfully reduce the size (common with already-optimized PDFs), it tells you instead of producing a larger file.' },
      { q: 'How much file size reduction can I expect?', a: 'Typical reduction ranges between 30% and 80% depending on the document. Scanned PDFs and files with large embedded photos compress the most, while text-only documents with vector content see smaller gains since they are already efficient.' },
      { q: 'Is there a file size limit for compression?', a: 'Since compression runs locally in your browser memory, there are no server upload limits or timeouts. Very large documents (hundreds of megabytes) work fine as long as your device has sufficient available memory.' },
      { q: 'Which compression mode should I choose?', a: 'Use Lossless when you need to keep text selectable and searchable, such as contracts or reports you will edit later. Use Balanced for everyday sharing — it gives the best size-to-quality tradeoff. Use Strong when minimizing file size matters most, like email attachments with strict limits.' },
      { q: 'Does compression remove passwords or restrictions?', a: 'No. Compression preserves the document structure including any password protection. You need to unlock a protected PDF before compressing it.' },
      { q: 'Is my document safe during compression?', a: 'Yes. The entire process happens in your browser — your file is never uploaded to any server, making it safe for confidential business and personal documents.' }
    ],
    relatedTools: ['merge-pdf', 'pdf-to-word', 'split-pdf', 'pdf-to-jpg']
  },

  'pdf-to-word': {
    slug: '/pdf-to-word',
    aliases: ['/pdf-to-docx', '#/pdf-to-docx', '#/pdf-to-word'],
    name: 'PDF to Word',
    toolId: 'convert-word',
    metaTitle: 'PDF to Word Converter Free — Convert PDF to Editable DOCX | PDFHome',
    metaDescription: 'Convert PDF documents into editable Microsoft Word DOCX files. Preserves tables, columns, headings, and formatting through best-effort structural reconstruction.',
    h1: 'Convert PDF to Word (DOCX) Online Free',
    intro: 'Transform PDF documents into fully editable Microsoft Word (.docx) files you can revise, reformat, and reuse. Whether you received a PDF contract that needs edits, want to repurpose a report, or need to extract content into a new document, PDFHome reconstructs tables, multi-column layouts, headings, bullet lists, and embedded images into a clean Word file. The conversion runs entirely in your browser — your documents are never uploaded to a server.',
    howTo: [
      { step: 1, title: 'Select PDF Document', desc: 'Drop your PDF file into the converter area or click to browse files.' },
      { step: 2, title: 'Instant Layout Analysis', desc: 'The engine parses text clusters, font metrics, columns, and embedded images in memory.' },
      { step: 3, title: 'Download Editable Word DOCX', desc: 'Save your generated Microsoft Word document ready for editing in Word, Google Docs, or LibreOffice.' }
    ],
    features: [
      { title: 'Best-Effort Layout Reconstruction', desc: 'Reconstructs multi-column resumes, reports, and tabular data on a best-effort basis; complex documents may need manual cleanup.' },
      { title: '100% Editable Text & Tables', desc: 'Produces genuine WordprocessingML paragraphs, headings, bullet lists, and tables.' },
      { title: 'Image & Photo Preservation', desc: 'Extracts and scales embedded profile pictures and logos directly into the document.' },
      { title: 'Zero Cloud Storage', desc: 'Your private resumes, contracts, and financial sheets are never uploaded to any cloud server.' }
    ],
    faqs: [
      { q: 'Can I edit the converted Word document in Google Docs or LibreOffice?', a: 'Yes. The generated .docx file is 100% standard OpenXML compliant and opens cleanly in Microsoft Word, Google Docs, LibreOffice, and Apple Pages. You can edit text, restyle headings, and resize tables in any of them.' },
      { q: 'Does PDF to Word keep my document layout and tables intact?', a: 'PDFHome reconstructs document structure on a best-effort basis, including tables, two-column layouts, headings, bullet lists, and divider lines. Complex or unusual layouts may need minor touch-ups after conversion, but most standard documents convert cleanly.' },
      { q: 'Are embedded images and photos extracted?', a: 'Yes. All raster photos and vector graphics are extracted from the PDF and placed in the Word document at their original positions and sizes.' },
      { q: 'Is there any fee or file limit for PDF to Word conversion?', a: 'No. PDFHome is completely free with no subscriptions, watermarks, page limits, or file-count restrictions.' },
      { q: 'What about scanned PDFs or image-only documents?', a: 'Scanned PDFs contain pictures of text rather than real text. For those, use our OCR tool first to recognize the text, then convert the searchable result to Word.' },
      { q: 'Is my document private during conversion?', a: 'Absolutely. Conversion happens entirely in your browser — the PDF never leaves your device, so confidential documents stay confidential.' }
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
    intro: 'Extract financial tables, accounting statements, invoices, and data columns from PDF files directly into structured Microsoft Excel (.xlsx) spreadsheets. Instead of retyping numbers by hand, PDFHome detects table structures and converts them into real spreadsheet cells you can sort, filter, and calculate with. Perfect for accountants, analysts, and anyone working with PDF reports. The entire extraction runs in your browser — your financial data never leaves your device.',
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
      { q: 'Can PDFHome convert scanned receipts or invoices to Excel?', a: 'Scanned receipts are images of text, so they need OCR first. Run the scan through our OCR tool to recognize the text, then convert the searchable PDF to Excel. Native digital PDFs with real text tables convert directly.' },
      { q: 'Will formatting and numbers be preserved in the spreadsheet?', a: 'Yes. Table structures become real spreadsheet rows and columns, and numeric cells are properly typed for calculations, sorting, and formulas in Microsoft Excel. Merged or complex table layouts may need minor cleanup afterward.' },
      { q: 'Can I open the resulting spreadsheet in Google Sheets?', a: 'Yes. The generated .xlsx file is a standard spreadsheet that opens in Google Sheets, Apple Numbers, LibreOffice Calc, and Microsoft Excel with full editing capability.' },
      { q: 'Is my financial data safe during conversion?', a: 'Completely. The extraction runs entirely in your browser — bank statements, invoices, and accounting data are never uploaded to any server.' },
      { q: 'Can it handle multi-page tables?', a: 'Yes. Tables spanning multiple pages are extracted and combined into the spreadsheet, preserving row order across page breaks.' }
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
    intro: 'Transform PDF presentations, slide decks, lecture notes, and reports into editable Microsoft PowerPoint (.pptx) slide decks. Each PDF page becomes a presentation slide you can rearrange, restyle, and present. Ideal for repurposing PDF handouts into talks, or recovering an editable deck from a flattened PDF. Conversion happens entirely in your browser, keeping your content private.',
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
      { q: 'Can I edit the slides in Microsoft PowerPoint after conversion?', a: 'Yes. The output is a standard .pptx file that opens in PowerPoint, Google Slides, Keynote, and LibreOffice Impress. You can edit text, move elements, and apply new themes to the converted slides.' },
      { q: 'Does it support landscape and portrait slides?', a: 'Yes. Slide dimensions are detected from the source PDF and mapped to maintain correct proportions, whether your document is landscape, portrait, or mixed.' },
      { q: 'Is there a limit on how many slides I can convert?', a: 'No. You can convert full presentation decks of any length without arbitrary slide limits, since processing happens locally in your browser.' },
      { q: 'Will text stay editable or become images?', a: 'Text is converted to editable text boxes wherever the PDF contains real text. Pages that are scanned images become image slides — run those through OCR first if you need editable text.' }
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
    intro: 'Turn any PDF page into a high-resolution JPG or PNG image. Useful for sharing a single page on social media, inserting a document excerpt into a presentation, creating thumbnails, or archiving pages as pictures. Choose your quality level, download individual pages, or grab every page at once as a ZIP archive. Rendering happens entirely in your browser — nothing is uploaded.',
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
      { q: 'What resolution are the extracted JPG images?', a: 'You can choose between standard web resolution (150 DPI), which is ideal for screen sharing and social media, and high-resolution print quality (300 DPI) for crisp printed output and detailed archival.' },
      { q: 'Can I download all pages at once?', a: 'Yes. Click "Download All as ZIP" to package every converted page into a single archive, or download individual pages one by one if you only need specific sheets.' },
      { q: 'Are my images uploaded to the internet?', a: 'No. Page rendering happens completely inside your web browser using HTML5 canvas technology. Your documents never leave your device.' },
      { q: 'Can I choose PNG instead of JPG?', a: 'Yes. PNG is available for pages where you need lossless quality, such as diagrams, screenshots, or documents with sharp text edges.' }
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
    intro: 'Turn your photos, scanned documents, screenshots, and image files into a single polished PDF. Combine multiple JPG, PNG, or WebP images, drag to reorder them, adjust page size and margins, and download a consolidated PDF instantly. Perfect for creating a PDF from phone photos of documents, compiling an image portfolio, or archiving pictures in a universally readable format. Everything runs locally in your browser.',
    howTo: [
      { step: 1, title: 'Upload Image Files', desc: 'Select or drag multiple JPG, PNG, or WebP pictures into the tool.' },
      { step: 2, title: 'Arrange & Configure', desc: 'Drag image cards to set page order. Adjust page orientation (portrait/landscape) and margins.' },
      { step: 3, title: 'Convert & Save PDF', desc: 'Click "Convert to PDF" to generate and download your uniform PDF document.' }
    ],
    features: [
      { title: 'Multiple Format Support', desc: 'Combine JPG, JPEG, PNG, WebP, and BMP images seamlessly.' },
      { title: 'Smart Page Sizing', desc: 'Fit to standard A4, US Letter, or auto-scale to the natural image aspect ratio.' },
      { title: 'Reorder Before Creating', desc: 'Drag-and-drop thumbnail sorting to organize picture order.' },
      { title: 'Zero Cloud Uploads', desc: 'Your private family photos, receipts, and ID documents never leave your browser. Ads use cookies per our privacy policy.' }
    ],
    faqs: [
      { q: 'Can I combine multiple pictures into one PDF?', a: 'Yes. Upload as many pictures as you need and combine them into a single PDF document. Each image becomes its own page, and you control the order, page size, and margins.' },
      { q: 'Does it support PNG and WebP images as well as JPG?', a: 'Yes. JPG, PNG, WebP, and other standard image formats are fully supported and converted into high-quality PDF pages.' },
      { q: 'Can I change the order of images before generating the PDF?', a: 'Yes. Drag and drop the image thumbnails to reorder them however you like before converting — the PDF pages will follow your arrangement.' },
      { q: 'Will my photos lose quality in the PDF?', a: 'No. Images are embedded at their original resolution, so your photos stay sharp. The PDF simply wraps each image in a standard page.' }
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
    intro: 'Unlock text locked inside scanned PDFs, book scans, photographed documents, and image-only files. Optical Character Recognition (OCR) analyzes each page, recognizes letters and words, and produces a searchable PDF where you can find, highlight, and copy text. The recognition engine runs directly in your browser via Web Workers — your scanned documents are never uploaded anywhere, keeping private scans completely confidential.',
    howTo: [
      { step: 1, title: 'Upload Scanned PDF', desc: 'Select your scanned picture PDF or photo document.' },
      { step: 2, title: 'Run Client-Side OCR', desc: 'The optical character recognition engine analyzes text characters across pages.' },
      { step: 3, title: 'Download Searchable PDF', desc: 'Download your searchable PDF with selectable, copyable text layered cleanly.' }
    ],
    features: [
      { title: 'Searchable & Selectable Text', desc: 'Search keywords, copy paragraphs, and index documents easily.' },
      { title: 'High Recognition Accuracy', desc: 'Recognizes printed text, column layouts, and various typefaces.' },
      { title: 'Private In-Browser OCR', desc: 'Scanned confidential medical and tax records are never sent to external AI servers.' },
      { title: 'No Subscription Required', desc: 'Free OCR character recognition without quotas or paywalls.' }
    ],
    faqs: [
      { q: 'What does OCR PDF do?', a: 'OCR (Optical Character Recognition) detects letters and words in scanned or photographed PDFs and creates a searchable PDF with an invisible text layer. You can then select, copy, and search text that was previously locked inside images.' },
      { q: 'Are my scanned documents uploaded to any remote server?', a: 'No. The OCR engine runs entirely in your browser using Web Workers. Your scans never leave your device, ensuring complete privacy for confidential documents like medical records or legal filings.' },
      { q: 'Can I copy text from the output PDF?', a: 'Yes. The resulting PDF contains a full text layer with selectable, copyable, searchable text that works in Adobe Reader, Chrome, and any standard PDF viewer.' },
      { q: 'How accurate is the text recognition?', a: 'Accuracy is excellent for clean, high-resolution scans with standard fonts. Handwriting, decorative fonts, very low-resolution images, or skewed pages may produce some errors — for best results, use straight, well-lit scans at 300 DPI or higher.' },
      { q: 'Which languages does OCR support?', a: 'The engine supports English and many other Latin-script languages. Recognition quality is best for printed text in common fonts.' }
    ],
    relatedTools: ['pdf-to-word', 'pdf-to-excel', 'compress-pdf', 'rotate-pdf']
  },

  'rotate-pdf': {
    slug: '/rotate-pdf',
    aliases: ['/organize-pdf', '#/organize-pdf', '#/rotate-pdf'],
    name: 'Rotate PDF',
    toolId: 'pages-rotate',
    metaTitle: 'Rotate PDF Pages Online Free — Turn PDF 90, 180, 270 Degrees | PDFHome',
    metaDescription: 'Rotate PDF pages permanently online. Turn individual pages or all pages 90, 180, or 270 degrees clockwise or counter-clockwise. Free. Document files never leave your browser.',
    h1: 'Rotate PDF Pages Online Free',
    intro: 'Fix upside-down or sideways pages in your PDF documents. Scanned documents often come out rotated — select individual pages or rotate the entire document by 90°, 180°, or 270° with visual thumbnails showing every page. Save the corrected PDF permanently. Rotation is lossless and runs entirely in your browser.',
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
      { q: 'Will rotating my PDF reduce document quality?', a: 'No. Rotation updates the page orientation metadata losslessly — text, images, and vectors are untouched, so quality is identical to the original.' },
      { q: 'Can I rotate only one sideways page?', a: 'Yes. Click the rotate control on any specific page thumbnail to turn just that page, leaving the rest of the document unchanged.' },
      { q: 'Is the rotation permanent when opened in Adobe Reader?', a: 'Yes. The saved PDF writes standard orientation tags recognized by Adobe Reader, Chrome, Preview, mobile viewers, and printers.' },
      { q: 'Can I rotate scanned documents?', a: 'Yes. This is one of the most common uses — fixing pages that were scanned sideways or upside-down. Thumbnails let you verify each page before saving.' }
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
    intro: 'Remove blank pages, duplicates, or unwanted sections from any PDF document. Visual thumbnails show every page so you can spot exactly what to cut — click pages to mark them for deletion, review your selection, and download a clean trimmed document in seconds. Ideal for cleaning up scanned files with blank backsides or removing draft pages before sharing. All processing stays in your browser.',
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
      { q: 'Can I delete multiple pages at once?', a: 'Yes. Select as many pages as you want throughout the document — click individual thumbnails or use range selection — then delete them all in one export.' },
      { q: 'What happens if I accidentally delete the wrong page?', a: 'Nothing is final until you download. You can undo selections, deselect pages, or reload the original file and start over before saving.' },
      { q: 'Are my files kept secure?', a: 'Yes. All page editing happens entirely in your browser memory without uploading your document to any server.' },
      { q: 'Does deleting pages affect the remaining content?', a: 'No. Kept pages retain their original fonts, images, and layout exactly. Only the pages you marked are removed.' }
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
    intro: 'Protect your intellectual property and label sensitive documents with custom watermarks. Stamp text like "CONFIDENTIAL", "DRAFT", or "SAMPLE" across pages, or overlay your company logo as a translucent image mark. Fine-tune opacity, rotation angle, font size, color, and exact page placement with a live visual preview before exporting. Watermarking runs entirely in your browser — your documents stay private.',
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
      { q: 'Can I use a custom image logo as a watermark?', a: 'Yes. Upload a transparent PNG or JPG logo, scale it to your desired size, adjust its opacity, and position it precisely on the page with rotation control.' },
      { q: 'Can I change the transparency of the watermark?', a: 'Yes. An opacity slider lets you make the watermark faint enough to read through or bold enough to stand out, with a live preview as you adjust.' },
      { q: 'Can I apply watermarks to only specific pages?', a: 'Yes. Apply the watermark across all pages, or exclude specific pages like the cover sheet, directly from the page selection controls.' },
      { q: 'Can watermarks be removed after applying?', a: 'Once exported, the watermark becomes part of the PDF pages. Keep your original file if you may need an unmarked version later.' }
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
    intro: 'Sign contracts, invoices, offer letters, and agreements electronically in seconds. Draw your handwritten signature smoothly with mouse or touchscreen, upload a transparent PNG of your existing signature, or type a styled signature stamp. Position it precisely on any page with size and transparency controls, then export a signed PDF. Your signature is created and applied entirely in your browser — it is never uploaded or stored.',
    howTo: [
      { step: 1, title: 'Upload Document', desc: 'Select or drag the PDF contract or form you need to sign.' },
      { step: 2, title: 'Draw or Upload Signature', desc: 'Draw your signature on the smooth canvas in black or blue ink, or upload a transparent PNG signature.' },
      { step: 3, title: 'Position & Save', desc: 'Place your signature anywhere on the page, adjust size, and click "Save & Export" to download.' }
    ],
    features: [
      { title: 'Smooth Ink Canvas', desc: 'Pressure-sensitive signature drawing pad with blue and black ink options.' },
      { title: 'Transparent Stamp Upload', desc: 'Upload pre-made signature graphics and overlay them cleanly on signature lines.' },
      { title: '9-Point Grid Alignment', desc: 'Snap your signature precisely to standard contract signature boxes.' },
      { title: 'Private Signing', desc: 'Confidential contracts and personal signatures are never stored on any remote server.' }
    ],
    faqs: [
      { q: 'Is signing a PDF on PDFHome free?', a: 'Yes. Signing PDFs is 100% free with no account creation, subscriptions, or limits on how many documents you can sign.' },
      { q: 'Is my digital signature legally binding?', a: 'Electronic signatures are widely recognized for commercial and personal agreements in most jurisdictions, including under laws like the ESIGN Act (US) and eIDAS (EU). For high-stakes contracts, confirm requirements with your legal counsel.' },
      { q: 'Does PDFHome store my signature or documents?', a: 'No. Signatures and documents are processed entirely in your browser memory and vanish the moment you close the tab. Nothing is retained on any server.' },
      { q: 'Can I place my signature on a specific spot?', a: 'Yes. Drag the signature to any position on any page, resize it, and adjust transparency before exporting the final signed document.' }
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
    intro: 'Secure sensitive PDF reports, contracts, medical records, and personal files with strong password encryption. Set an owner password that anyone must enter to open the document — ideal before emailing confidential files or storing them on shared drives. Encryption uses standard algorithms compatible with every PDF reader, and the entire process runs locally in your browser so your password is never transmitted.',
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
      { q: 'Can anyone open the PDF without the password?', a: 'No. The document is encrypted — it cannot be viewed, printed, or copied without entering the correct password in any PDF reader.' },
      { q: 'Does PDFHome know my password?', a: 'No. Encryption happens entirely in your local browser. Your password is never sent over the network or stored anywhere, so choose something memorable — it cannot be recovered if lost.' },
      { q: 'Will the encrypted PDF work on mobile devices?', a: 'Yes. The encrypted file uses standard PDF security that opens on iOS, Android, macOS, and Windows in Adobe Reader, Chrome, Preview, and other viewers.' },
      { q: 'What should I do if I forget the password?', a: 'There is no recovery — encryption is designed so even we cannot unlock it. Store the password in a password manager and keep an unencrypted backup in a safe place.' }
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
    intro: 'Trim margins, cut black scanner edges, and adjust page boundaries for clean printing and comfortable reading on tablets and e-readers. Draw a visual crop box with live preview, apply it to a single page or uniformly across the whole document, and export. Cropping only changes the visible viewport — your content keeps its full resolution. Everything runs locally in your browser.',
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
      { q: 'Can I crop all pages uniformly?', a: 'Yes. Set your margin trim values once and apply them to every page in the document simultaneously — ideal for cleaning up a full scanned batch with identical borders.' },
      { q: 'Does cropping reduce PDF file size?', a: 'Cropping adjusts the visible viewport bounds without deleting content or degrading resolution, so file size barely changes. Use the Compress tool afterward if you also want a smaller file.' },
      { q: 'Can I undo a crop?', a: 'Before exporting, you can reset the crop box and start over freely. After downloading, keep your original file if you may need the uncropped version.' }
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
    intro: 'Add clear, professional page numbers to multi-page PDF documents — essential for reports, theses, contracts, and books. Choose header or footer positioning, left/center/right alignment, custom formats like "Page 1 of 10", matching fonts and colors, and exclude cover pages. Numbering is applied cleanly without touching your existing content, entirely in your browser.',
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
      { q: 'Can I skip the first page when adding page numbers?', a: 'Yes. Check "Exclude First Page" to leave cover or title pages unnumbered while numbering starts correctly on page two.' },
      { q: 'Can I change the font size and color of page numbers?', a: 'Yes. Customize the typeface, size, and ink color so the numbering matches your document style — from subtle gray footers to bold headers.' },
      { q: 'Will page numbers overlap my existing content?', a: 'Numbers are placed in the header or footer margins. If your pages have very tight margins, choose a smaller font size to keep everything clear.' }
    ],
    relatedTools: ['watermark-pdf', 'rotate-pdf', 'merge-pdf', 'sign-pdf']
  },

  'word-to-pdf': {
    slug: '/word-to-pdf',
    aliases: ['/docx-to-pdf', '#/word-to-pdf', '#/docx-to-pdf'],
    name: 'Word to PDF',
    toolId: 'convert-word',
    metaTitle: 'Word to PDF Converter Free — Convert DOCX to PDF Online | PDFHome',
    metaDescription: 'Convert Microsoft Word (.docx) documents to PDF online for free. Fast, accurate in-browser conversion with best-effort layout reconstruction. Document files never leave your browser; ads use cookies per our privacy policy.',
    h1: 'Word to PDF Converter Free Online',
    intro: 'Convert Microsoft Word documents (.docx) into professional, print-ready PDF files right in your browser. PDFs preserve your fonts, formatting, margins, and layout exactly, making them ideal for sharing resumes, contracts, and reports that must look identical everywhere. No Microsoft Word installation needed, no uploads, no watermarks — your documents never leave your device.',
    howTo: [
      { step: 1, title: 'Upload Word Document', desc: 'Select or drag and drop your .docx file into the converter workbench.' },
      { step: 2, title: 'Review & Process', desc: 'Our client-side engine parses and renders your document structure in memory.' },
      { step: 3, title: 'Download PDF', desc: 'Click to export and download your clean, print-ready PDF file instantly.' }
    ],
    features: [
      { title: 'In-Browser Privacy', desc: 'Confidential business contracts and personal documents never leave your device.' },
      { title: 'Precise Layout Rendering', desc: 'Preserves tables, headings, lists, font styling, and margin alignment.' },
      { title: 'No Installation or Sign-Up', desc: 'Free forever with no queues, email registration, or file size limits.' }
    ],
    faqs: [
      { q: 'Can I convert DOCX files without Microsoft Word installed?', a: 'Yes. PDFHome converts Word documents directly inside your web browser — no Office installation, no plugins, and it works on Windows, Mac, Linux, Chromebooks, and phones.' },
      { q: 'Are my confidential Word documents uploaded to any server?', a: 'No. All processing happens entirely in your local browser session. Your documents are never transmitted or stored on any server.' },
      { q: 'Does converting Word to PDF add any watermark?', a: 'No. PDFHome never adds watermarks, branding, or trial notices to your converted documents.' },
      { q: 'Will complex formatting survive the conversion?', a: 'Standard formatting — headings, tables, lists, images, headers and footers — converts faithfully. Extremely complex Word-specific features may render slightly differently, so review the PDF before sharing.' }
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
    intro: 'Convert Excel workbooks (.xlsx) into clean, printable PDF tables. Share financial reports, invoices, schedules, and data sheets in a format that looks identical on every device — no more broken layouts when someone opens your spreadsheet without Excel. Column structures, numbers, and grid alignment are preserved, and multi-sheet workbooks become sequential PDF pages. All processing is client-side in your browser.',
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
      { q: 'Can I convert multi-sheet Excel files to PDF?', a: 'Yes. Each worksheet becomes sequential PDF pages in workbook order, so nothing is lost from multi-sheet files.' },
      { q: 'Are my financial spreadsheets secure?', a: 'Completely. All data processing happens client-side in your browser — your numbers are never uploaded to any server.' },
      { q: 'Will formulas show as values or formulas?', a: 'Cells render with their calculated values, exactly as they appear in Excel, so the PDF reflects the finished spreadsheet.' }
    ],
    relatedTools: ['pdf-to-excel', 'merge-pdf', 'compress-pdf', 'pdf-to-word']
  },

  'slides-to-pdf': {
    slug: '/slides-to-pdf',
    aliases: ['#/slides-to-pdf'],
    name: 'Slides (PPTX) to PDF',
    toolId: 'convert-slides',
    metaTitle: 'PowerPoint to PDF Converter Free — Convert PPTX to PDF Online | PDFHome',
    metaDescription: 'Convert Microsoft PowerPoint (.pptx) presentations to PDF online for free. Fast, private in-browser conversion with zero file uploads.',
    h1: 'PowerPoint to PDF Converter Free Online',
    intro: 'Convert PowerPoint presentations (.pptx) into clean, high-resolution PDF decks right in your browser. PDFs are perfect for distributing slides that must look identical everywhere — no font substitutions, no layout shifts, no "please install PowerPoint" messages. Each slide becomes a crisp PDF page. No uploads, no sign-up, no watermarks.',
    howTo: [
      { step: 1, title: 'Upload Presentation', desc: 'Select or drag and drop your .pptx file into the converter workbench.' },
      { step: 2, title: 'Convert Slides', desc: 'Our client-side engine renders each slide into crisp PDF pages in memory.' },
      { step: 3, title: 'Download PDF', desc: 'Save your presentation as a shareable, print-ready PDF document instantly.' }
    ],
    features: [
      { title: 'In-Browser Privacy', desc: 'Your decks and pitch presentations never leave your device.' },
      { title: 'High-Resolution Slides', desc: 'Slides are rendered sharply so text and graphics stay crisp in the PDF.' },
      { title: 'No Installation or Sign-Up', desc: 'Free forever with no queues, email registration, or watermarks.' }
    ],
    faqs: [
      { q: 'Can I convert PPTX to PDF without PowerPoint installed?', a: 'Yes. PDFHome converts presentations directly inside your web browser on any device — Windows, Mac, Linux, Chromebook, or phone.' },
      { q: 'Are my presentation files uploaded to a server?', a: 'No. All processing happens entirely in your local browser session, so confidential decks stay private.' },
      { q: 'Will animations or transitions carry over to the PDF?', a: 'No. Each slide is captured as a static page, so animations, transitions, and embedded videos are not preserved — the PDF shows each slide in its final state.' },
      { q: 'Does converting add a watermark?', a: 'No. PDFHome never adds watermarks or branding to your converted documents.' }
    ],
    relatedTools: ['pdf-to-powerpoint', 'pdf-to-word', 'merge-pdf', 'compress-pdf']
  },

  'pages': {
    slug: '/pages',
    aliases: ['#/pages'],
    name: 'Page Editor Workbench',
    toolId: 'pages',
    metaTitle: 'PDF Page Editor Online Free — Organize, Watermark & Protect Pages | PDFHome',
    metaDescription: 'Edit PDF pages in one unified workbench: reorder, rotate, delete, crop, add page numbers, apply watermarks, and password-protect. Free, private, and fully in-browser.',
    h1: 'PDF Page Editor Workbench',
    intro: 'Open any PDF in the Page Editor Workbench to reorganize, enhance, and secure it without uploading anything. Reorder pages with drag and drop, rotate or delete unwanted sheets, crop margins, stamp page numbers, add text or image watermarks, and lock the file with a password — all in one continuous workspace that runs entirely in your browser.',
    howTo: [
      { step: 1, title: 'Open Your PDF', desc: 'Drop a PDF file into the workbench to load every page as a live thumbnail.' },
      { step: 2, title: 'Edit Freely', desc: 'Reorder, rotate, delete, crop, number, watermark, or protect pages using the editing suite below the preview.' },
      { step: 3, title: 'Save & Export', desc: 'Click "Save & Export PDF" to download your edited document instantly.' }
    ],
    features: [
      { title: 'All-in-One Workspace', desc: 'Organize, crop, number, watermark, and protect pages without switching tools.' },
      { title: 'Live Page Preview', desc: 'See every edit reflected instantly on a full-page preview before exporting.' },
      { title: 'Total Privacy', desc: 'Documents are processed locally in your browser memory. Files never leave your device.' },
      { title: 'Free & Unlimited', desc: 'No sign-up, no watermarks added, no page-count paywalls.' }
    ],
    faqs: [
      { q: 'Is the PDF page editor really free?', a: 'Yes. Every editing feature in the workbench — reorganizing, rotating, cropping, page numbers, watermarks, signatures, and password protection — is 100% free with no account required and no watermarks added to your documents.' },
      { q: 'Are my files uploaded anywhere when I edit them?', a: 'No. All editing happens locally in your browser memory. Your documents never touch a server, so you can safely edit contracts, medical records, and financial statements.' },
      { q: 'Can I add page numbers and a watermark in one go?', a: 'Yes. The workbench is designed for combined workflows — add page numbers, stamp a watermark, crop margins, delete unwanted pages, and apply password protection, then export everything in a single finished PDF.' },
      { q: 'Will editing reduce my PDF quality?', a: 'No. Pages keep their original fonts, vector graphics, and image resolution through the editing workflow. Operations like reordering, rotating, and numbering do not recompress your content.' },
      { q: 'Can I sign a PDF in the page editor?', a: 'Yes. The Watermark & Signature tab lets you draw a signature with your mouse or finger, or stamp a saved signature image with adjustable size, opacity, and position on any page.' },
      { q: 'How do I password-protect my PDF?', a: 'Open the Password Lock tab, enter a password, and export. The resulting PDF requires the password to open, using standard encryption that works in any PDF reader.' }
    ],
    relatedTools: ['merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pdf-pages']
  },

  'convert': {
    slug: '/convert',
    aliases: ['#/convert'],
    name: 'Document Converter',
    toolId: 'convert',
    metaTitle: 'Online Document Converter — PDF to Word, Excel, PowerPoint & JPG | PDFHome',
    metaDescription: 'Convert documents both ways in your browser: PDF to Word, Excel, PowerPoint, JPG and back again. Free, private, no sign-up, zero server uploads.',
    h1: 'Online Document Converter',
    intro: 'Convert between PDF and popular office formats without installing anything. Turn PDFs into editable Word documents, Excel spreadsheets, PowerPoint decks, or JPG images — or go the other way and create PDFs from Word, Excel, PowerPoint, and image files. Every conversion runs locally in your browser, so your documents stay private.',
    howTo: [
      { step: 1, title: 'Choose a Direction', desc: 'Pick whether you are converting from PDF to an office format, or creating a PDF from another file type.' },
      { step: 2, title: 'Upload Your File', desc: 'Drop your document into the upload area. Files are read locally and never sent to a server.' },
      { step: 3, title: 'Convert & Download', desc: 'Run the conversion and download your finished file instantly.' }
    ],
    features: [
      { title: 'Two-Way Conversion', desc: 'PDF to Word, Excel, PowerPoint, and JPG — plus Word, Excel, PowerPoint, and images back to PDF.' },
      { title: 'Private by Design', desc: 'Conversions execute in your browser. Sensitive documents never leave your device.' },
      { title: 'No Software Needed', desc: 'Works in any modern browser on desktop and mobile. Nothing to install.' },
      { title: 'Free Forever', desc: 'Unlimited conversions with no accounts, trials, or hidden fees.' }
    ],
    faqs: [
      { q: 'Which formats can I convert?', a: 'PDFHome converts PDF to Word (DOCX), Excel (XLSX), PowerPoint (PPTX), and JPG images — and back the other way, turning Word, Excel, PowerPoint, and image files (JPG, PNG) into PDFs. It also includes OCR to make scanned PDFs searchable.' },
      { q: 'Is the document converter free?', a: 'Yes. All conversions are completely free with no registration, watermarks, page limits, or daily quotas. Convert as many documents as you need.' },
      { q: 'Do my files get uploaded to a server?', a: 'No. PDFHome converts files entirely inside your web browser using client-side technology. Your documents never leave your device, which makes it safe for sensitive business and personal files.' },
      { q: 'Will my Word document keep its formatting?', a: 'The converter reconstructs text, tables, headings, lists, and images as faithfully as in-browser conversion allows. Most standard documents convert cleanly; highly complex layouts may need minor adjustments afterward.' },
      { q: 'Can I convert scanned PDFs?', a: 'Yes. Scanned PDFs are images of text, so run them through the OCR tool first to recognize the text layer, then convert the searchable PDF to Word or Excel.' },
      { q: 'What is the maximum file size for conversion?', a: 'Because conversion happens locally in your browser, there are no server upload limits. Large documents work fine as long as your device has enough available memory.' }
    ],
    relatedTools: ['pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint', 'jpg-to-pdf']
  }
};

/**
 * Helper to retrieve SEO metadata by key or slug.
 */
export function getSeoMetadata(keyOrSlug) {
  if (!keyOrSlug) return null;
  const clean = keyOrSlug.replace(/^\//, '').replace(/^#\//, '');
  if (TOOL_SEO_DATA[clean]) return TOOL_SEO_DATA[clean];
  return Object.values(TOOL_SEO_DATA).find(t => t.slug === `/${clean}` || (t.aliases && t.aliases.includes(`/${clean}`))) || null;
}
