// src/pdf/slides-converter.js
// 100% Client-side bidirectional PDF <-> PowerPoint (PPTX) converter using JSZip and pdf-lib
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

/**
 * Convert PDF document to Microsoft PowerPoint Presentation (.pptx)
 * Renders each PDF page at high resolution and packages as individual PPTX slides
 * @param {Uint8Array} pdfBytes 
 * @param {Function} onProgress 
 * @returns {Promise<Uint8Array>} pptxBytes
 */
export async function pdfToSlides(pdfBytes, onProgress = () => {}) {
  onProgress(5, 'Loading PDF for Presentation conversion...');
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const zip = new JSZip();

  // PPTX Presentation Size (Standard 16:9 Widescreen: 12192000 x 6858000 EMUs)
  // 1 inch = 914400 EMUs, 1 pt = 12700 EMUs
  const slideWidthEMU = 12192000;
  const slideHeightEMU = 6858000;

  // 1. [Content_Types].xml
  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`;

  for (let i = 1; i <= numPages; i++) {
    contentTypesXml += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  }
  contentTypesXml += `\n</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  // 2. _rels/.rels
  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;
  zip.file('_rels/.rels', rootRelsXml);

  // 3. ppt/presentation.xml
  let sldIdLstXml = '';
  let presRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdMaster1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`;

  for (let i = 1; i <= numPages; i++) {
    sldIdLstXml += `\n    <p:sldId id="${255 + i}" r:id="rIdSlide${i}"/>`;
    presRelsXml += `\n  <Relationship Id="rIdSlide${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>`;
  }
  presRelsXml += `\n</Relationships>`;
  zip.file('ppt/_rels/presentation.xml.rels', presRelsXml);

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
                xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rIdMaster1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>${sldIdLstXml}
  </p:sldIdLst>
  <p:sldSz cx="${slideWidthEMU}" cy="${slideHeightEMU}" type="screen16x9"/>
  <p:notesSz cx="${slideHeightEMU}" cy="${slideWidthEMU}"/>
</p:presentation>`;
  zip.file('ppt/presentation.xml', presentationXml);

  // 4. Slide Master & Layout minimal definitions
  const slideMasterXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rIdLayout1"/>
  </p:sldLayoutIdLst>
  <p:txStyles/>
</p:sldMaster>`;
  zip.file('ppt/slideMasters/slideMaster1.xml', slideMasterXml);

  const slideMasterRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLayout1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', slideMasterRelsXml);

  const slideLayoutXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
             xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
             xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    </p:spTree>
  </p:cSld>
</p:sldLayout>`;
  zip.file('ppt/slideLayouts/slideLayout1.xml', slideLayoutXml);

  const slideLayoutRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdMaster" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', slideLayoutRelsXml);

  // 5. Render Each PDF Page to Slide Image and Slide XML
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pct = Math.round(15 + (pageNum / numPages) * 70);
    onProgress(pct, `Generating slide ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    // Render at high resolution (scale 2.0)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert canvas to image PNG binary
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const imageBuffer = await imageBlob.arrayBuffer();
    zip.file(`ppt/media/image${pageNum}.png`, imageBuffer);

    // Calculate picture dimensions in slide maintaining aspect ratio
    const pageAspect = viewport.width / viewport.height;
    const slideAspect = slideWidthEMU / slideHeightEMU;

    let picWidthEMU = slideWidthEMU;
    let picHeightEMU = slideHeightEMU;
    let offsetXEMU = 0;
    let offsetYEMU = 0;

    if (pageAspect > slideAspect) {
      // Page is wider than slide 16:9
      picWidthEMU = slideWidthEMU;
      picHeightEMU = Math.round(slideWidthEMU / pageAspect);
      offsetYEMU = Math.round((slideHeightEMU - picHeightEMU) / 2);
    } else {
      // Page is taller or portrait
      picHeightEMU = slideHeightEMU;
      picWidthEMU = Math.round(slideHeightEMU * pageAspect);
      offsetXEMU = Math.round((slideWidthEMU - picWidthEMU) / 2);
    }

    // Individual slide XML with picture element
    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" 
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" 
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="${pageNum + 1}" name="Slide Content ${pageNum}"/>
          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rIdImg1"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm>
            <a:off x="${offsetXEMU}" y="${offsetYEMU}"/>
            <a:ext cx="${picWidthEMU}" cy="${picHeightEMU}"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
    zip.file(`ppt/slides/slide${pageNum}.xml`, slideXml);

    const slideRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLayout" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${pageNum}.png"/>
