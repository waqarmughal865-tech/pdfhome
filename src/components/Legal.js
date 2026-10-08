/**
 * Legal & Contact Pages / Modals — Privacy Policy, Terms, Contact Us
 * Inquiries delivered securely to Google Firebase
 */

import { icon } from './icons.js';
import { submitContactInquiry } from '../services/firebase-contact.js';
import { escapeHtml } from '../utils/file-utils.js';

export function renderPrivacy(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Privacy Policy</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Effective Date: January 1, 2026 · Committed to 100% Client-Side In-Memory Execution
          </p>
        </div>
      </div>

      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">1. Introduction & In-Memory Architecture</h2>
          <p>
            PDF Home is designed from the ground up to protect your confidential documents, legal contracts, financial sheets, and signatures. All PDF editing, transparent handwritten signing, OCR text recognition, and bidirectional Office conversions execute <strong>100% in-memory within your local web browser session</strong>.
          </p>
          <p style="margin-top:var(--space-3)">
            <strong>We do not upload, transmit, store, or process your files on any remote server.</strong> Your files never leave your computer or phone.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">2. Information We Do Not Collect</h2>
          <ul style="list-style:disc; margin-left:var(--space-5); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>No file uploads: Documents, PDFs, Word DOCX, Excel spreadsheets, or presentation slides are never sent to remote cloud storage.</li>
            <li>No digital signature storage: Transparent signatures and custom stamps drawn on your screen are destroyed when your browser tab is closed.</li>
            <li>No OCR document storage: Scanned text recognition runs locally via in-browser Web Workers.</li>
            <li>No personal tracking: We do not sell, rent, or trade user data to third parties.</li>
          </ul>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">3. Local Storage Usage</h2>
          <p>
            PDF Home uses browser <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">localStorage</code> on your device to keep the site working smoothly and remember your choices:
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-2); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>Your theme preference (Dark Mode or Light Mode).</li>
            <li>UI configuration toggles (such as organizer view state).</li>
            <li>Your advertising-cookie choice for the consent banner (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdfhome-consent</code>).</li>
            <li>Contact-form support data: submission timestamps for rate limiting (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_history_v1</code>) and messages queued for delivery if you are offline (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_offline_queue</code>, which may include the name and email you typed). You can clear these at any time by clearing your browser's site data.</li>
          </ul>
          <p style="margin-top:var(--space-3)">
            No confidential document content, passwords, or document metadata are saved in permanent browser storage.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">4. Third-Party Libraries, Subprocessors & Network Destinations</h2>
          <p>
            All client-side document operations utilize audited, open-source web assemblies and standards including <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf-lib</code>, <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdfjs-dist</code>, and <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">tesseract.js</code>. To keep the core promise above honest: your <strong>document bytes</strong> never leave your browser, but loading and operating this website does involve the following third-party network destinations:
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2)">
            <li><strong>Google AdSense</strong> (pagead2.googlesyndication.com) — serves advertisements and may set advertising cookies/beacons, but <em>only</em> after you click "Accept" on our cookie-consent banner. If you reject or ignore the banner, no AdSense code is loaded at all.</li>
            <li><strong>Google Fonts</strong> (fonts.googleapis.com / fonts.gstatic.com) — font files are fetched per page view so the site renders correctly.</li>
            <li><strong>jsDelivr CDN</strong> (cdn.jsdelivr.net) — serves the tesseract.js and pdf.js worker files loaded at runtime when you use OCR or PDF rendering features.</li>
            <li><strong>Google Firebase Realtime Database</strong> (firebaseio.com) — receives only the messages you intentionally submit through our contact form: your name, email address, message, topic, and browser locale. It never receives document content.</li>
          </ul>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">5. Third-Party Advertising & Google AdSense Cookie Disclosure</h2>
          <p>
            We partner with third-party advertising networks, including <strong>Google AdSense</strong>, to serve advertisements when you visit our website. These advertising partners may use cookies, web beacons, and similar technologies to gather information (not including your name, address, email, or telephone number) about your visits to this and other websites in order to deliver relevant ads about goods and services of interest to you.
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to PDFHome and/or other sites on the Internet.</li>
            <li>You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style="color:var(--color-accent); text-decoration:underline">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendors' use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style="color:var(--color-accent); text-decoration:underline">aboutads.info</a>.</li>
          </ul>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">6. GDPR & CCPA Compliance</h2>
          <p>
            We respect the privacy rights of all visitors under the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Because our core document manipulation engine operates strictly client-side within your browser memory with zero file uploads or account profiling, we do not sell or share personal data derived from your files.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">7. Contact & Support Desk</h2>
          <p>
            If you have questions, inquiries, or feedback regarding this Privacy Policy, AdSense disclosures, or data security, please reach out via our secure online contact desk:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="/contact" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              Official PDF Home Support Desk
            </a>
          </div>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">8. Contact Data Retention & Deletion Requests</h2>
          <p>
            Messages submitted through our contact form are stored in our private Firebase Realtime Database (name, email address, message, topic, submission time, and browser locale) so our team can respond to your inquiry. We keep contact submissions only as long as needed to handle your request and maintain a support history, after which they are deleted.
          </p>
          <p style="margin-top:var(--space-3)">
            To request a copy or deletion of your contact submission, send a message through our <a href="/contact" style="color:var(--color-accent); text-decoration:underline">Support Desk</a> referencing the email address you used — we will honor deletion requests promptly. Messages you queued while offline (<code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf_contact_offline_queue</code>) stay only in your browser until delivered and can be removed by clearing site data.
          </p>
        </section>

      </div>
    </div>
  `;
}

export function renderTerms(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Terms of Service</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Effective Date: January 1, 2026 · Client-Side Document Platform Terms
          </p>
        </div>
      </div>

      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">1. Acceptance of Terms</h2>
          <p>
            By using PDF Home (https://pdfhome.site), you agree to these Terms of Service. If you disagree with any part of these terms, please discontinue using the service.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">2. Permitted Use & Ownership</h2>
          <p>
            PDF Home provides document utilities including digital signing, conversion to Word, Excel, and Slides, OCR text extraction, page reordering, watermark stamping, and encryption.
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-2); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>You retain 100% full legal ownership of all documents, images, and signatures processed with PDF Home.</li>
            <li>You agree not to use PDF Home to create counterfeit documents, forge signatures, or distribute malware.</li>
          </ul>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">3. In-Browser Execution & File Integrity</h2>
          <p>
            Because all file manipulations execute on your local CPU without server uploads, file processing speeds and export limits depend on your device's available memory. Always ensure you have backups of critical original documents before performing complex multi-page transformations.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">4. Disclaimer of Warranties</h2>
          <p>
            PDF Home is provided "as is", without warranty of any kind, express or implied. Under no circumstances shall the creators be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">5. Contact Information</h2>
          <p>
            For questions or enterprise integration support, reach out to our team:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="/contact" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              Official PDF Home Support Desk
            </a>
          </div>
        </section>
      </div>
    </div>
  `;
}

