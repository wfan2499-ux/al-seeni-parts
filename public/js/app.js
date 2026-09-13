/**
 * Client Application Logic
 * Saudi Auto Spare Parts Platform
 * Handles dynamic models selector, OEM copying, sharing, and mobile filter drawer
 */

(function () {
  'use strict';

  let categoriesCache = null;

  // Fetch categories definition for dynamic make/model mapping
  async function getCategories() {
    if (categoriesCache) return categoriesCache;
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        categoriesCache = await res.json();
        return categoriesCache;
      }
    } catch (e) {
      console.warn('Failed to load categories dynamically:', e);
    }
    return null;
  }

  // Toast Notification Helper
  function showToast(message, type = 'success') {
    if (window.PartsCatalog && typeof window.PartsCatalog.showToast === 'function') {
      window.PartsCatalog.showToast(message, type);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Setup Dynamic Make -> Model Dropdowns
  async function setupMakeModelDropdowns() {
    const cats = await getCategories();
    if (!cats || !cats.makes) return;

    // 1. Homepage Quick Finder
    const finderMake = document.getElementById('finder-make');
    const finderModel = document.getElementById('finder-model');

    if (finderMake && finderModel) {
      finderMake.addEventListener('change', function () {
        const makeId = this.value;
        populateModels(finderModel, makeId, cats);
      });
    }

    // 2. Catalog Sidebar Filter
    const filterMake = document.getElementById('filter-make');
    const filterModel = document.getElementById('filter-model');

    if (filterMake && filterModel) {
      filterMake.addEventListener('change', function () {
        const makeId = this.value;
        populateModels(filterModel, makeId, cats);
      });
    }
  }

  function populateModels(selectEl, makeId, cats) {
    const prevValue = selectEl.getAttribute('data-selected') || '';
    selectEl.innerHTML = '<option value="">جميع الموديلات</option>';
    if (!makeId) return;

    const makeObj = cats.makes.find(m => m.id === makeId);
    if (!makeObj || !makeObj.models) return;

    makeObj.models.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      opt.textContent = `${mod.nameAr} (${mod.nameEn})`;
      if (mod.id === prevValue) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });
  }

  // Copy OEM Code to Clipboard with feedback
  function setupCopyOEM() {
    document.addEventListener('click', async function (e) {
      const copyBtn = e.target.closest('[data-copy]') || e.target.closest('.btn-copy-oem') || e.target.closest('.btn-copy-oem-lg');
      if (!copyBtn) return;

      e.preventDefault();
      e.stopPropagation();

      const oemCode = copyBtn.getAttribute('data-copy') || copyBtn.textContent.trim();
      if (!oemCode) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(oemCode);
        } else {
          // Fallback for non-https or older browser environments
          const textArea = document.createElement('textarea');
          textArea.value = oemCode;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        showToast(`تم نسخ رقم القطعة (OEM) بنجاح: ${oemCode}`, 'success');
      } catch (err) {
        console.error('Clipboard error:', err);
        showToast(`رقم القطعة: ${oemCode}`, 'info');
      }
    });
  }

  // Share Product Link
  function setupShareLink() {
    const shareBtn = document.getElementById('btn-share-link');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async function () {
      const url = this.getAttribute('data-url') || window.location.href;
      const title = document.title;

      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            url: url
          });
          return;
        } catch (e) {
          // User cancelled or share failed, fallback to copy
        }
      }

      // Fallback: Copy URL
      try {
        await navigator.clipboard.writeText(url);
        showToast('تم نسخ رابط القطعة إلى الحافظة بنجاح للمشاركة.', 'success');
      } catch (e) {
        showToast('انسخ الرابط من شريط العنوان في متصفحك.', 'info');
      }
    });
  }

  // Mobile Filter Drawer Toggle
  function setupMobileFilters() {
    const toggleBtn = document.getElementById('btn-toggle-filters');
    const closeBtn = document.getElementById('btn-close-sidebar');
    const sidebar = document.getElementById('catalog-sidebar');

    if (!sidebar) return;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        sidebar.classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        sidebar.classList.remove('sidebar-open');
        document.body.style.overflow = '';
      });
    }

    // Close when clicking outside content on mobile overlay
    sidebar.addEventListener('click', function (e) {
      if (e.target === sidebar) {
        sidebar.classList.remove('sidebar-open');
        document.body.style.overflow = '';
      }
    });
  }

  // Sort Dropdown Auto-submit
  function setupSortSelect() {
    const sortSelect = document.getElementById('catalog-sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function () {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', this.value);
      url.searchParams.set('page', '1');
      window.location.href = url.toString();
    });
  }

  // 1. Smart Mobile Header Motion (Hide on scroll down, Show on scroll up)
  function setupHeaderMotion() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
          const diff = currentScrollY - lastScrollY;

          // Only enable on mobile screen sizes
          if (window.innerWidth <= 768) {
            if (currentScrollY > 50 && diff > 6) {
              // Scrolling down: hide header smoothly
              header.style.transform = 'translateY(-100%)';
            } else if (diff < -6 || currentScrollY <= 15) {
              // Scrolling up: reveal header smoothly
              header.style.transform = 'translateY(0)';
            }
          } else {
            header.style.transform = '';
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // 2. Mobile Search Modal Handlers
  function setupSearchModal() {
    const openBtn = document.getElementById('btn-mobile-search');
    const closeBtn = document.getElementById('btn-close-search');
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-modal-input');

    if (!modal) return;

    function openSearch() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input && input.focus(), 80);
    }

    function closeSearch() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeSearch();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeSearch();
      }
    });
  }

  // 3. Mobile Cart Drawer & LocalStorage Manager
  function setupCartDrawer() {
    const openBtn = document.getElementById('btn-mobile-cart');
    const closeBtn = document.getElementById('btn-close-cart');
    const drawer = document.getElementById('cart-drawer');
    const badge = document.getElementById('mobile-cart-badge');
    const countTitle = document.getElementById('cart-count-title');
    const itemsContainer = document.getElementById('cart-items-container');
    const cartFooter = document.getElementById('cart-footer');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('btn-checkout-whatsapp');

    if (!drawer) return;

    function getCart() {
      try {
        return JSON.parse(localStorage.getItem('al_seeni_cart_v1')) || [];
      } catch (e) {
        return [];
      }
    }

    function saveCart(cart) {
      localStorage.setItem('al_seeni_cart_v1', JSON.stringify(cart));
      updateCartBadge();
    }

    function updateCartBadge() {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      if (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
      if (countTitle) countTitle.textContent = count;
    }

    function renderCart() {
      const cart = getCart();
      if (!itemsContainer) return;

      if (cart.length === 0) {
        itemsContainer.innerHTML = `
          <div class="py-8 text-center text-gray-500 text-xs flex-1">
            <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">remove_shopping_cart</span>
            <p class="font-bold text-gray-700 mb-1 text-sm">السلة فارغة حالياً</p>
            <p class="text-[11px] text-gray-400 mb-4">تصفح الكتالوج وأضف القطع التي تحتاجها لطلبها فوراً</p>
            <a href="/catalog" class="inline-block px-5 py-2 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-lg transition-colors">
              تصفح الكتالوج الآن
            </a>
          </div>
        `;
        if (cartFooter) cartFooter.classList.add('hidden');
        return;
      }

      let total = 0;
      const RIYAL_SVG_HTML = '<svg class="sar-symbol w-3.5 h-3.5 inline-block fill-current align-[-0.12em] shrink-0" viewBox="0 0 1125 1257" aria-label="ريال"><path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/></svg>';
      let html = '<div class="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto px-1">';
      cart.forEach((item, index) => {
        const itemTotal = (parseFloat(item.price) || 0) * (item.qty || 1);
        total += itemTotal;
        html += `
          <div class="py-3 flex items-center justify-between gap-3 text-right">
            <div class="flex-1">
              <h4 class="text-xs font-bold text-gray-900 leading-tight">${item.title}</h4>
              <div class="text-xs font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">${item.price} ${RIYAL_SVG_HTML}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-700">x${item.qty || 1}</span>
              <button type="button" class="text-red-500 hover:text-red-700 p-1 btn-remove-item" data-index="${index}">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          </div>
        `;
      });
      html += '</div>';

      itemsContainer.innerHTML = html;
      if (cartFooter) cartFooter.classList.remove('hidden');
      if (totalPriceEl) totalPriceEl.innerHTML = `${total.toFixed(2)} ${RIYAL_SVG_HTML}`;

      if (checkoutBtn) {
        let msg = 'السلام عليكم، أود إتمام طلب القطع التالية من السلة:\n\n';
        cart.forEach((item, i) => {
          msg += `${i + 1}. ${item.title} - الكمية: ${item.qty || 1} - السعر: ${item.price} ريال\n`;
        });
        const phone = (document.body.dataset.whatsapp || '966581194038').replace(/[^0-9]/g, '');
        checkoutBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }

      // Attach remove listeners
      itemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', function () {
          const idx = parseInt(this.getAttribute('data-index'), 10);
          const currentCart = getCart();
          currentCart.splice(idx, 1);
          saveCart(currentCart);
          renderCart();
          showToast('تمت إزالة القطعة من السلة', 'info');
        });
      });
    }

    function openCart() {
      renderCart();
      drawer.classList.remove('hidden');
      drawer.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      drawer.classList.add('hidden');
      drawer.classList.remove('flex');
      document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    drawer.addEventListener('click', function (e) {
      if (e.target === drawer) closeCart();
    });

    // Global Add-to-Cart click handler
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-add-to-cart');
      if (!btn) return;
      e.preventDefault();

      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title') || 'قطعة غيار';
      const price = parseFloat(btn.getAttribute('data-price')) || 0;

      const currentCart = getCart();
      const existing = currentCart.find(item => item.id === id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        currentCart.push({ id, title, price, qty: 1 });
      }
      saveCart(currentCart);
      showToast(`تمت إضافة "${title}" إلى السلة بنجاح`, 'success');
    });

    // Initialize badge
    updateCartBadge();
  }

  // Initialize all client components
  function init() {
    setupMakeModelDropdowns();
    setupCopyOEM();
    setupShareLink();
    setupMobileFilters();
    setupSortSelect();
    setupHeaderMotion();
    setupSearchModal();
    setupCartDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

