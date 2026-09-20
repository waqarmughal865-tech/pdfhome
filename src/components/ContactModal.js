/**
 * Contact & Support Modal Component
 * Renders an interactive modal dialog allowing users to send messages directly to Firebase Realtime Database
 */

import { icon } from './icons.js';
import { submitContactInquiry } from '../services/firebase-contact.js';

let modalContainer = null;

export function initContactModal() {
  if (modalContainer) return;

  modalContainer = document.createElement('div');
  modalContainer.id = 'contact-modal-root';
  document.body.appendChild(modalContainer);

  // Global delegate listener for any element with data-open-contact
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-contact]');
    if (trigger) {
      e.preventDefault();
      openContactModal();
    }
  });

  // Check URL hash on load
  if (window.location.hash === '#/contact') {
    openContactModal();
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#/contact') {
      openContactModal();
    }
  });
}

export function openContactModal() {
  if (!modalContainer) initContactModal();

  modalContainer.innerHTML = `
    <div class="contact-modal-backdrop" id="contact-modal-backdrop">
      <div class="contact-modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        
        <header class="contact-modal-header">
          <div class="contact-modal-title-group">
            <span class="contact-modal-icon">${icon('mail', 20)}</span>
            <div>
              <h2 id="contact-modal-title" class="contact-modal-title">Contact & Support</h2>
              <p class="contact-modal-sub">Send us your inquiry, feedback, or feature requests</p>
            </div>
          </div>
          <button class="contact-modal-close" id="contact-close-btn" aria-label="Close dialog">
            ${icon('x', 20)}
          </button>
        </header>

        <div id="contact-form-container">
          <form id="contact-form" class="contact-form" novalidate>
            <!-- Honeypot anti-spam trap (invisible to humans) -->
            <div style="opacity:0; position:absolute; top:0; left:0; height:0; width:0; z-index:-1; overflow:hidden">
              <input type="text" name="company_website_url" id="contact-honeypot" tabindex="-1" autocomplete="off" />
            </div>

            <div class="contact-form-row">
              <div class="contact-form-group">
                <label for="contact-name" class="contact-label">Your Name <span class="req">*</span></label>
                <input type="text" id="contact-name" class="contact-input" placeholder="e.g. Sarah Connor" required autocomplete="name" maxlength="60" />
              </div>
              <div class="contact-form-group">
                <label for="contact-email" class="contact-label">Email Address <span class="req">*</span></label>
                <input type="email" id="contact-email" class="contact-input" placeholder="name@example.com" required autocomplete="email" maxlength="100" />
              </div>
            </div>

            <div class="contact-form-group">
              <label for="contact-subject" class="contact-label">Topic</label>
              <select id="contact-subject" class="contact-input contact-select">
                <option value="General Inquiry" selected>General Feedback & Inquiry</option>
                <option value="Feature Request">Feature Suggestion</option>
                <option value="Bug Report">Bug Report / Issue</option>
                <option value="Business Inquiry">Enterprise & Partnership</option>
                <option value="Help & Support">Help & Technical Support</option>
              </select>
            </div>

            <div class="contact-form-group">
              <div style="display:flex; justify-content:space-between; align-items:center">
                <label for="contact-message" class="contact-label">Message <span class="req">*</span></label>
                <span style="font-size:10px; color:var(--color-text-tertiary)">Max 1,000 characters</span>
              </div>
              <textarea id="contact-message" class="contact-input contact-textarea" rows="4" placeholder="How can we help you today? Please share your question or suggestions..." required maxlength="1000"></textarea>
            </div>

            <div id="contact-error-box" class="contact-alert contact-alert--error" style="display:none;"></div>

            <footer class="contact-modal-footer">
              <div class="contact-privacy-note">
                ${icon('checkCircle', 14)} Messages are delivered securely to our private admin desk.
              </div>
              <div class="contact-btn-group">
                <button type="button" class="btn btn-secondary" id="contact-cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="contact-submit-btn">
                  <span id="contact-submit-text">Send Message</span>
                  <span id="contact-submit-spinner" style="display:none;">${icon('refreshCw', 16)} Sending...</span>
                </button>
              </div>
            </footer>
          </form>
        </div>

      </div>
    </div>
  `;

  // Attach interactive events
  const backdrop = document.getElementById('contact-modal-backdrop');
  const closeBtn = document.getElementById('contact-close-btn');
  const cancelBtn = document.getElementById('contact-cancel-btn');
  const form = document.getElementById('contact-form');
  const errorBox = document.getElementById('contact-error-box');
  const submitBtn = document.getElementById('contact-submit-btn');
  const submitText = document.getElementById('contact-submit-text');
  const submitSpinner = document.getElementById('contact-submit-spinner');

  function closeModal() {
    if (modalContainer) modalContainer.innerHTML = '';
    // If opened via direct hash, revert back without reloading
    if (window.location.hash === '#/contact') {
      window.history.replaceState(null, '', '#/');
    }
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Escape key closes modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';

    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value;
    const honeypot = document.getElementById('contact-honeypot').value;

    // Loading UI state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline-flex';
    submitSpinner.classList.add('spin-animation');

    try {
      await submitContactInquiry({ name, email, subject, message, honeypot });

      // Render success card
      const formContainer = document.getElementById('contact-form-container');
      formContainer.innerHTML = `
        <div class="contact-success-card">
          <div class="contact-success-icon">
            ${icon('checkCircle', 48)}
          </div>
          <h3 class="contact-success-title">Thank You!</h3>
          <p class="contact-success-msg">
            Your message has been sent directly to the PDF Home team. We review all incoming messages and will get back to you at <strong>${email}</strong> if requested.
          </p>
          <button class="btn btn-primary" id="contact-success-close">
            Done
          </button>
        </div>
      `;
      document.getElementById('contact-success-close').addEventListener('click', closeModal);
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
