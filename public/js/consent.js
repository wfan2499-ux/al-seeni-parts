/**
 * Cookie & Privacy Consent Handler
 * Saudi Auto Spare Parts Platform
 * Complies with Saudi Personal Data Protection Law (PDPL)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'saudi_parts_consent_choice';

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3500);
  }

  function initConsentBanner() {
    const banner = document.getElementById('consent-banner');
    const acceptBtn = document.getElementById('btn-consent-accept');
    const declineBtn = document.getElementById('btn-consent-decline');
    const reopenBtn = document.getElementById('btn-reopen-consent');

    if (!banner) return;

    const currentChoice = localStorage.getItem(STORAGE_KEY);

    // Show banner only if no decision has been recorded yet
    if (!currentChoice) {
      banner.style.display = 'block';
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        banner.style.display = 'none';
        showToast('تم قبول ملفات تعريف الارتباط الأساسية لتحسين تجربة التصفح.', 'success');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        localStorage.setItem(STORAGE_KEY, 'declined');
        banner.style.display = 'none';
        showToast('تم حفظ اختيارك برفض ملفات تعريف الارتباط الإضافية.', 'info');
      });
    }

    if (reopenBtn) {
      reopenBtn.addEventListener('click', function () {
        banner.style.display = 'block';
        banner.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }

  // Expose global toast helper for other scripts
  window.PartsCatalog = window.PartsCatalog || {};
  window.PartsCatalog.showToast = showToast;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConsentBanner);
  } else {
    initConsentBanner();
  }
})();
