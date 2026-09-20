# Privacy & Data Flow

## Summary

**PDF Home processes all files entirely in your browser. No PDF data is ever sent to any server.**

## Technical Details

### What the Server Does
- Serves static HTML, CSS, and JavaScript files
- Serves font files (Inter, from Google Fonts CDN)
- Serves the favicon

### What the Server Does NOT Do
- Receive, process, or store PDF files
- Receive filenames or metadata
- Log PDF-related information
- Run a backend API for PDF processing
- Send PDF data to third-party services

### Data Flow

```
1. User visits the website
   → Browser downloads HTML/CSS/JS (one-time, cacheable)

2. User drops/selects a PDF file
   → File is read into browser memory via FileReader API
   → File never leaves the browser

3. Processing occurs
   → pdf-lib / PDF.js process the file in browser memory
   → Operations use the user's CPU and RAM
   → No network requests are made during processing

4. Result is generated
   → A new Blob is created in browser memory
   → User clicks "Download"
   → Browser saves the Blob to the user's disk

5. User navigates away or closes tab
   → Browser memory is released
   → No data persists on the server
```

### External Resources

The application loads these external resources (none contain PDF data):

| Resource | Purpose |
|----------|---------|
| Google Fonts (Inter) | Typography |
| PDF.js CMap files (jsDelivr CDN) | Character mapping for PDF text rendering |

**Neither of these resources receives any user data.**

### How to Verify

1. Open Chrome DevTools (F12)
2. Go to the **Network** tab
3. Clear the network log
4. Perform any PDF operation (merge, split, etc.)
5. Inspect all network requests
6. **You should see zero requests containing PDF data**

The only requests you'll see are:
- Initial page load (HTML/CSS/JS)
- Font files (if not cached)
- CMap files (if not cached, for text rendering)

### No Analytics or Telemetry

The MVP contains:
- No analytics scripts
- No tracking pixels
- No telemetry
- No error reporting to external services
- No cookies (except theme preference in localStorage)

### localStorage Usage

The only data stored in localStorage:
- `pdf-workspace-theme`: "light" or "dark" (theme preference)

No PDF data, filenames, or metadata are stored.
