/**
 * Error handler — maps known error types to user-friendly messages.
 * Logs error details to browser console for easy debugging.
 */

/**
 * Classify an error and return a user-friendly message + title.
 * @param {Error|any} error
 * @returns {{ title: string, message: string }}
 */
export function classifyError(error) {
  // Always log full error trace to console for inspection in DevTools
  console.error('[PDF Home Processing Error]:', error);

  const rawMsg = error?.message || String(error || '');
  const msg = rawMsg.toLowerCase();

  // Password-protected PDF
  if (msg.includes('password') || msg.includes('encrypted') || msg.includes('decrypt')) {
    return {
      title: 'Password-Protected PDF',
      message: 'This PDF is password-protected. Please remove the password protection and try again.',
    };
  }

  // Detached buffer
  if (msg.includes('detached') || msg.includes('bytelength is 0') || msg.includes('zero length')) {
    return {
      title: 'Memory Refresh Needed',
      message: 'The file memory buffer was refreshed. Please re-select the file and try again.',
    };
  }

  // Corrupted or invalid PDF
  if (
    msg.includes('invalid pdf') ||
    msg.includes('corrupt') ||
    msg.includes('not a valid pdf') ||
    msg.includes('failed to parse') ||
    msg.includes('invalid header') ||
    msg.includes('missing pdf header') ||
    msg.includes('xref') ||
    msg.includes('trailer')
  ) {
    return {
      title: 'Invalid PDF File',
      message: 'This file appears to be corrupted or missing required PDF headers. Please verify the document.',
    };
  }

  // Memory limit issues
  if (
    msg.includes('out of memory') ||
    msg.includes('rangeerror') ||
    msg.includes('allocation failed') ||
    msg.includes('maximum call stack')
  ) {
    return {
      title: 'High-Volume Document Detected',
      message: 'This document is exceptionally large. For optimal performance and speed, consider processing in smaller sections.',
    };
  }

  // File type errors
  if (msg.includes('file type') || msg.includes('mime') || msg.includes('not a pdf')) {
    return {
      title: 'Unsupported File Format',
      message: 'This file format is not supported. Please select a valid PDF file.',
    };
  }

  // Worker errors
  if (msg.includes('worker') || msg.includes('script error')) {
    return {
      title: 'Worker Communication Error',
      message: 'A background rendering task timed out or was interrupted. Please refresh the page and try again.',
    };
  }

  // If there is a clean specific error message, include it
  const cleanDetail = rawMsg.length > 0 && rawMsg.length < 120 ? ` (${rawMsg})` : '';

  return {
    title: 'Processing Error',
    message: `An error occurred while processing this file${cleanDetail}. The file may use uncommon PDF features.`,
  };
}
