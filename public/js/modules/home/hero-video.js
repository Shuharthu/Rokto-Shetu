/**
 * @file hero-video.js
 * @description Controller for the background video hero: autoplay management,
 * IntersectionObserver viewport tracking, tab visibility listeners, Save-Data
 * and prefers-reduced-motion gating, and accessible play/pause controls.
 */

import { t, getLanguage } from '../../core/i18n.js';

export class HeroVideoController {
  constructor(videoElementId = 'heroBgVideo', toggleBtnId = 'btnToggleHeroVideo') {
    this.video = document.getElementById(videoElementId);
    this.toggleBtn = document.getElementById(toggleBtnId);
    this.heroSection = document.getElementById('heroSection');
    this.observer = null;
    this.isManualPaused = false;
    this.isTabHidden = false;
    this.isOutOfView = false;
  }

  init() {
    if (!this.video) return;

    // 1. Accessibility & Network Data Constraints
    const urlParams = new URLSearchParams(window.location.search);
    const videoTimeParam = urlParams.get('videoTime');
    if (videoTimeParam !== null) {
      this.video.currentTime = parseFloat(videoTimeParam);
      this.video.pause();
      this.updateBtnState(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || urlParams.get('simulateReducedMotion') === '1';
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSaveData = (connection && (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) || urlParams.get('simulateSaveData') === '1';

    if (prefersReducedMotion || isSaveData) {
      // Respect user motion and data preferences: pause and do not load stream
      this.video.pause();
      this.video.removeAttribute('autoplay');
      this.video.style.display = 'none';
      if (this.toggleBtn) {
        this.toggleBtn.style.display = 'none';
      }
      return;
    }

    // 2. Playback Attempt with Silent Graceful Fallback
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked by browser policy: gracefully remain on poster
        this.updateBtnState(true);
      });
    }

    // 3. Setup IntersectionObserver: Pause when scrolled out of view
    if ('IntersectionObserver' in window && this.heroSection) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isOutOfView = !entry.isIntersecting;
          this.evaluatePlayback();
        });
      }, { threshold: 0.15 });

      this.observer.observe(this.heroSection);
    }

    // 4. Tab Visibility Listener: Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isTabHidden = document.hidden;
      this.evaluatePlayback();
    });

    // 5. User Manual Toggle Button (Layer 3)
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        if (this.video.paused) {
          this.isManualPaused = false;
          this.video.play().then(() => this.updateBtnState(false)).catch(() => {});
        } else {
          this.isManualPaused = true;
          this.video.pause();
          this.updateBtnState(true);
        }
      });
    }
  }

  evaluatePlayback() {
    if (!this.video) return;
    if (this.isManualPaused) return;

    if (this.isTabHidden || this.isOutOfView) {
      if (!this.video.paused) {
        this.video.pause();
      }
    } else {
      if (this.video.paused) {
        this.video.play().catch(() => {});
      }
    }
  }

  updateBtnState(isPaused) {
    if (!this.toggleBtn) return;
    this.toggleBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
    const pauseIcon = this.toggleBtn.querySelector('.pause-icon');
    const playIcon = this.toggleBtn.querySelector('.play-icon');
    const textSpan = this.toggleBtn.querySelector('.video-control-text');

    if (isPaused) {
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (playIcon) playIcon.style.display = 'inline-block';
      if (textSpan) textSpan.textContent = t('hero.playVideoText') || 'Play Video';
    } else {
      if (pauseIcon) pauseIcon.style.display = 'inline-block';
      if (playIcon) playIcon.style.display = 'none';
      if (textSpan) textSpan.textContent = t('hero.pauseVideoText') || 'Pause Video';
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.video) {
      this.video.pause();
    }
  }
}
