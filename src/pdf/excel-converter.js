/**
 * PDF ⇄ Excel (Spreadsheet .xlsx) Converter
 * 100% client-side tabular conversion without any server uploads.
 */

import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { loadPDFDocument } from './renderer.js';

/**
 * Escape XML strings and strictly sanitize illegal XML 1.0 characters.
 * According to XML 1.0 (Fifth Edition) §2.2:
 * Valid characters: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
 * Any control characters (\x00-\x08, \x0B-\x0C, \x0E-\x1F), noncharacters (\uFDD0-\uFDEF, \uFFFE, \uFFFF),
 * or unpaired surrogates cause Excel to throw:
 * "Replaced Part: /xl/worksheets/sheet1.xml part with XML error. Illegal xml character."
 */
function escapeXml(str) {
  if (str === null || str === undefined) return '';
  // 1. Remove XML 1.0 illegal characters and noncharacters
  const cleaned = String(str)
    .replace(/[^\u{9}\u{A}\u{D}\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '');

  // 2. Escape XML entity delimiters
  return cleaned
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get Excel column letter from zero-indexed column index (e.g. 0 -> A, 27 -> AB)
 */
function getColLetter(colIdx) {
  let letter = '';
  let temp = colIdx;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Convert PDF with tables/data into a Microsoft Excel (.xlsx) workbook.
 * @param {ArrayBuffer|Uint8Array} pdfBuffer
 * @param {function} [onProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function pdfToExcel(pdfBuffer, onProgress) {
  onProgress?.(1, 10, 'Analyzing PDF tables & layout');
  const pdfDoc = await loadPDFDocument(pdfBuffer);
  const total = pdfDoc.numPages;

  const rows = [];

  for (let p = 1; p <= total; p++) {
    onProgress?.(p, total, `Extracting table rows from page ${p}`);
    const page = await pdfDoc.getPage(p);
    const textContent = await page.getTextContent();
    const items = textContent.items || [];

    if (items.length === 0) continue;

    // 1. Group items into physical rows by baseline Y (tolerance: 4.5pt)
    const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
    const rawRowBuckets = [];
    let curBucket = [];
    let curY = null;

    for (const item of sorted) {
      const text = (item.str || '').trim();
      if (!text) continue;

      const y = item.transform[5];
      if (curY === null || Math.abs(curY - y) <= 4.5) {
        curBucket.push(item);
        if (curY === null) curY = y;
      } else {
        if (curBucket.length > 0) rawRowBuckets.push(curBucket);
        curBucket = [item];
        curY = y;
      }
    }
    if (curBucket.length > 0) rawRowBuckets.push(curBucket);

    // 2. In each row, merge horizontally adjacent text fragments (gap <= 10pt) into cell fragments
    const pageRowsWithCells = [];
    const allCellStarts = [];

    for (const bucket of rawRowBuckets) {
      bucket.sort((a, b) => a.transform[4] - b.transform[4]);

      const cellFragments = [];
      let curFragment = null;

      for (const it of bucket) {
        const str = (it.str || '').trim();
        if (!str) continue;

        const startX = it.transform[4];
        const approxWidth = it.width || (str.length * 6);
        const endX = startX + approxWidth;

        if (!curFragment) {
          curFragment = { startX, endX, text: str };
        } else if ((startX - curFragment.endX) <= 10) {
          curFragment.text += ' ' + str;
          curFragment.endX = Math.max(curFragment.endX, endX);
        } else {
          cellFragments.push(curFragment);
          allCellStarts.push(curFragment.startX);
          curFragment = { startX, endX, text: str };
        }
      }
      if (curFragment) {
        cellFragments.push(curFragment);
        allCellStarts.push(curFragment.startX);
      }

      if (cellFragments.length > 0) {
        pageRowsWithCells.push(cellFragments);
      }
    }

    if (pageRowsWithCells.length === 0) continue;

    // 3. Cluster allCellStarts across the page to establish global column boundaries
    allCellStarts.sort((a, b) => a - b);
    const colClusters = [];

    for (const x of allCellStarts) {
      const matchingCluster = colClusters.find(c => Math.abs(c.center - x) <= 24);
      if (matchingCluster) {
        matchingCluster.points.push(x);
        matchingCluster.minX = Math.min(matchingCluster.minX, x);
        matchingCluster.maxX = Math.max(matchingCluster.maxX, x);
        matchingCluster.center = matchingCluster.points.reduce((s, v) => s + v, 0) / matchingCluster.points.length;
      } else {
        colClusters.push({
          points: [x],
          minX: x,
          maxX: x,
          center: x
        });
      }
    }

    colClusters.sort((a, b) => a.center - b.center);

    // Merge adjacent clusters that are too close (< 18pt apart)
    const mergedClusters = [];
    for (const cl of colClusters) {
      if (mergedClusters.length === 0) {
        mergedClusters.push(cl);
      } else {
        const last = mergedClusters[mergedClusters.length - 1];
        if (cl.center - last.center < 18) {
          last.points.push(...cl.points);
          last.minX = Math.min(last.minX, cl.minX);
          last.maxX = Math.max(last.maxX, cl.maxX);
          last.center = last.points.reduce((s, v) => s + v, 0) / last.points.length;
        } else {
          mergedClusters.push(cl);
        }
      }
    }

    const numCols = Math.max(1, mergedClusters.length);

    // 4. Map each row's cells into the canonical global column indices
    for (const rowCells of pageRowsWithCells) {
      const mappedRow = new Array(numCols).fill('');

      for (const cell of rowCells) {
        let bestColIdx = 0;
        let minDistance = Infinity;

        for (let cIdx = 0; cIdx < numCols; cIdx++) {
          const cluster = mergedClusters[cIdx];
          const dist = Math.abs(cell.startX - cluster.center);
          if (dist < minDistance) {
            minDistance = dist;
            bestColIdx = cIdx;
          }
        }

        if (mappedRow[bestColIdx]) {
          mappedRow[bestColIdx] += ' ' + cell.text;
        } else {
          mappedRow[bestColIdx] = cell.text;
        }
      }

      if (mappedRow.some(c => c && c.trim())) {
        rows.push(mappedRow);
      }
    }

    // Add empty row separator between distinct pages if multi-page
    if (p < total && rows.length > 0) {
      rows.push(new Array(numCols).fill(''));
    }
  }

  onProgress?.(total, total, 'Constructing Excel workbook (.xlsx)');

  // Construct sheet1.xml with strict XML 1.0 compliance
  let maxColIdx = 0;
  let sheetDataXml = '';

  for (let r = 0; r < rows.length; r++) {
    const rowNum = r + 1;
    if (rowNum > 1048576) break; // Excel row limit

    const cells = rows[r];
    let rowXml = `    <row r="${rowNum}">`;
    let rowHasCells = false;

    for (let c = 0; c < cells.length; c++) {
      if (c >= 16384) break; // Excel column limit (XFD)
      if (c > maxColIdx) maxColIdx = c;

      const colLetter = getColLetter(c);
      const cellRef = `${colLetter}${rowNum}`;
      const rawText = (cells[c] || '').trim();
      if (!rawText) continue;

      // Filter illegal XML 1.0 characters
      const cleanRaw = rawText
        .replace(/[^\u{9}\u{A}\u{D}\u{20}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]/gu, '')
        .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '');

      if (!cleanRaw) continue;

      // Check if numeric / financial data
      let isNumeric = false;
      let numericVal = null;

      const cleanMoney = cleanRaw.replace(/[$€£¥₹\s]/g, '');
      if (/^\(?-?\d{1,3}(,\d{3})*(\.\d+)?\)?$/.test(cleanMoney) || /^-?\d+(\.\d+)?$/.test(cleanMoney)) {
        let parseTarget = cleanMoney;
        let isNegative = false;
        if (parseTarget.startsWith('(') && parseTarget.endsWith(')')) {
          isNegative = true;
          parseTarget = parseTarget.slice(1, -1);
        }
        parseTarget = parseTarget.replace(/,/g, '');
        const n = parseFloat(parseTarget);
        if (isFinite(n) && parseTarget.length <= 15) {
          isNumeric = true;
          numericVal = isNegative ? -n : n;
        }
      }

      if (isNumeric && numericVal !== null) {
        rowXml += `<c r="${cellRef}"><v>${numericVal}</v></c>`;
        rowHasCells = true;
      } else {
        // Enforce Excel cell character limit (32,767 chars)
        const safeText = cleanRaw.length > 32767 ? cleanRaw.slice(0, 32767) : cleanRaw;
        const escaped = escapeXml(safeText);
        rowXml += `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escaped}</t></is></c>`;
        rowHasCells = true;
      }
    }

    if (rowHasCells) {
      rowXml += '</row>\n';
      sheetDataXml += rowXml;
    }
  }

  const lastColLetter = getColLetter(maxColIdx);
  const dimensionRef = rows.length > 0 ? `A1:${lastColLetter}${rows.length}` : 'A1';

  // Calculate optimal column widths based on maximum content length
  const colWidths = [];
  for (let c = 0; c <= maxColIdx; c++) {
    let maxLen = 8;
    for (const r of rows) {
      if (r && r[c]) {
        maxLen = Math.max(maxLen, String(r[c]).length);
      }
    }
    colWidths.push(Math.min(50, Math.max(10, Math.round(maxLen * 1.2) + 2)));
  }

  const colsXml = colWidths.map((w, idx) =>
    `    <col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`
  ).join('\n');

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="${dimensionRef}"/>
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0" showGridLines="1"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="16"/>
  <cols>
${colsXml}
  </cols>
  <sheetData>
${sheetDataXml}  </sheetData>
</worksheet>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', rootRelsXml);
  zip.file('xl/workbook.xml', workbookXml);
  zip.file('xl/_rels/workbook.xml.rels', wbRelsXml);
  zip.file('xl/styles.xml', stylesXml);
  zip.file('xl/worksheets/sheet1.xml', sheetXml);

  return zip.generateAsync({ type: 'uint8array' });
}

/**
 * Convert Excel workbook (.xlsx) or CSV into a formatted PDF document.
 * @param {ArrayBuffer|Uint8Array} excelBuffer
 * @param {function} [onProgress]
 * @returns {Promise<Uint8Array>}
 */
export async function excelToPdf(excelBuffer, onProgress) {
  onProgress?.(1, 10, 'Opening Excel workbook');
  const zip = await JSZip.loadAsync(excelBuffer);
  const sheetFile = zip.file('xl/worksheets/sheet1.xml');

  if (!sheetFile) {
    throw new Error('Invalid Excel workbook: xl/worksheets/sheet1.xml not found.');
  }

  // Check shared strings table if available
  const sharedStrings = [];
  const sstFile = zip.file('xl/sharedStrings.xml');
  if (sstFile) {
    const sstXml = await sstFile.async('text');
    const parser = new DOMParser();
    const sstDoc = parser.parseFromString(sstXml, 'application/xml');
    const siNodes = sstDoc.getElementsByTagName('si');
    for (let i = 0; i < siNodes.length; i++) {
      sharedStrings.push(siNodes[i].textContent || '');
    }
  }

  onProgress?.(4, 10, 'Parsing rows and cells');
  const sheetXml = await sheetFile.async('text');
  const parser = new DOMParser();
  const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');
  const rowNodes = sheetDoc.getElementsByTagName('row');

  const rows = [];
  for (let i = 0; i < rowNodes.length; i++) {
    const rNode = rowNodes[i];
    const cNodes = rNode.getElementsByTagName('c');
    const rowCells = [];
    for (let j = 0; j < cNodes.length; j++) {
      const c = cNodes[j];
      const type = c.getAttribute('t');
      const vNode = c.getElementsByTagName('v')[0];
      const val = vNode ? vNode.textContent : '';

      if (type === 's' && sharedStrings[parseInt(val, 10)] !== undefined) {
        rowCells.push(sharedStrings[parseInt(val, 10)]);
      } else if (type === 'inlineStr') {
        const tNode = c.getElementsByTagName('t')[0];
        rowCells.push(tNode ? tNode.textContent : val);
      } else {
        rowCells.push(val);
      }
    }
    if (rowCells.some(cell => cell.trim() !== '')) {
      rows.push(rowCells);
    }
  }

  onProgress?.(7, 10, 'Rendering PDF spreadsheet table');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Landscape A4 for wide spreadsheets
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 40;
  const tableWidth = pageWidth - margin * 2;
  const rowHeight = 22;
  const fontSize = 9;

  let maxCols = 1;
  for (const r of rows) {
    maxCols = Math.max(maxCols, r.length);
  }
  const colWidth = Math.min(180, tableWidth / maxCols);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin - 30;

  // Title
  currentPage.drawText('Excel Spreadsheet Export', {
    x: margin,
    y: pageHeight - margin - 14,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.25),
  });

  for (let r = 0; r < rows.length; r++) {
    const isHeader = r === 0;
    const font = isHeader ? fontBold : fontRegular;

    if (currentY - rowHeight < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin - 20;
    }

    // Row background
    if (isHeader) {
      currentPage.drawRectangle({
        x: margin,
        y: currentY - rowHeight,
        width: colWidth * maxCols,
        height: rowHeight,
        color: rgb(0.92, 0.94, 0.98),
      });
    } else if (r % 2 === 1) {
      currentPage.drawRectangle({
        x: margin,
        y: currentY - rowHeight,
        width: colWidth * maxCols,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.99),
      });
    }

    // Cell content & grid lines
    const cells = rows[r];
    for (let c = 0; c < maxCols; c++) {
      const cellX = margin + c * colWidth;
      let val = (cells[c] || '').toString();

      // Clean string for pdf-lib Helvetica WinAnsi encoding
      val = val
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');

      // Border
      currentPage.drawRectangle({
        x: cellX,
        y: currentY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 0.5,
      });

      // Text (truncated with standard dots if exceeds colWidth)
      let displayVal = val;
      while (font.widthOfTextAtSize(displayVal, fontSize) > colWidth - 8 && displayVal.length > 3) {
        displayVal = displayVal.slice(0, -3) + '...';
      }

      try {
        currentPage.drawText(displayVal, {
          x: cellX + 4,
          y: currentY - rowHeight + 6,
          size: fontSize,
          font,
          color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2),
        });
      } catch (err) {
        // Fallback for unexpected glyphs
        const asciiOnly = displayVal.replace(/[^\x20-\x7E]/g, '?');
        currentPage.drawText(asciiOnly, {
          x: cellX + 4,
          y: currentY - rowHeight + 6,
          size: fontSize,
          font,
          color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.2, 0.2),
        });
      }
    }

    currentY -= rowHeight;
  }

  onProgress?.(10, 10, 'Finalizing PDF');
  return pdfDoc.save({ useObjectStreams: true });
}