export function renderContact(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Contact & Support</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            We are here to help. Send us your inquiry, suggestions, or bug reports directly.
          </p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-6)">
        
        <!-- Interactive Firebase Contact Form Card -->
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-6); display:flex; flex-direction:column; gap:var(--space-4)">
          <div style="display:flex; align-items:center; gap:var(--space-3); margin-bottom:var(--space-2)">
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(99,102,241,0.1); color:var(--color-accent); display:flex; align-items:center; justify-content:center">
              ${icon('mail', 20)}
            </div>
            <div>
              <h2 style="font-size:var(--text-lg); font-weight:var(--weight-bold); margin:0; color:var(--color-text-primary)">Send a Message</h2>
              <p style="font-size:var(--text-xs); color:var(--color-text-secondary); margin:2px 0 0 0">Delivered directly to our admin desk</p>
            </div>
          </div>

          <div id="contact-page-form-wrapper">
            <form id="contact-page-form" class="contact-form" style="padding:0; gap:var(--space-3)" novalidate>
              <!-- Honeypot anti-spam trap -->
              <div style="opacity:0; position:absolute; top:0; left:0; height:0; width:0; z-index:-1; overflow:hidden">
                <input type="text" name="page_website_honeypot" id="page-contact-honeypot" tabindex="-1" autocomplete="off" />
              </div>

              <div class="contact-form-row">
                <div class="contact-form-group">
                  <label for="page-contact-name" class="contact-label">Your Name <span class="req">*</span></label>
                  <input type="text" id="page-contact-name" class="contact-input" placeholder="e.g. Alex Smith" required autocomplete="name" maxlength="60" />
                </div>
                <div class="contact-form-group">
                  <label for="page-contact-email" class="contact-label">Email Address <span class="req">*</span></label>
                  <input type="email" id="page-contact-email" class="contact-input" placeholder="name@example.com" required autocomplete="email" maxlength="100" />
                </div>
              </div>

              <div class="contact-form-group">
                <label for="page-contact-subject" class="contact-label">Topic</label>
                <select id="page-contact-subject" class="contact-input contact-select">
                  <option value="General Inquiry" selected>General Feedback & Inquiry</option>
                  <option value="Feature Request">Feature Suggestion</option>
                  <option value="Bug Report">Bug Report / Issue</option>
                  <option value="Business Inquiry">Enterprise & Partnership</option>
                  <option value="Help & Support">Help & Technical Support</option>
                </select>
              </div>

              <div class="contact-form-group">
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <label for="page-contact-message" class="contact-label">Message <span class="req">*</span></label>
                  <span style="font-size:10px; color:var(--color-text-tertiary)">Max 1,000 characters</span>
                </div>
                <textarea id="page-contact-message" class="contact-input contact-textarea" rows="4" placeholder="How can we help you? Feel free to ask a question or request a feature..." required maxlength="1000"></textarea>
              </div>

              <div id="page-contact-error" class="contact-alert contact-alert--error" style="display:none;"></div>

              <div style="display:flex; align-items:center; justify-content:space-between; gap:var(--space-3); margin-top:var(--space-2); flex-wrap:wrap">
                <div class="contact-privacy-note">
                  ${icon('shieldCheck', 14)} Secure Firebase delivery
                </div>
                <button type="submit" class="btn btn-primary" id="page-contact-submit" style="gap:var(--space-2)">
                  <span id="page-submit-text">Submit Message</span>
                  <span id="page-submit-spinner" style="display:none;">${icon('refreshCw', 14)} Sending...</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Privacy & Response Card -->
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-6); display:flex; flex-direction:column; justify-content:space-between; gap:var(--space-4)">
          <div>
            <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center; margin-bottom:var(--space-3)">
              ${icon('shieldCheck', 20)}
            </div>
            <h2 style="font-size:var(--text-lg); font-weight:var(--weight-bold); margin-bottom:var(--space-2); color:var(--color-text-primary)">Privacy Guarantee</h2>
            <p style="font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.6; margin:0">
              When you submit a message, it is transmitted securely to our private admin dashboard. Your email address is never shared, sold, or used for spam.
            </p>
          </div>

          <div style="display:flex; flex-direction:column; gap:var(--space-3); font-size:var(--text-sm); color:var(--color-text-secondary); border-top:1px solid var(--color-border); padding-top:var(--space-4)">
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>Timely response from core developers</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>Open to custom PDF & Office workflow requests</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>Continuous updates and feature rollouts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind Form Submit
  const form = container.querySelector('#page-contact-form');
  const errorBox = container.querySelector('#page-contact-error');
  const submitBtn = container.querySelector('#page-contact-submit');
  const submitText = container.querySelector('#page-submit-text');
  const submitSpinner = container.querySelector('#page-submit-spinner');
  const wrapper = container.querySelector('#contact-page-form-wrapper');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.style.display = 'none';

      const name = container.querySelector('#page-contact-name').value;
      const email = container.querySelector('#page-contact-email').value;
      const subject = container.querySelector('#page-contact-subject').value;
      const message = container.querySelector('#page-contact-message').value;
      const honeypot = container.querySelector('#page-contact-honeypot').value;

      submitBtn.disabled = true;
      submitText.style.display = 'none';
      submitSpinner.style.display = 'inline-flex';
      submitSpinner.classList.add('spin-animation');

      try {
        await submitContactInquiry({ name, email, subject, message, honeypot });

        wrapper.innerHTML = `
          <div class="contact-success-card" style="padding:var(--space-6) 0">
            <div class="contact-success-icon" style="color:#10b981">
              ${icon('checkCircle', 44)}
            </div>
            <h3 class="contact-success-title" style="font-size:var(--text-lg)">Message Received!</h3>
            <p class="contact-success-msg" style="font-size:var(--text-sm)">
              Thank you for reaching out, <strong>${escapeHtml(name)}</strong>. Your message was delivered to the PDF Home team. We will review your inquiry shortly.
            </p>
            <a href="#/" class="btn btn-secondary btn-sm" style="margin-top:var(--space-2)">
              Back to Home
            </a>
          </div>
        `;
      } catch (err) {
        errorBox.textContent = err.message || 'Failed to send message. Please try again.';
        errorBox.style.display = 'block';
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitSpinner.style.display = 'none';
        submitSpinner.classList.remove('spin-animation');
      }
    });
  }
}

