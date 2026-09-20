# PDF Home

A professional, privacy-first PDF home that runs **entirely in your browser**. Your files never leave your device.

## Features

| Tool | Description |
|------|-------------|
| **Merge PDF** | Combine multiple PDFs into one document |
| **Split PDF** | Extract pages by range, selection, or split all |
| **Page Manager** | Reorder, rotate, and delete pages |
| **PDF to Image** | Convert PDF pages to JPG or PNG |
| **Image to PDF** | Create a PDF from JPG, PNG, or WebP images |
| **Compress PDF** | Reduce PDF file size |

## Privacy

All PDF processing happens **client-side in the browser** using JavaScript. The server only delivers static HTML/CSS/JS files. PDF contents are **never uploaded, transmitted, or stored** on any server.

You can verify this by opening your browser's DevTools → Network tab during any operation.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app opens at `http://localhost:3000`.

### Production Build

```bash
# Build static files
npm run build

# Preview the production build locally
npm run preview
```

The `dist/` folder contains the complete static website.

## Hosting

### From Your Laptop (Local Network)

```bash
npm run build
npx serve dist -l 3000
```

Anyone on your local network can access the app at `http://<your-local-ip>:3000`.

### Making It Internet-Accessible

#### Option A: Cloudflare Tunnel (Recommended)

```bash
# Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
cloudflared tunnel --url http://localhost:3000
```

This gives you a public `https://` URL. No port forwarding needed.

#### Option B: ngrok

```bash
npx ngrok http 3000
```

#### Option C: Static Hosting

Upload the `dist/` folder to any static host:
- **Netlify**: Drag & drop the `dist/` folder
- **Vercel**: `npx vercel dist/`
- **GitHub Pages**: Push `dist/` to a `gh-pages` branch
- **Any web server**: Serve the `dist/` folder as static files

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `pdf-lib` | 1.17.1 | PDF manipulation (merge, split, rotate, create) |
| `pdfjs-dist` | 4.9.155 | PDF rendering (thumbnails, previews, image export) |
| `sortablejs` | 1.15.6 | Drag-to-reorder file lists and pages |
| `vite` | 6.3.5 | Build tool (dev only) |

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Fully supported (primary target) |
| Edge 90+ | ✅ Fully supported |
| Firefox 90+ | ✅ Supported |
| Safari 15+ | ⚠️ Should work (not primary target) |
| Mobile Chrome | ⚠️ Works but desktop-optimized |

## Architecture

```
User's Browser
├── Website UI (HTML/CSS/JS loaded from server)
├── PDF selected/dropped into browser
├── Client-side PDF engine (pdf-lib + PDF.js)
├── Processing on user's CPU/RAM
├── Result generated as Blob
└── Download to user's device

Server (your laptop or any static host)
├── Serves HTML/CSS/JS files
├── Does NOT receive PDF files
├── Does NOT process PDFs
└── Does NOT store user data
```

## Project Structure

```
pdfweb/
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.js          # Build config
├── public/favicon.svg      # Favicon
├── src/
│   ├── main.js             # Router, theme, init
│   ├── styles/             # Design system
│   │   ├── variables.css   # Design tokens, themes
│   │   ├── base.css        # Reset, typography
│   │   ├── components.css  # Shared component styles
│   │   └── tools.css       # Tool-specific layouts
│   ├── components/         # Shared UI
│   │   ├── Shell.js        # Header, nav, privacy badge
│   │   └── icons.js        # Inline SVG icons
│   ├── tools/              # Tool views
│   │   ├── home.js
│   │   ├── merge.js
│   │   ├── split.js
│   │   ├── pages.js
│   │   ├── pdf-to-image.js
│   │   ├── image-to-pdf.js
│   │   └── compress.js
│   ├── pdf/                # PDF engine layer
│   │   ├── engine.js       # pdf-lib operations
│   │   ├── renderer.js     # PDF.js rendering
│   │   └── compressor.js   # Compression pipeline
│   └── utils/              # Utilities
│       ├── file-utils.js
│       ├── download.js
│       ├── page-range-parser.js
│       └── error-handler.js
└── docs/
    ├── README.md           # This file
    ├── PRIVACY.md
    └── TESTING.md
```

## Known Limitations

1. **Compression converts pages to images** — The compress tool re-renders pages as JPEG images. Text becomes non-selectable in the output. This is clearly communicated in the UI.
2. **Very large PDFs (500MB+) blocked** — Browser memory constraints limit processing of extremely large files.
3. **Password-protected PDFs** — Some operations may fail on encrypted PDFs. A clear error message is shown.
4. **No offline support yet** — The app requires network access to load initially (future PWA support planned).
5. **No ZIP downloads** — Split and batch operations trigger individual file downloads.

## Next Milestone

- [ ] Web Worker for heavy operations (currently runs on main thread)
- [ ] Smart compression (preserve text, only recompress embedded images)
- [ ] ZIP download for batch operations
- [ ] PWA / offline support
- [ ] OCR support
- [ ] Watermark tool
- [ ] PDF metadata editor
