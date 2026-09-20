# Testing Checklist

## Before Each Test Session

- [ ] Open Chrome DevTools → Network tab
- [ ] Clear network log
- [ ] Verify no PDF data appears in any network request during operations

---

## Tool: Merge PDF

- [ ] Upload 2+ PDF files
- [ ] Verify file names and page counts display correctly
- [ ] Drag to reorder files
- [ ] Remove a file from the list
- [ ] Click Merge — verify progress bar shows real progress
- [ ] Download merged PDF — verify it opens correctly
- [ ] Verify merged PDF contains pages from all source files in correct order
- [ ] Test with a single file (merge button should be disabled)
- [ ] Test with a corrupted file — verify friendly error message
- [ ] Test with a non-PDF file — verify rejection

## Tool: Split PDF

### All Pages Mode
- [ ] Upload a multi-page PDF
- [ ] Select "All Pages" mode
- [ ] Click Split — verify progress per page
- [ ] Download all pages — verify each is a valid single-page PDF

### Page Range Mode
- [ ] Enter range `1-3` — verify 3-page PDF output
- [ ] Enter range `2,4,7` — verify correct pages extracted
- [ ] Enter range `1-3,8-10` — verify correct pages
- [ ] Enter invalid range (e.g., `abc`) — verify error message
- [ ] Enter out-of-bounds range — verify error message

### Selected Pages Mode
- [ ] Click pages to select them
- [ ] Verify checkbox appears on selection
- [ ] Extract selected pages — verify output

## Tool: Page Manager

- [ ] Upload a PDF
- [ ] Verify sidebar thumbnails render
- [ ] Click a thumbnail — verify main preview updates
- [ ] Click Rotate — verify page rotates 90° in preview
- [ ] Click Delete — verify page is removed from sidebar
- [ ] Verify cannot delete last remaining page
- [ ] Drag to reorder pages in sidebar
- [ ] Click Save — verify downloaded PDF reflects changes
- [ ] Test with a single-page PDF

## Tool: PDF to Image

- [ ] Upload a PDF
- [ ] Default format JPG — convert all pages
- [ ] Verify images download and open correctly
- [ ] Switch to PNG — verify PNG output
- [ ] Adjust quality slider — verify it affects output size
- [ ] Select specific pages — verify only selected pages convert
- [ ] Test progress indicator

## Tool: Image to PDF

- [ ] Upload multiple JPG images
- [ ] Upload a PNG image
- [ ] Upload a WebP image — verify it converts correctly
- [ ] Drag to reorder images
- [ ] Remove an image
- [ ] Create PDF — verify all images appear in correct order
- [ ] Verify progress indicator
- [ ] Test with a non-image file — verify rejection

## Tool: Compress PDF

- [ ] Upload a PDF
- [ ] Select Low compression — compress and note file sizes
- [ ] Select Medium compression — compress and note file sizes
- [ ] Select High compression — compress and note file sizes
- [ ] Verify original and compressed sizes are displayed accurately
- [ ] Verify savings percentage
- [ ] Download compressed PDF — verify it opens
- [ ] Verify the info banner about text selectability is visible

---

## General Tests

### Error Handling
- [ ] Test with a corrupted PDF (truncate a PDF file manually)
- [ ] Test with a password-protected PDF
- [ ] Test with a 0-byte file
- [ ] Test with a very large file (100MB+)
- [ ] Verify no raw error messages or stack traces shown to user

### UI / UX
- [ ] Verify light theme looks correct
- [ ] Verify dark theme looks correct
- [ ] Toggle between themes — verify smooth transition
- [ ] Theme persists after page refresh
- [ ] System dark mode preference is detected on first visit
- [ ] Privacy badge is visible in header
- [ ] All navigation links work
- [ ] Back button returns to home page

### Responsive Design
- [ ] Test at 1440px width (desktop)
- [ ] Test at 1024px width (small desktop)
- [ ] Test at 768px width (tablet)
- [ ] Test at 375px width (mobile)

### Privacy Verification
- [ ] Open Network tab before any operation
- [ ] Merge PDFs — verify zero PDF data in network requests
- [ ] Split PDF — verify zero PDF data in network requests
- [ ] Compress PDF — verify zero PDF data in network requests
- [ ] Convert PDF to Image — verify zero PDF data in network requests
- [ ] Verify no analytics scripts are loaded
- [ ] Verify no external APIs are called with file data

### Browser Compatibility
- [ ] Chrome desktop — all features work
- [ ] Edge desktop — all features work
- [ ] Firefox desktop — all features work

### Performance
- [ ] Merge 10+ PDFs — UI remains responsive
- [ ] Process a 50-page PDF — verify progress updates
- [ ] Monitor Chrome Task Manager during large operations