</Relationships>`;
    zip.file(`ppt/slides/_rels/slide${pageNum}.xml.rels`, slideRelsXml);
  }

  onProgress(90, 'Packing PPTX presentation archive...');
  const pptxBlob = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  onProgress(100, 'PPTX slides ready!');
  return pptxBlob;
}

/**
 * Convert PowerPoint Presentation (.pptx) into a clean PDF document
 * Extracts slide texts, layouts, and embedded images
 * @param {Uint8Array} pptxBytes 
 * @param {Function} onProgress 
 * @returns {Promise<Uint8Array>} pdfBytes
 */
export async function slidesToPdf(pptxBytes, onProgress = () => {}) {
  onProgress(10, 'Reading PowerPoint archive...');
  const zip = await JSZip.loadAsync(pptxBytes);

  // Find all slide XML files
  const slideFiles = [];
  zip.forEach((relativePath) => {
    const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/i);
    if (match) {
      slideFiles.push({ path: relativePath, index: parseInt(match[1], 10) });
    }
  });

  slideFiles.sort((a, b) => a.index - b.index);

  if (slideFiles.length === 0) {
    throw new Error('No slides found in this PowerPoint presentation (.pptx).');
  }

  onProgress(25, 'Initializing PDF output...');
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Widescreen 16:9 standard PDF slide size (960 x 540 pt)
  const pageWidth = 960;
  const pageHeight = 540;

  for (let i = 0; i < slideFiles.length; i++) {
    const item = slideFiles[i];
    const pct = Math.round(25 + ((i + 1) / slideFiles.length) * 65);
    onProgress(pct, `Converting slide ${i + 1} of ${slideFiles.length}...`);

    const xmlContent = await zip.file(item.path).async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw background color (subtle dark/light slide theme)
    pdfPage.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.98, 0.98, 0.99)
    });

    // Check for images linked in this slide
    const relsPath = `ppt/slides/_rels/slide${item.index}.xml.rels`;
    const relsFile = zip.file(relsPath);
    let embeddedImg = null;

    if (relsFile) {
      const relsXml = await relsFile.async('string');
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const relNodes = relsDoc.getElementsByTagName('Relationship');
      for (let r = 0; r < relNodes.length; r++) {
        const target = relNodes[r].getAttribute('Target');
        if (target && (target.endsWith('.png') || target.endsWith('.jpeg') || target.endsWith('.jpg'))) {
          // Normalize media path
          const cleanPath = target.startsWith('../') ? target.replace('../', 'ppt/') : `ppt/slides/${target}`;
          const imgZipFile = zip.file(cleanPath);
          if (imgZipFile) {
            const imgBytes = await imgZipFile.async('uint8array');
            try {
              if (cleanPath.endsWith('.png')) {
                embeddedImg = await pdfDoc.embedPng(imgBytes);
              } else {
                embeddedImg = await pdfDoc.embedJpg(imgBytes);
              }
              break;
            } catch (err) {
              console.warn('Could not embed slide image:', err);
            }
          }
        }
      }
    }

    if (embeddedImg) {
      // Draw slide image fitted to slide area
      const imgAspect = embeddedImg.width / embeddedImg.height;
      let drawW = pageWidth;
      let drawH = pageHeight;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > (pageWidth / pageHeight)) {
        drawW = pageWidth;
        drawH = pageWidth / imgAspect;
        drawY = (pageHeight - drawH) / 2;
      } else {
        drawH = pageHeight;
        drawW = pageHeight * imgAspect;
        drawX = (pageWidth - drawW) / 2;
      }

      pdfPage.drawImage(embeddedImg, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    } else {
      // Extract textual paragraphs
      const pElements = xmlDoc.getElementsByTagName('a:p');
      let currentY = pageHeight - 80;
      let isFirstTitle = true;

      // Slide header bar
      pdfPage.drawRectangle({
        x: 40,
        y: pageHeight - 35,
        width: 120,
        height: 4,
        color: rgb(0.2, 0.45, 0.95)
      });

      // Slide number badge
      pdfPage.drawText(`SLIDE ${i + 1}`, {
        x: pageWidth - 100,
        y: pageHeight - 40,
        size: 11,
        font: fontBold,
        color: rgb(0.5, 0.55, 0.65)
      });

      for (let pIdx = 0; pIdx < pElements.length; pIdx++) {
        const pNode = pElements[pIdx];
        const tNodes = pNode.getElementsByTagName('a:t');
        let textContent = '';
        for (let t = 0; t < tNodes.length; t++) {
          textContent += tNodes[t].textContent + ' ';
        }
        textContent = textContent.trim();
        if (!textContent) continue;

        if (isFirstTitle) {
          pdfPage.drawText(textContent.slice(0, 90), {
            x: 60,
            y: currentY,
            size: 26,
            font: fontBold,
            color: rgb(0.1, 0.12, 0.18)
          });
          currentY -= 50;
          isFirstTitle = false;
        } else {
          if (currentY < 60) break;
          // Body bullet point
          pdfPage.drawCircle({
            x: 70,
            y: currentY + 4,
            size: 3,
            color: rgb(0.2, 0.45, 0.95)
          });
          pdfPage.drawText(textContent.slice(0, 110), {
            x: 85,
            y: currentY,
            size: 14,
            font: fontRegular,
            color: rgb(0.25, 0.28, 0.35)
          });
          currentY -= 28;
        }
      }

      if (isFirstTitle) {
        // Fallback if no text in shapes
        pdfPage.drawText(`Slide ${i + 1}`, {
          x: 60,
          y: pageHeight / 2,
          size: 28,
          font: fontBold,
          color: rgb(0.3, 0.35, 0.45)
        });
      }
    }
  }

  onProgress(95, 'Compiling presentation PDF...');
  const finalPdf = await pdfDoc.save();
  onProgress(100, 'PowerPoint conversion complete!');
  return finalPdf;
}
