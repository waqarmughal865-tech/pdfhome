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
    readTime: '7 min read',
    toolSlug: '/unlock-pdf',
    toolName: 'Unlock PDF',
    excerpt: 'Locked out of your own PDF? Here\'s the honest truth about what works, what doesn\'t, and how to remove the password in seconds.',
    intro: [
      'It happens to everyone. You password-protected a PDF months ago — maybe a bank statement, a contract, a scanned document — and now you can\'t remember the password. Or a colleague sent you a "secured" file and never shared the key.',
      'Here\'s the honest truth first: if a PDF is locked with a strong <em>user password</em> (the kind that blocks you from even opening the file), no free online tool can crack it. That\'s by design — real encryption doesn\'t have a backdoor.',
      'But here\'s the good news: most locked PDFs you run into aren\'t that. They\'re protected with an <em>owner password</em> — the kind that stops you from printing, copying text, or editing. That protection can be removed in seconds, no password needed. Let\'s do it.',
      'Where do these locked PDFs even come from? Usually it\'s nothing dramatic: your bank sends statements with printing disabled, an HR portal exports your payslip with copying blocked, or someone in the office password-protects a file \'just to be safe\' and then forgets the password themselves. The lock was probably never meant to stop <em>you</em> — it was meant to stop the file from being casually forwarded or edited.',
      'One boundary before we start: this guide is for PDFs you own or have a legitimate right to open — your own documents, files your employer or bank sent you. It\'s not a lock-picking tutorial, and neither is the tool. If a file genuinely isn\'t yours to open, the right move is asking whoever sent it.',
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
      {
        heading: 'Why you should avoid random "PDF cracker" websites',
        body: [
        'Search "unlock PDF free" and you\'ll find dozens of sites promising to crack any password in seconds. Here\'s what most of them actually do: upload your file to their server (so now a stranger has your bank statement), run the same owner-password removal any decent tool does, and sometimes bundle the download with adware. The password "cracking" part is theater — if a site claims it can break strong encryption in seconds, it\'s lying.',
        'Rule of thumb: if a PDF tool needs your file to leave your device, ask yourself whether the result is worth the risk. With PDFHome the file never leaves your browser at all, which is exactly how it should be for sensitive documents.',
        ],
      },
      {
        heading: 'Make sure this never happens again',
        body: [
        'Once you\'ve got your unlocked copy, do future-you a favor. Save passwords in a password manager instead of your memory — "bankstatement2024!" felt memorable at the time, clearly it wasn\'t. And keep one clean, unlocked copy of important documents in a safe folder, so you\'re never locked out of your own paperwork again.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I unlock a PDF without knowing the password?', a: 'If it\'s owner-password protection (blocks printing/copying/editing but opens fine), yes — no password needed. If it\'s a strong user password that blocks opening entirely, no free tool can break real encryption.' },
      { q: 'Will unlocking change my PDF?', a: 'No. Only the security settings are removed. Pages, text, images, and layout stay exactly the same.' },
      { q: 'Is it safe to upload my PDF?', a: 'With PDFHome, there\'s nothing to upload — the whole process runs inside your browser. Your file never leaves your device.' },
      { q: 'Will the file owner know I unlocked it?', a: 'No. You\'re working on your own local copy in your browser — the original file is untouched, and nothing is reported anywhere.' },
      { q: 'Does this work on PDFs encrypted with a strong open password?', a: 'No, and you should be suspicious of any tool that claims otherwise. Strong encryption can\'t be broken by a free web tool — that\'s the whole point of encryption.' },
    ],
  },

  {
    slug: 'how-to-redact-pdf',
    title: 'How to Redact a PDF (Black Out Sensitive Text Properly)',
    metaTitle: 'How to Redact a PDF — Black Out Text Permanently | PDFHome',
    metaDescription: 'Need to hide names, numbers, or addresses in a PDF? Learn how to redact a PDF properly so the text can\'t be recovered — free, in your browser.',
    h1: 'How to Redact a PDF (Black Out Sensitive Text Properly)',
    publishDate: '2026-10-12',
    readTime: '8 min read',
    toolSlug: '/redact-pdf',
    toolName: 'Redact PDF',
    excerpt: 'Drawing black boxes in Paint isn\'t redaction. Here\'s how to actually hide sensitive text in a PDF so it stays hidden.',
    intro: [
      'Quick quiz: you open a PDF, draw black rectangles over the sensitive parts in an image editor, save it. Is the text hidden? <strong>No.</strong> Anyone can select the text underneath, copy it, and read every word. This mistake has burned lawyers, journalists, and governments.',
      'Real redaction means the hidden text is <em>gone</em> — covered permanently so it can\'t be selected, copied, or recovered. Here\'s how to do it right, in about a minute.',
      'Here\'s the uncomfortable part most tutorials skip: a lot of \'redaction tools\' just paint black rectangles <em>on top of</em> your text. The words are still there underneath, sitting in the file, waiting for someone to select and copy them. That has caused real scandals — hidden names in court filings recovered by journalists, personal data leaking from \'redacted\' government reports.',
      'So the golden rule of this guide: after you redact, <em>verify like an attacker</em>. Try to select the blacked-out text. Try to copy it. Zoom in to 400%. If you can still get at the words, they\'re not hidden — they\'re just covered. We\'ll walk through exactly how to check.',
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
      {
        heading: 'The metadata trap most people forget',
        body: [
        'Even if the visible text is perfectly covered, PDFs carry invisible baggage: the author\'s name, the software used, creation dates, sometimes even edit history. If you\'re redacting a document for privacy, that metadata can give you away. Run the file through a <a href="/metadata-editor">metadata editor</a> afterwards and strip out anything identifying — it takes twenty seconds.',
        ],
      },
      {
        heading: 'Work on a copy, always',
        body: [
        'Never redact your only copy of a document. Make a duplicate first, redact the duplicate, and keep the original somewhere safe and private. Redaction is a one-way street — once text is covered and the file is saved, there\'s no "undo" that brings it back.',
        ],
      },
    ],
    faqs: [
      { q: 'Is blacking out text in a PDF editor real redaction?', a: 'Only if the underlying text is actually removed or permanently covered in the file — not just visually hidden. Always test by trying to select and copy the "hidden" text.' },
      { q: 'Can redacted text ever be recovered?', a: 'If redaction is done properly (text covered permanently in the file), no. If someone just drew boxes over selectable text, yes — trivially.' },
      { q: 'Should I keep the original?', a: 'Keep it somewhere safe and private, but never send it by mistake. Double-check attachments before hitting send — sending the unredacted original is the classic disaster.' },
      { q: 'Is drawing black boxes over text enough?', a: 'For viewing and printing, yes — nobody can read what they can\'t see. But be aware the text may still exist underneath in the file. Always verify by trying to select and copy the covered text before sharing.' },
      { q: 'Should I redact the original file?', a: 'No — always work on a copy. Keep the original stored safely in case you ever need the unredacted version.' },
    ],
  },

  {
    slug: 'how-to-convert-pdf-to-word',
    title: 'How to Convert PDF to Word Without Messing Up the Formatting',
    metaTitle: 'How to Convert PDF to Word (Keep Formatting) — Free | PDFHome',
    metaDescription: 'Convert PDF to Word without losing your layout. Here\'s what actually works, what to watch out for, and the free way to do it.',
    h1: 'How to Convert PDF to Word Without Messing Up the Formatting',
    publishDate: '2026-10-12',
    readTime: '7 min read',
    toolSlug: '/pdf-to-word',
    toolName: 'PDF to Word',
    excerpt: 'PDF to Word conversion is never perfect — but it can be close. Here\'s how to get the best result and what to fix by hand.',
    intro: [
      'Let\'s set expectations honestly: no converter turns a PDF into a <em>perfect</em> Word document. PDFs are designed to look the same everywhere; Word documents are designed to be edited. Those goals fight each other.',
      'But "not perfect" and "usable" are very different things. A good conversion gets you 90% of the way there — real paragraphs, real headings, editable tables — and you fix the last 10% by hand in two minutes. Here\'s how.',
      'Let\'s set expectations honestly: a PDF-to-Word conversion is a <em>reconstruction</em>, not a magic reversal. A PDF doesn\'t remember \'this was a heading, that was a table\' — it only remembers where ink goes on a page. The converter has to guess the structure back. Simple documents come out beautifully; complex layouts need a little cleanup afterwards.',
      'Knowing that upfront changes how you judge the result. If your two-column brochure comes out as one long column of text, that\'s not the tool failing — that\'s the tool telling you the truth about what a PDF actually contains.',
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
      {
        heading: 'Scanned PDFs need one extra step first',
        body: [
        'If your PDF is a scan (photos of pages, no selectable text), there\'s nothing to convert yet — it\'s just pictures. Run it through <a href="/ocr-pdf">OCR</a> first to recognize the text, then convert the result to Word. Skipping this step is the #1 reason people get empty Word files.',
        ],
      },
      {
        heading: 'Tables are where conversions get messy',
        body: [
        'Tables, multi-column layouts, and text wrapped around images are the hardest things to reconstruct. After converting, check every table: merged cells, shifted columns, and numbers that jumped rows are the usual suspects. Fixing them takes a few minutes — still far faster than retyping the whole document.',
        ],
      },
    ],
    faqs: [
      { q: 'Why does my converted Word file look different?', a: 'PDFs store exact visual positions; Word reflows text. Complex layouts (multi-column, fancy tables) are where differences show up. Simple documents convert almost perfectly.' },
      { q: 'Can I convert a scanned PDF to Word?', a: 'Not directly — scans are images. Run OCR first to recognize the text, then convert.' },
      { q: 'Is my document uploaded anywhere?', a: 'No. PDFHome converts entirely in your browser — your file never leaves your device.' },
      { q: 'Why is my Word file a different size than the PDF?', a: 'Totally normal. Word stores text and formatting differently than PDF\'s fixed layout — the file can end up bigger or smaller. The content is what matters, not the byte count.' },
      { q: 'Can I convert a password-protected PDF?', a: 'Remove the protection first with the <a href="/unlock-pdf">Unlock PDF</a> tool, then convert. A locked file will block the converter.' },
    ],
  },

  {
    slug: 'how-to-merge-pdf-files',
    title: 'How to Merge PDF Files Into One Document',
    metaTitle: 'How to Merge PDF Files Into One — Free Online | PDFHome',
    metaDescription: 'Combine multiple PDFs into a single document in seconds. Here\'s the easiest free way to merge PDF files — no software, no signup.',
    h1: 'How to Merge PDF Files Into One Document',
    publishDate: '2026-10-12',
    readTime: '6 min read',
    toolSlug: '/merge-pdf',
    toolName: 'Merge PDF',
    excerpt: 'Ten attachments, one email. Here\'s how to combine PDFs into a single file in under a minute.',
    intro: [
      'You know the situation: a job application needs your CV, cover letter, and certificates as <em>one</em> PDF. Or you scanned a document in five parts. Or someone emailed you chapters 1 through 12 as separate files.',
      'Merging PDFs used to mean installing sketchy software. It doesn\'t anymore. Here\'s the whole process — it takes less time than reading this article.',
      'Merging sounds trivial until you\'re staring at twelve files named \'document_final_v2_REAL.pdf\' wondering which order they go in. The merge itself takes seconds — the real work is getting organized first. A merged PDF inherits every problem of its parts: wrong order, upside-down pages, duplicate files. Sort that out before you merge, not after.',
      'Also worth deciding upfront: what is this merged file <em>for</em>? A 200-page reference manual you\'ll read on screen wants small file size; a contract pack you\'re printing wants full quality. That choice affects everything downstream.',
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
      {
        heading: 'Merging for print vs. merging for screen',
        body: [
        'If the merged PDF is headed to a printer, keep every page at full quality — compression artifacts that are invisible on screen become very visible on paper. If it\'s for emailing or reading on a phone, run the result through <a href="/compress-pdf">compression</a> afterwards. Same content, half the size, and nobody reading on a screen will notice.',
        ],
      },
      {
        heading: 'When you should NOT merge',
        body: [
        'Don\'t merge files just to "keep things together" if the result becomes a 500-page monster nobody will open. And never merge documents with different audiences into one file — your invoice and your medical report don\'t belong in the same PDF, no matter how convenient it feels.',
        ],
      },
    ],
    faqs: [
      { q: 'How many PDFs can I merge at once?', a: 'There\'s no hard limit in the browser — but very large merges need enough memory on your device. For dozens of big files, merge in batches.' },
      { q: 'Will merging change my PDFs\' quality?', a: 'No. Pages are combined as-is; text, images, and formatting are untouched.' },
      { q: 'Can I merge only some pages from each PDF?', a: 'Merge combines whole files. To pick specific pages, split the PDFs first, then merge the pieces you want.' },
      { q: 'Is there a limit to how many PDFs I can merge?', a: 'Technically no — but practically, keep it sane. Dozens of files are fine; hundreds will make the result slow to open and painful to navigate.' },
      { q: 'Will merging change the quality of my pages?', a: 'No. Merging just binds the pages together — each page keeps its original quality. If you want a smaller file, compress afterwards as a separate step.' },
    ],
  },

  {
    slug: 'how-to-compress-pdf',
    title: 'How to Compress a PDF Without Ruining It',
    metaTitle: 'How to Compress a PDF (Make It Smaller) — Free | PDFHome',
    metaDescription: 'PDF too big to email? Here\'s how to compress a PDF and shrink the file size without turning it into a blurry mess.',
    h1: 'How to Compress a PDF Without Ruining It',
    publishDate: '2026-10-12',
    readTime: '7 min read',
    toolSlug: '/compress-pdf',
    toolName: 'Compress PDF',
    excerpt: 'That 25MB PDF won\'t fit in an email. Here\'s how to shrink it — and how to tell when you\'ve gone too far.',
    intro: [
      'Email says "attachment too large." The upload form caps at 10MB. Your 25MB PDF of scanned pages isn\'t going anywhere until it gets smaller.',
      'Compressing a PDF is easy. Compressing it <em>well</em> — small file, still readable — takes a little judgment. Here\'s what actually makes PDFs big and how to shrink them sensibly.',
      'Here\'s the question everyone actually has: <em>how small will it go?</em> Honest answer: it depends entirely on what\'s inside. A 50 MB scanned document full of color photos might shrink to 8 MB. A 2 MB text-only PDF might only drop to 1.8 MB — there\'s just nothing to squeeze. If your file is mostly text already, compression has very little to work with.',
      'And the second question: <em>will it look worse?</em> Slightly, sometimes. Compression works by throwing away image detail you (hopefully) won\'t miss. For screen reading and email, that\'s a trade worth making. For anything going to a professional printer, think twice.',
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
      {
        heading: 'Still too big? Go after the images',
        body: [
        'If compression didn\'t shrink things enough, the images are the culprit — they\'re usually 80–90% of a PDF\'s size. The nuclear option: extract the images with the <a href="/extract-images">image extractor</a>, shrink the big ones in any photo editor, and rebuild. It\'s manual work, but it beats a file that won\'t send.',
        ],
      },
      {
        heading: 'When you should NOT compress',
        body: [
        'Don\'t compress documents headed for professional printing — the quality loss shows up on paper. Don\'t compress legal or archival documents where fidelity matters. And don\'t compress twice hoping for double the savings: the second pass barely helps and the quality keeps dropping.',
        ],
      },
    ],
    faqs: [
      { q: 'How much smaller will my PDF get?', a: 'Depends on content. Scanned/image-heavy PDFs often shrink 50-80%. Text-only PDFs barely shrink because there\'s nothing to squeeze.' },
      { q: 'Will compression make my PDF blurry?', a: 'Good compression is invisible. But aggressive settings can soften images and small text — always zoom in and check before sharing.' },
      { q: 'Can I compress a PDF twice?', a: 'You can, but each round loses a bit more quality. Better to compress once at the right level than twice aggressively.' },
      { q: 'Why is my compressed PDF still big?', a: 'Either it was mostly text (nothing to squeeze), or it contains huge images. Check which it is — if it\'s images, extract and shrink them manually for much bigger savings.' },
      { q: 'Can I compress a PDF twice?', a: 'You can, but the second round saves almost nothing while visibly hurting quality. One good pass is the sweet spot.' },
    ],
  },

  {
    slug: 'how-to-extract-images-from-pdf',
    title: 'How to Extract Images From a PDF (Save Every Picture)',
    metaTitle: 'How to Extract Images From a PDF — Save Pictures Free | PDFHome',
    metaDescription: 'Need the photos out of a PDF? Here\'s how to extract embedded images from any PDF at original quality — free, no software needed.',
    h1: 'How to Extract Images From a PDF (Save Every Picture)',
    publishDate: '2026-10-12',
    readTime: '6 min read',
    toolSlug: '/extract-images',
    toolName: 'Extract Images',
    excerpt: 'That ebook has photos you need. Screenshots are blurry — here\'s how to pull the original images straight out of the PDF.',
    intro: [
      'You\'re reading a PDF — a textbook, a report, a brochure — and there\'s a photo or diagram you need. Your first instinct is a screenshot. Don\'t. Screenshots grab your <em>screen\'s</em> resolution, which is a fraction of the original image\'s quality.',
      'The real images are sitting inside the PDF file at full quality. You just need to pull them out. Here\'s how.',
      'Quick reality check on what you\'ll get: the extractor pulls out images <em>exactly as they\'re stored inside the PDF</em> — no better, no worse. A crisp photo placed at full resolution comes out crisp. A tiny 100-pixel logo comes out as a tiny 100-pixel logo. The tool can\'t invent detail that isn\'t there, so set your expectations by the source.',
      'You\'ll also probably get more than you bargained for: background textures, icons, social media logos from footers, watermarks. A 20-page corporate PDF can easily cough up 60+ images, of which you wanted maybe five. That\'s normal — extraction is a harvest, and sorting comes after.',
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
      {
        heading: 'What quality will you actually get?',
        body: [
        'Each image comes out at its embedded resolution — the size it was when whoever made the PDF dropped it in. Photos are usually fine for reuse on screen. Anything destined for print needs checking: open the extracted file and look at its pixel dimensions. If it\'s under 1000 pixels wide, it\'ll look soft on paper.',
        ],
      },
      {
        heading: 'Sorting the haul',
        body: [
        'After extracting, sort fast and ruthlessly: keepers in one folder, junk in another. The usual junk: 1-pixel spacer images, duplicated logos, background gradients. Don\'t feel bad deleting 80% of what came out — that\'s the normal ratio, not a failure of the tool.',
        ],
      },
    ],
    faqs: [
      { q: 'What quality are the extracted images?', a: 'Original embedded quality — the exact image data stored in the PDF, saved as PNG. Much better than screenshots.' },
      { q: 'Why do some PDFs show no images?', a: 'The PDF may contain only text/vectors, or its "images" are full-page renders. Try PDF to JPG for page renders.' },
      { q: 'Can I extract images from a scanned PDF?', a: 'A scan is one big image per page — there are no separate embedded pictures to extract. Use PDF to JPG to save each page as an image.' },
      { q: 'Why are some extracted images so small?', a: 'Because they were small inside the PDF — thumbnails, icons, and logos are stored at tiny sizes. The extractor gives you exactly what\'s there; it can\'t upscale them.' },
      { q: 'Can I extract images from just one page?', a: 'Extract everything, then delete what you don\'t need — it\'s faster than picking pages one by one. Most PDFs give you a manageable number of images.' },
    ],
  },
];
