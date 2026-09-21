/**
 * Legal & Contact Pages / Modals — Privacy Policy, Terms, Contact Us
 * Inquiries delivered securely to Google Firebase
 */

import { icon } from './icons.js';
import { submitContactInquiry } from '../services/firebase-contact.js';

export function renderPrivacy(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="#/" title="Back to Home">${icon('chevronLeft')}</a>
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
            PDF Home uses browser <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">localStorage</code> strictly for user experience preferences:
          </p>
          <ul style="list-style:disc; margin-left:var(--space-5); margin-top:var(--space-2); display:flex; flex-direction:column; gap:var(--space-2)">
            <li>Your theme preference (Dark Mode or Light Mode).</li>
            <li>UI configuration toggles (such as organizer view state).</li>
          </ul>
          <p style="margin-top:var(--space-3)">
            No confidential document content, passwords, or document metadata are saved in permanent browser storage.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">4. Third-Party Libraries & Security</h2>
          <p>
            All client-side operations utilize audited, open-source web assemblies and standards including <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdf-lib</code>, <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">pdfjs-dist</code>, and <code style="background:var(--color-bg-tertiary); padding:2px 6px; border-radius:4px">tesseract.js</code>. No telemetry or covert telemetry beacons are embedded.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); color:var(--color-text-primary); margin-bottom:var(--space-3)">5. Contact & Support Desk</h2>
          <p>
            If you have questions, inquiries, or feedback regarding this Privacy Policy or data security, please reach out via our secure online contact desk:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="#/contact" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              Official PDF Home Support Desk
            </a>
          </div>
        </section>

      </div>
    </div>
  `;
}

export function renderTerms(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="#/" title="Back to Home">${icon('chevronLeft')}</a>
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
            By using PDF Home (https://pdfhome.pages.dev), you agree to these Terms of Service. If you disagree with any part of these terms, please discontinue using the service.
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
            <a href="#/contact" style="color:var(--color-accent); font-weight:600; text-decoration:none">
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
        <a class="tool-page__back" href="#/" title="Back to Home">${icon('chevronLeft')}</a>
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
              Thank you for reaching out, <strong>${name}</strong>. Your message was delivered to the PDF Home team. We will review your inquiry shortly.
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
