/**
 * Download utility — trigger browser downloads from Blob/ArrayBuffer data.
 * No network calls. Uses temporary <a> element + Blob URL.
 */

/**
 * Download a single Blob as a file.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Position offscreen instead of display:none (some browsers ignore click on display:none)
  a.style.position = 'fixed';
  a.style.left = '-9999px';
  a.style.top = '-9999px';
  a.style.opacity = '0';
  a.style.pointerEvents = 'none';
  
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
      URL.revokeObjectURL(url);
      if (a.parentNode) {
        document.body.removeChild(a);
      }
    } catch (e) {}
  }, 60000);
}

/**
 * Download an ArrayBuffer or Uint8Array as a file.
 */
export function downloadArrayBuffer(buffer, filename, mimeType = 'application/pdf') {
  if (!buffer) {
    console.error('downloadArrayBuffer: No buffer provided');
    return;
  }

  let arrayBuffer;
  if (buffer instanceof Uint8Array) {
    // Create an independent ArrayBuffer slice respecting byteOffset and byteLength
    arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } else if (buffer instanceof ArrayBuffer) {
    arrayBuffer = buffer.slice(0);
  } else {
    arrayBuffer = buffer;
  }

  const blob = new Blob([arrayBuffer], { type: mimeType });
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
