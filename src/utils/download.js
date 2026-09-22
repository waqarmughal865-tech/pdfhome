/**
 * Download utility — trigger browser downloads from Blob/ArrayBuffer data.
 * No network calls. Uses temporary <a> element + Blob URL.
 */

/**
 * Download a single Blob as a file.
 */
export function downloadBlob(blob, filename = 'download') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.setAttribute('download', filename);
  a.rel = 'noopener';
  
  // Stop propagation so document-level click interceptors never block this synthetic click
  a.addEventListener('click', (e) => e.stopPropagation());

  // Position offscreen with opacity 0 (NEVER set pointer-events: none because Chromium blocks .click()!)
  a.style.position = 'fixed';
  a.style.left = '-9999px';
  a.style.top = '-9999px';
  a.style.opacity = '0';
  
  document.body.appendChild(a);
  
  try {
    a.click();
  } catch (err) {
    // Fallback: programmatic MouseEvent dispatch
    const evt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
    a.dispatchEvent(evt);
  }

  // Cleanup after a generous delay (60s) so large files or slow downloads are never cancelled prematurely
  setTimeout(() => {
    try {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (e) {}
  }, 60000);
}

/**
 * Download an ArrayBuffer or Uint8Array as a file.
 */
export function downloadArrayBuffer(buffer, filename, mimeType = 'application/octet-stream') {
  if (!buffer) {
    console.error('downloadArrayBuffer: No buffer provided');
    return;
  }

  let blobData;
  if (buffer instanceof Blob) {
    blobData = buffer;
  } else if (buffer instanceof Uint8Array) {
    blobData = buffer;
  } else if (buffer instanceof ArrayBuffer) {
    blobData = new Uint8Array(buffer);
  } else {
    blobData = buffer;
  }

  const blob = (blobData instanceof Blob) ? blobData : new Blob([blobData], { type: mimeType || 'application/octet-stream' });
  downloadBlob(blob, filename);
}

/**
 * Download multiple blobs sequentially with a small delay between each.
 */
export async function downloadMultipleBlobs(blobs, filenames) {
  for (let i = 0; i < blobs.length; i++) {
    downloadBlob(blobs[i], filenames[i]);
    if (i < blobs.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}
