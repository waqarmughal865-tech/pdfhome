/**
 * File utility functions — validation, sanitization, formatting.
 * No network calls. All operations are pure.
 */

const PDF_MIME = 'application/pdf';
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_WARN = 100 * 1024 * 1024;   // 100 MB
const MAX_FILE_SIZE_BLOCK = 500 * 1024 * 1024;  // 500 MB

/**
 * Validate a file's type against a list of allowed MIME types.
 * Also checks the extension as a fallback for files without a MIME.
 */
export function validateFileType(file, allowedTypes = [PDF_MIME]) {
  if (allowedTypes.includes(file.type)) return true;
  // Fallback: check extension
  const ext = getExtension(file.name);
  const extMap = {
    '.pdf': PDF_MIME,
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return allowedTypes.includes(extMap[ext]);
}

/**
 * Check file size and return a status.
 * @returns {{ ok: boolean, warn: boolean, message?: string }}
 */
export function checkFileSize(file) {
  if (file.size > MAX_FILE_SIZE_BLOCK) {
    return {
      ok: false,
      warn: false,
      message: `File is too large (${formatFileSize(file.size)}). Maximum supported size is ${formatFileSize(MAX_FILE_SIZE_BLOCK)}.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_WARN) {
    return {
      ok: true,
      warn: true,
      message: `Large file (${formatFileSize(file.size)}). Processing may be slow and use significant memory.`,
    };
  }
  return { ok: true, warn: false };
}

/**
 * Sanitize a filename — remove path separators, null bytes, and suspicious characters.
 */
export function sanitizeFilename(name) {
  if (!name) return 'file';
  return name
    .replace(/[/\\:*?"<>|]/g, '_')    // Remove dangerous chars
    .replace(/\x00/g, '')             // Remove null bytes
    .replace(/\.{2,}/g, '.')          // Collapse multiple dots
    .replace(/^\.+/, '')              // Remove leading dots
    .trim()
    || 'file';
}

/**
 * Format bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const val = bytes / Math.pow(k, i);
  return `${val < 10 ? val.toFixed(2) : val < 100 ? val.toFixed(1) : Math.round(val)} ${units[i]}`;
}

/**
 * Generate an output filename based on the original name and a suffix.
 */
export function generateOutputFilename(originalName, suffix, newExt) {
  const base = getBasename(originalName);
  const ext = newExt || getExtension(originalName) || '.pdf';
  return sanitizeFilename(`${base}_${suffix}${ext}`);
}

/**
 * Get filename without extension.
 */
export function getBasename(name) {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.substring(0, dotIndex) : name;
}

/**
 * Get extension including the dot.
 */
export function getExtension(name) {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.substring(dotIndex).toLowerCase() : '';
}

/**
 * Read a File object as an ArrayBuffer.
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${sanitizeFilename(file.name)}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read a File object as a data URL.
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${sanitizeFilename(file.name)}`));
    reader.readAsDataURL(file);
  });
}

export { PDF_MIME, IMAGE_MIMES, MAX_FILE_SIZE_WARN, MAX_FILE_SIZE_BLOCK };
