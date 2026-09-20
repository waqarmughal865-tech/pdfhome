/**
 * Page range parser — parse strings like "1-3,5,8-10" into arrays of page numbers.
 * All page numbers are 1-based (as users expect).
 */

/**
 * Parse a page range string into a sorted, deduplicated array of page numbers.
 * @param {string} input - Range string like "1-3,5,8-10"
 * @param {number} maxPage - Maximum valid page number
 * @returns {{ pages: number[], error?: string }}
 */
export function parsePageRanges(input, maxPage) {
  if (!input || !input.trim()) {
    return { pages: [], error: 'Please enter a page range.' };
  }

  const pages = new Set();
  const parts = input.split(',').map(s => s.trim()).filter(Boolean);
  
  for (const part of parts) {
    // Check if it's a range (e.g., "1-5")
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end)) {
        return { pages: [], error: `Invalid range: "${part}". Use numbers like "1-5".` };
      }
      if (start < 1 || end < 1) {
        return { pages: [], error: `Page numbers must be 1 or greater. Got: "${part}".` };
      }
      if (start > maxPage || end > maxPage) {
        return { pages: [], error: `Page ${Math.max(start, end)} exceeds the document's ${maxPage} pages.` };
      }
      if (start > end) {
        return { pages: [], error: `Invalid range: "${part}". Start must be ≤ end.` };
      }
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      // Single page number
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        return { pages: [], error: `Invalid page number: "${part}".` };
      }
      if (num < 1) {
        return { pages: [], error: `Page numbers must be 1 or greater. Got: "${part}".` };
      }
      if (num > maxPage) {
        return { pages: [], error: `Page ${num} exceeds the document's ${maxPage} pages.` };
      }
      pages.add(num);
    }
  }

  return { pages: Array.from(pages).sort((a, b) => a - b) };
}

/**
 * Format an array of page numbers back into a compact range string.
 * E.g., [1,2,3,5,8,9,10] → "1-3, 5, 8-10"
 */
export function formatPageRanges(pages) {
  if (!pages.length) return '';
  const sorted = [...pages].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}
