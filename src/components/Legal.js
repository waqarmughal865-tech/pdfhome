/**
 * Legal & Contact Pages / Modals — Privacy Policy, Terms, Contact Us
 * Developer Contact: waqarahmed4071@gmail.com
 */

import { icon } from './icons.js';

export function renderPrivacy(container) {
  container.innerHTML = `
    <div class="legal-page" style="max-width:860px; margin:0 auto; padding:var(--space-8) var(--space-4)">
      <div class="tool-page__header" style="margin-bottom:var(--space-8)">
        <a class="tool-page__back" href="#/" title="Back to Home">${icon('chevronLeft')}</a>
        <div>
          <h1 class="tool-page__title">Privacy Policy</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            Last updated: September 2026 · Committed to absolute data privacy and security
          </p>
        </div>
      </div>

      <div class="legal-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-primary)">
        
        <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:var(--radius-lg); padding:var(--space-4) var(--space-5); display:flex; align-items:flex-start; gap:var(--space-3)">
          <div style="color:#16a34a; margin-top:2px">${icon('shieldCheck', 24)}</div>
          <div>
            <strong style="color:var(--color-text-primary); font-size:var(--text-base); display:block; margin-bottom:4px">
              Summary: Zero Data Retention & Complete In-Memory Execution
            </strong>
            <p style="margin:0; font-size:var(--text-sm); color:var(--color-text-secondary)">
              PDF Home is architected so that your documents are processed strictly within high-speed in-memory sessions. We do not transmit, inspect, store, or sell your documents to any external server or third party.
            </p>
          </div>
        </div>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">1. Information We Do Not Collect</h2>
          <p>
            Unlike traditional cloud PDF services that upload your confidential PDFs, contracts, tax documents, and financial records to third-party cloud storage buckets, PDF Home processes documents directly in-memory.
          </p>
          <ul style="padding-left:var(--space-5); margin:var(--space-2) 0">
            <li><strong>Your Document Contents:</strong> We never upload, view, parse, or store the contents of any PDF, Word DOCX, Excel XLSX, PowerPoint PPTX, or image you select.</li>
            <li><strong>Personal File Metadata:</strong> We do not log filenames, file sizes, authors, or timestamps to any database.</li>
            <li><strong>Personal Identity:</strong> You do not need to register, create an account, or provide payment details to use the platform.</li>
          </ul>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">2. How Your Files Are Processed</h2>
          <p>
            When you select or drop a file to edit, sign, convert, crop, watermark, or compress, all computations are performed in-memory utilizing WebAssembly and modern web standards. Once your session ends or you refresh the tab, the in-memory data is instantly released.
          </p>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">3. Analytics & Cookies</h2>
          <p>
            PDF Home uses minimal local browser storage solely to remember your chosen theme preference (Light or Dark mode). We do not deploy third-party advertising cookies or cross-site tracking beacons.
          </p>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">4. GDPR & CCPA Compliance</h2>
          <p>
            Because no personal information or user files are ever stored on our servers, PDF Home complies with the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA) by design.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">5. Contact & Data Officer</h2>
          <p>
            If you have questions, inquiries, or feedback regarding this Privacy Policy or data security, please contact:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="mailto:waqarahmed4071@gmail.com" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              waqarahmed4071@gmail.com
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
            Effective Date: September 2026
          </p>
        </div>
      </div>

      <div class="legal-card" style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-6); line-height:1.7; color:var(--color-text-primary)">
        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">1. Acceptance of Terms</h2>
          <p>
            By accessing and utilizing PDF Home, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion of these terms, you may cease use of the service.
          </p>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">2. Permitted Use</h2>
          <p>
            PDF Home provides tools for viewing, converting, signing, editing, and compressing documents. You may use our service for lawful personal, commercial, educational, and professional purposes.
          </p>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">3. Intellectual Property Rights</h2>
          <p>
            You retain 100% full ownership, copyright, and intellectual property rights to any document, image, or text you process through PDF Home. We assert no claims, licenses, or rights over your files.
          </p>
        </section>

        <section>
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">4. Disclaimer of Warranty</h2>
          <p>
            PDF Home is provided "as is" and "as available" without warranty of any kind, either express or implied. While we strive to maintain the highest fidelity in PDF formatting and Office conversions, users should review output files before critical legal or commercial submissions.
          </p>
        </section>

        <section style="border-top:1px solid var(--color-border); padding-top:var(--space-6)">
          <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-3)">5. Contact Information</h2>
          <p>
            For questions or enterprise integration support, reach out to:
          </p>
          <div style="margin-top:var(--space-3); display:inline-flex; align-items:center; gap:var(--space-3); background:var(--color-bg-primary); padding:var(--space-3) var(--space-5); border-radius:var(--radius-lg); border:1px solid var(--color-border)">
            ${icon('mail', 18)}
            <a href="mailto:waqarahmed4071@gmail.com" style="color:var(--color-accent); font-weight:600; text-decoration:none">
              waqarahmed4071@gmail.com
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
          <h1 class="tool-page__title">Contact Us</h1>
          <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-top:4px">
            We are here to help. Reach out directly for support, feedback, feature requests, or business inquiries.
          </p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-6)">
        
        <!-- Direct Contact Card -->
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; justify-content:space-between; gap:var(--space-6)">
          <div>
            <div style="width:48px; height:48px; border-radius:var(--radius-lg); background:rgba(99,102,241,0.1); color:var(--color-accent); display:flex; align-items:center; justify-content:center; margin-bottom:var(--space-4)">
              ${icon('mail', 24)}
            </div>
            <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-2)">Direct Email Support</h2>
            <p style="font-size:var(--text-sm); color:var(--color-text-secondary); margin-bottom:var(--space-4); line-height:1.6">
              Have a question about a conversion, feature suggestion, or need assistance? Email us directly for a rapid response.
            </p>
            
            <div style="background:var(--color-bg-primary); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:var(--space-4); display:flex; align-items:center; justify-content:space-between; gap:var(--space-3)">
              <div style="min-width:0; overflow:hidden">
                <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--color-text-tertiary); display:block">
                  Primary Contact Email
                </span>
                <span id="contact-email-text" style="font-size:var(--text-sm); font-weight:600; color:var(--color-text-primary); user-select:all">
                  waqarahmed4071@gmail.com
                </span>
              </div>
              <button class="btn btn-secondary btn-sm" id="copy-email-btn" title="Copy email address" style="gap:4px">
                ${icon('paperclip', 12)}
                <span id="copy-btn-label">Copy</span>
              </button>
            </div>
          </div>

          <div style="display:flex; gap:var(--space-3); flex-wrap:wrap">
            <a href="mailto:waqarahmed4071@gmail.com" class="btn btn-primary btn-lg" style="text-decoration:none; gap:var(--space-2)">
              ${icon('mail', 18)} Send Email
            </a>
          </div>
        </div>

        <!-- Privacy & Security Guarantee Card -->
        <div style="background:var(--color-bg-secondary); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:var(--space-8); display:flex; flex-direction:column; gap:var(--space-5)">
          <div style="width:48px; height:48px; border-radius:var(--radius-lg); background:rgba(34,197,94,0.1); color:#16a34a; display:flex; align-items:center; justify-content:center">
            ${icon('shieldCheck', 24)}
          </div>
          <div>
            <h2 style="font-size:var(--text-xl); font-weight:var(--weight-bold); margin-bottom:var(--space-2)">100% Private By Architecture</h2>
            <p style="font-size:var(--text-sm); color:var(--color-text-secondary); line-height:1.6; margin:0">
              Your security is our absolute priority. When you contact us or use any of our PDF tools, remember that your actual documents are never seen by anyone, including us.
            </p>
          </div>

          <div style="display:flex; flex-direction:column; gap:var(--space-3); font-size:var(--text-sm); color:var(--color-text-secondary); border-top:1px solid var(--color-border); padding-top:var(--space-4)">
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>Rapid response to support inquiries</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>Open to custom PDF & Office workflow requests</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px">
              ${icon('check', 16)} <span>High priority bug resolution & feature updates</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind copy button
  const copyBtn = container.querySelector('#copy-email-btn');
  const copyLabel = container.querySelector('#copy-btn-label');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('waqarahmed4071@gmail.com');
        if (copyLabel) copyLabel.textContent = 'Copied!';
        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy';
        }, 2000);
      } catch (err) {
        const range = document.createRange();
        const sel = window.getSelection();
        const el = container.querySelector('#contact-email-text');
        if (el) {
          range.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(range);
          document.execCommand('copy');
          if (copyLabel) copyLabel.textContent = 'Copied!';
          setTimeout(() => {
            if (copyLabel) copyLabel.textContent = 'Copy';
          }, 2000);
        }
      }
    });
  }
}
