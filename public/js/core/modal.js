/**
 * @file modal.js
 * @description Accessible modal dialog manager with focus trapping and ARIA support.
 */

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.previousFocus = null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Opens a modal by element ID.
   * @param {string} modalId
   */
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.previousFocus = document.activeElement;
    this.activeModal = modal;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // Add ESC listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Trap focus inside modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  /**
   * Closes active modal.
   */
  close() {
    if (!this.activeModal) return;

    this.activeModal.classList.remove('open');
    this.activeModal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
    this.activeModal = null;
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }
}

export const modal = new ModalManager();
