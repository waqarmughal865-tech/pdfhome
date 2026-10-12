/**
 * Blog articles — human-written guides. Each article targets one search keyword,
 * teaches the reader something genuinely useful, and links to the matching tool.
 *
 * Writing rules: sound like a person, not a brochure. Short paragraphs.
 * No "in today's digital age", no "delve", no filler. Be specific, be direct,
 * admit limitations honestly.
 */

export const ARTICLES = [
  {
    slug: 'how-to-unlock-pdf',
    title: 'How to Unlock a PDF When You Forgot the Password',
    metaTitle: 'How to Unlock a PDF (Forgot Password?) — Free & Easy | PDFHome',
    metaDescription: 'Forgot your PDF password? Here\'s how to remove password protection from a PDF you own — free, in seconds, without installing anything.',
    h1: 'How to Unlock a PDF When You Forgot the Password',
    publishDate: '2026-10-12',
    readTime: '4 min read',
    toolSlug: '/unlock-pdf',
    toolName: 'Unlock PDF',
    excerpt: 'Locked out of your own PDF? Here\'s the honest truth about what works, what doesn\'t, and how to remove the password in seconds.',
    intro: [
      'It happens to everyone. You password-protected a PDF months ago — maybe a bank statement, a contract, a scanned document — and now you can\'t remember the password. Or a colleague sent you a "secured" file and never shared the key.',
      'Here\'s the honest truth first: if a PDF is locked with a strong <em>user password</em> (the kind that blocks you from even opening the file), no free online tool can crack it. That\'s by design — real encryption doesn\'t have a backdoor.',
      'But here\'s the good news: most locked PDFs you run into aren\'t that. They\'re protected with an <em>owner password</em> — the kind that stops you from printing, copying text, or editing. That protection can be removed in seconds, no password needed. Let\'s do it.',
    ],
    sections: [
      {
        heading: 'Step 1: Figure out what kind of lock it is',
        body: [
          'Try opening the PDF. If it opens fine but won\'t let you print or copy text, it\'s owner-password protected — you\'re in luck, this takes ten seconds.',
          'If it asks for a password just to <em>open</em>, try the obvious ones first: your birth year, "password123", the company name, "123456". You\'d be surprised how often that works. If none work and the encryption is strong, you\'ll need to contact whoever created the file.',
        ],
      },
      {
        heading: 'Step 2: Upload it to the unlock tool',
        body: [
          'Open the <a href="/unlock-pdf">Unlock PDF tool</a> and drop your file in. Everything happens inside your browser — the file never goes to any server, which matters a lot when you\'re dealing with sensitive documents.',
        ],
      },
      {
        heading: 'Step 3: Download your unlocked copy',
        body: [
          'Click "Unlock PDF" and download the result. Printing, copying, and editing restrictions are gone. The content itself is untouched — same pages, same layout, same quality.',
        ],
      },
      {
        heading: 'A quick word on the ethics',
        body: [
          'Only unlock PDFs you own or have legitimate rights to — your own documents, files shared with you for work, that sort of thing. Don\'t use this on someone else\'s protected work. You know where the line is.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I unlock a PDF without knowing the password?', a: 'If it\'s owner-password protection (blocks printing/copying/editing but opens fine), yes — no password needed. If it\'s a strong user password that blocks opening entirely, no free tool can break real encryption.' },
      { q: 'Will unlocking change my PDF?', a: 'No. Only the security settings are removed. Pages, text, images, and layout stay exactly the same.' },
      { q: 'Is it safe to upload my PDF?', a: 'With PDFHome, there\'s nothing to upload — the whole process runs inside your browser. Your file never leaves your device.' },
    ],
  },

  {
    slug: 'how-to-redact-pdf',
    title: 'How to Redact a PDF (Black Out Sensitive Text Properly)',
    metaTitle: 'How to Redact a PDF — Black Out Text Permanently | PDFHome',
    metaDescription: 'Need to hide names, numbers, or addresses in a PDF? Learn how to redact a PDF properly so the text can\'t be recovered — free, in your browser.',
    h1: 'How to Redact a PDF (Black Out Sensitive Text Properly)',
    publishDate: '2026-10-12',
    readTime: '5 min read',
    toolSlug: '/redact-pdf',
    toolName: 'Redact PDF',
    excerpt: 'Drawing black boxes in Paint isn\'t redaction. Here\'s how to actually hide sensitive text in a PDF so it stays hidden.',
    intro: [
      'Quick quiz: you open a PDF, draw black rectangles over the sensitive parts in an image editor, save it. Is the text hidden? <strong>No.</strong> Anyone can select the text underneath, copy it, and read every word. This mistake has burned lawyers, journalists, and governments.',
      'Real redaction means the hidden text is <em>gone</em> — covered permanently so it can\'t be selected, copied, or recovered. Here\'s how to do it right, in about a minute.',
    ],
    sections: [
      {
        heading: 'Step 1: List what needs hiding',
        body: [
          'Before you start, write down every term to redact: names, phone numbers, addresses, ID numbers, account numbers. Be thorough — miss one occurrence and the whole exercise is pointless. Search the document for each term first so you know what you\'re dealing with.',
        ],
      },
      {
        heading: 'Step 2: Redact every occurrence',
        body: [
          'Open the <a href="/redact-pdf">Redact PDF tool</a>, upload your file, and type each term on its own line. The tool finds every match across all pages and covers each one with a solid black box baked into the file.',
          'Don\'t redact one page at a time or eyeball it. Let the tool catch all occurrences — humans miss things, especially in long documents.',
        ],
      },
      {
        heading: 'Step 3: Verify before sharing',
        body: [
          'This step is non-negotiable. Open the redacted PDF and try to select the text under the black boxes. Try copying it. Try searching for the hidden terms with Ctrl+F. If anything leaks through, redo it.',
          'For truly sensitive documents — legal filings, medical records — have a second person check too. Paranoia is a feature here, not a bug.',
        ],
      },
      {
        heading: 'What about scanned PDFs?',
        body: [
          'Scanned PDFs are just images of text — there\'s no text layer to search, so redaction tools can\'t find matches. Run the scan through an <a href="/ocr-pdf">OCR tool</a> first to add a text layer, then redact. Or physically cover the sensitive areas on the scan before sharing.',
        ],
      },
    ],
    faqs: [
      { q: 'Is blacking out text in a PDF editor real redaction?', a: 'Only if the underlying text is actually removed or permanently covered in the file — not just visually hidden. Always test by trying to select and copy the "hidden" text.' },
      { q: 'Can redacted text ever be recovered?', a: 'If redaction is done properly (text covered permanently in the file), no. If someone just drew boxes over selectable text, yes — trivially.' },
      { q: 'Should I keep the original?', a: 'Keep it somewhere safe and private, but never send it by mistake. Double-check attachments before hitting send — sending the unredacted original is the classic disaster.' },
    ],
  },

  {
    slug: 'how-to-convert-pdf-to-word',
    title: 'How to Convert PDF to Word Without Messing Up the Formatting',
    metaTitle: 'How to Convert PDF to Word (Keep Formatting) — Free | PDFHome',
    metaDescription: 'Convert PDF to Word without losing your layout. Here\'s what actually works, what to watch out for, and the free way to do it.',
    h1: 'How to Convert PDF to Word Without Messing Up the Formatting',
    publishDate: '2026-10-12',
    readTime: '4 min read',
    toolSlug: '/pdf-to-word',
    toolName: 'PDF to Word',
    excerpt: 'PDF to Word conversion is never perfect — but it can be close. Here\'s how to get the best result and what to fix by hand.',
    intro: [
      'Let\'s set expectations honestly: no converter turns a PDF into a <em>perfect</em> Word document. PDFs are designed to look the same everywhere; Word documents are designed to be edited. Those goals fight each other.',
      'But "not perfect" and "usable" are very different things. A good conversion gets you 90% of the way there — real paragraphs, real headings, editable tables — and you fix the last 10% by hand in two minutes. Here\'s how.',
    ],
    sections: [
      {
        heading: 'Step 1: Check what kind of PDF you have',
        body: [
          'Can you select the text in your PDF? Then it has a real text layer and conversion will work well. Can\'t select anything? It\'s a scan — run it through <a href="/ocr-pdf">OCR</a> first, or the converter will hand you a Word file full of images.',
        ],
      },
      {
        heading: 'Step 2: Convert it',
        body: [
          'Drop the file into the <a href="/pdf-to-word">PDF to Word tool</a> and download the .docx. The whole thing runs in your browser, so even confidential documents are safe.',
        ],
      },
      {
        heading: 'Step 3: Fix the usual suspects',
        body: [
          'Open the Word file and check these three things — they\'re where conversions always wobble:',
          '<ul><li><strong>Tables</strong> — complex tables sometimes split or merge cells. Easiest to fix by hand.</li><li><strong>Headers and footers</strong> — page numbers and running headers may land in odd spots.</li><li><strong>Fonts</strong> — if the PDF used a font you don\'t have, Word substitutes the closest match. Usually fine, occasionally ugly.</li></ul>',
          'Two minutes of cleanup and you\'re done. Way faster than retyping.',
        ],
      },
      {
        heading: 'When conversion isn\'t the answer',
        body: [
          'If you only need the <em>text</em> and don\'t care about formatting, <a href="/pdf-to-text">PDF to Text</a> is faster and cleaner. If the PDF is mostly images with a little text, consider whether you even need Word at all.',
        ],
      },
    ],
    faqs: [
      { q: 'Why does my converted Word file look different?', a: 'PDFs store exact visual positions; Word reflows text. Complex layouts (multi-column, fancy tables) are where differences show up. Simple documents convert almost perfectly.' },
      { q: 'Can I convert a scanned PDF to Word?', a: 'Not directly — scans are images. Run OCR first to recognize the text, then convert.' },
      { q: 'Is my document uploaded anywhere?', a: 'No. PDFHome converts entirely in your browser — your file never leaves your device.' },
    ],
  },

  {
    slug: 'how-to-merge-pdf-files',
    title: 'How to Merge PDF Files Into One Document',
    metaTitle: 'How to Merge PDF Files Into One — Free Online | PDFHome',
    metaDescription: 'Combine multiple PDFs into a single document in seconds. Here\'s the easiest free way to merge PDF files — no software, no signup.',
    h1: 'How to Merge PDF Files Into One Document',
    publishDate: '2026-10-12',
    readTime: '3 min read',
    toolSlug: '/merge-pdf',
    toolName: 'Merge PDF',
    excerpt: 'Ten attachments, one email. Here\'s how to combine PDFs into a single file in under a minute.',
    intro: [
      'You know the situation: a job application needs your CV, cover letter, and certificates as <em>one</em> PDF. Or you scanned a document in five parts. Or someone emailed you chapters 1 through 12 as separate files.',
      'Merging PDFs used to mean installing sketchy software. It doesn\'t anymore. Here\'s the whole process — it takes less time than reading this article.',
    ],
    sections: [
      {
        heading: 'Step 1: Drop your files in',
        body: [
          'Open the <a href="/merge-pdf">Merge PDF tool</a> and drop in all your PDFs — or click to browse. Order matters, so arrange them the way you want them in the final document. Most tools let you drag files to reorder.',
        ],
      },
      {
        heading: 'Step 2: Check the order, then merge',
        body: [
          'Glance at the page order. This is the step everyone skips and regrets — a merged PDF with chapter 3 before chapter 2 is embarrassing. Then hit merge.',
        ],
      },
      {
        heading: 'Step 3: Download and sanity-check',
        body: [
          'Download the combined file and flip through it quickly. Check the page count matches what you expect (a 3-page + 5-page merge should give you 8 pages — if it doesn\'t, something went wrong).',
        ],
      },
      {
        heading: 'Tips worth knowing',
        body: [
          '<ul><li><strong>Locked PDFs won\'t merge.</strong> If a file is password-protected, <a href="/unlock-pdf">unlock it</a> first.</li><li><strong>File size adds up.</strong> Merging ten 10MB scans gives you a 100MB monster. <a href="/compress-pdf">Compress</a> afterwards if it\'s too big to email.</li><li><strong>Bookmarks don\'t always survive.</strong> If your PDFs had bookmarks or a table of contents, check them in the merged file.</li></ul>',
        ],
      },
    ],
    faqs: [
      { q: 'How many PDFs can I merge at once?', a: 'There\'s no hard limit in the browser — but very large merges need enough memory on your device. For dozens of big files, merge in batches.' },
      { q: 'Will merging change my PDFs\' quality?', a: 'No. Pages are combined as-is; text, images, and formatting are untouched.' },
      { q: 'Can I merge only some pages from each PDF?', a: 'Merge combines whole files. To pick specific pages, split the PDFs first, then merge the pieces you want.' },
    ],
  },

  {
    slug: 'how-to-compress-pdf',
    title: 'How to Compress a PDF Without Ruining It',
    metaTitle: 'How to Compress a PDF (Make It Smaller) — Free | PDFHome',
    metaDescription: 'PDF too big to email? Here\'s how to compress a PDF and shrink the file size without turning it into a blurry mess.',
    h1: 'How to Compress a PDF Without Ruining It',
    publishDate: '2026-10-12',
    readTime: '4 min read',
    toolSlug: '/compress-pdf',
    toolName: 'Compress PDF',
    excerpt: 'That 25MB PDF won\'t fit in an email. Here\'s how to shrink it — and how to tell when you\'ve gone too far.',
    intro: [
      'Email says "attachment too large." The upload form caps at 10MB. Your 25MB PDF of scanned pages isn\'t going anywhere until it gets smaller.',
      'Compressing a PDF is easy. Compressing it <em>well</em> — small file, still readable — takes a little judgment. Here\'s what actually makes PDFs big and how to shrink them sensibly.',
    ],
    sections: [
      {
        heading: 'Why is your PDF so big?',
        body: [
          'Nine times out of ten, it\'s images. Scanned pages saved at high resolution, photos embedded at full camera quality, that sort of thing. Text itself is tiny — a hundred pages of pure text is barely a megabyte.',
          'Knowing this tells you what to expect: a scan-heavy PDF can often shrink 70-80% with no visible difference. A text-only PDF barely compresses at all — and that\'s fine, it\'s already small.',
        ],
      },
      {
        heading: 'Step 1: Compress it',
        body: [
          'Drop the file into the <a href="/compress-pdf">Compress PDF tool</a>. It squeezes images and cleans up overhead, all in your browser.',
        ],
      },
      {
        heading: 'Step 2: Check the result before you trust it',
        body: [
          'Open the compressed PDF and zoom into a page with small text or a detailed image. If it\'s still crisp, you\'re golden. If text looks fuzzy, the compression went too far for that document — and you\'d rather know now than after sending it to your boss.',
        ],
      },
      {
        heading: 'Still too big? Go after the images',
        body: [
          'If compression alone didn\'t get you under the limit, the nuclear option is reducing image resolution. Converting color scans to <a href="/grayscale-pdf">grayscale</a> can also cut size dramatically — most documents don\'t need color.',
        ],
      },
    ],
    faqs: [
      { q: 'How much smaller will my PDF get?', a: 'Depends on content. Scanned/image-heavy PDFs often shrink 50-80%. Text-only PDFs barely shrink because there\'s nothing to squeeze.' },
      { q: 'Will compression make my PDF blurry?', a: 'Good compression is invisible. But aggressive settings can soften images and small text — always zoom in and check before sharing.' },
      { q: 'Can I compress a PDF twice?', a: 'You can, but each round loses a bit more quality. Better to compress once at the right level than twice aggressively.' },
    ],
  },

  {
    slug: 'how-to-extract-images-from-pdf',
    title: 'How to Extract Images From a PDF (Save Every Picture)',
    metaTitle: 'How to Extract Images From a PDF — Save Pictures Free | PDFHome',
    metaDescription: 'Need the photos out of a PDF? Here\'s how to extract embedded images from any PDF at original quality — free, no software needed.',
    h1: 'How to Extract Images From a PDF (Save Every Picture)',
    publishDate: '2026-10-12',
    readTime: '3 min read',
    toolSlug: '/extract-images',
    toolName: 'Extract Images',
    excerpt: 'That ebook has photos you need. Screenshots are blurry — here\'s how to pull the original images straight out of the PDF.',
    intro: [
      'You\'re reading a PDF — a textbook, a report, a brochure — and there\'s a photo or diagram you need. Your first instinct is a screenshot. Don\'t. Screenshots grab your <em>screen\'s</em> resolution, which is a fraction of the original image\'s quality.',
      'The real images are sitting inside the PDF file at full quality. You just need to pull them out. Here\'s how.',
    ],
    sections: [
      {
        heading: 'Step 1: Scan the PDF',
        body: [
          'Open the <a href="/extract-images">Extract Images tool</a> and upload your PDF. It scans every page and lists each embedded picture — photos, illustrations, diagrams, charts — as thumbnails with their dimensions.',
        ],
      },
      {
        heading: 'Step 2: Grab what you need',
        body: [
          'Click any image to download it as a PNG at its original embedded quality, or hit "Download All" to get everything as a ZIP. The same image used on multiple pages is listed once, not twenty times.',
        ],
      },
      {
        heading: 'What if it finds nothing?',
        body: [
          'Two possibilities. One: the PDF genuinely has no embedded images — just text and vector graphics. Two: what looks like an "image" is actually a full page render. In that case, use <a href="/pdf-to-jpg">PDF to JPG</a> to render pages as images instead.',
          'Also worth knowing: tiny decorative icons (under 32 pixels) are filtered out automatically, so you only get the meaningful pictures.',
        ],
      },
      {
        heading: 'A note on copyright',
        body: [
          'Just because you <em>can</em> extract an image doesn\'t mean you can use it freely. Photos in ebooks, reports, and brochures usually belong to someone. Extracting for personal reference or study is one thing; republishing is another. When in doubt, ask.',
        ],
      },
    ],
    faqs: [
      { q: 'What quality are the extracted images?', a: 'Original embedded quality — the exact image data stored in the PDF, saved as PNG. Much better than screenshots.' },
      { q: 'Why do some PDFs show no images?', a: 'The PDF may contain only text/vectors, or its "images" are full-page renders. Try PDF to JPG for page renders.' },
      { q: 'Can I extract images from a scanned PDF?', a: 'A scan is one big image per page — there are no separate embedded pictures to extract. Use PDF to JPG to save each page as an image.' },
    ],
  },
];