export function renderAbout(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">About PDFHome</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Free PDF tools that respect your privacy — everything runs in your browser.
          </p>
        </div>
      </div>

      <div class="legal-page__content" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-secondary); font-size:var(--text-sm)">
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">What is PDFHome?</h2>
          <p>
            PDFHome is a free collection of PDF utilities that work entirely inside your web browser. Merge PDFs, split pages, compress files, convert to and from Word, Excel, PowerPoint and images, add page numbers, watermarks, passwords, digital signatures, and more — without installing software or creating an account.
          </p>
          <p style="margin-top:var(--space-3)">
            Most online PDF tools upload your documents to a remote server for processing. PDFHome was built on a different principle: <strong>your files never leave your device.</strong> Every operation runs locally in your browser's memory using modern web technology, and nothing is transmitted, stored, or seen by us.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">Why privacy-first?</h2>
          <p>
            PDFs often contain sensitive information — contracts, financial records, medical documents, legal filings, and personal identification. Uploading those files to a stranger's server just to merge two pages is an unnecessary risk. PDFHome eliminates that risk by design: there is no server-side processing, no file storage, and no document retention because your files are never sent anywhere.
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-3); display:flex; flex-direction:column; gap:var(--space-2)">
            <li><strong>No uploads:</strong> documents stay on your computer or phone.</li>
            <li><strong>No accounts:</strong> no sign-up, no email, no tracking profiles.</li>
            <li><strong>No watermarks or limits:</strong> the tools are free to use without restrictions.</li>
            <li><strong>Works offline-capable:</strong> once loaded, core processing does not depend on a network connection.</li>
          </ul>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">What you can do here</h2>
          <p>
            PDFHome includes tools for everyday document tasks: <a href="/merge-pdf" style="color:var(--color-accent)">merging</a> multiple PDFs into one, <a href="/split-pdf" style="color:var(--color-accent)">splitting</a> and extracting pages, <a href="/compress-pdf" style="color:var(--color-accent)">compressing</a> large files, <a href="/convert" style="color:var(--color-accent)">converting</a> between PDF, Word, Excel, PowerPoint and JPG, <a href="/pages" style="color:var(--color-accent)">organizing pages</a> with rotate, crop, page numbers, watermarks, digital signatures, and password protection, plus <a href="/ocr-pdf" style="color:var(--color-accent)">OCR text recognition</a> for scanned documents.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">How PDFHome is supported</h2>
          <p>
            PDFHome is free and will remain free. The site is supported by unobtrusive advertising. Ads are only loaded after you accept our cookie-consent banner — if you decline, the tools work exactly the same with no ads. You can change your choice at any time using the "Cookie Settings" link in the footer. Read our <a href="/privacy" style="color:var(--color-accent)">Privacy Policy</a> for full details.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">Get in touch</h2>
          <p>
            Found a bug, have a feature request, or need help? Reach us through the <a href="/contact" style="color:var(--color-accent)">Contact &amp; Support desk</a> — every message goes directly to the team behind PDFHome.
          </p>
        </section>
      </div>
    </div>
  `;
}
