/**
 * Admin Dashboard Controller
 * Saudi Chinese Auto Parts Platform
 * Handles PIN Authentication, Direct Image Upload, Products CRUD, and Store Settings
 */

(function () {
  'use strict';

  function showToast(message, type = 'success') {
    if (window.PartsCatalog && typeof window.PartsCatalog.showToast === 'function') {
      window.PartsCatalog.showToast(message, type);
      return;
    }
    alert(message);
  }

  // 1. Username & Password Authentication & Login Handling
  function setupLogin() {
    const loginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    const rememberCheckbox = document.getElementById('admin-remember-me');
    const eyeBtn = document.getElementById('btn-toggle-password') || document.getElementById('btn-toggle-pin');
    const eyeIcon = document.getElementById('password-eye-icon') || document.getElementById('pin-eye-icon');
    const errorMsg = document.getElementById('login-error-msg');
    const logoutBtn = document.getElementById('btn-admin-logout');

    // Logout handling
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        if (!confirm('هل تريد تسجيل الخروج من لوحة الإدارة؟')) return;
        try {
          await fetch('/api/admin/logout', { method: 'POST' });
          window.location.reload();
        } catch (e) {
          console.error(e);
          window.location.reload();
        }
      });
    }

    if (!loginForm) return;

    // Toggle Password Visibility
    if (eyeBtn && eyeIcon) {
      eyeBtn.addEventListener('click', function () {
        const targetInput = passwordInput || document.getElementById('admin-pin-input');
        if (!targetInput) return;
        if (targetInput.type === 'password') {
          targetInput.type = 'text';
          eyeIcon.textContent = 'visibility_off';
        } else {
          targetInput.type = 'password';
          eyeIcon.textContent = 'visibility';
        }
      });
    }

    // Form Submit
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      const remember = rememberCheckbox ? rememberCheckbox.checked : true;

      // Legacy PIN support
      const pinInput = document.getElementById('admin-pin-input');
      const pin = pinInput ? pinInput.value.trim() : '';

      if (!username && !password && !pin) return;

      const submitBtn = document.getElementById('btn-login-submit');
      const btnSpan = submitBtn ? (submitBtn.querySelector('span:not(.material-symbols-outlined)') || submitBtn.querySelector('span')) : null;
      const originalText = btnSpan ? btnSpan.textContent : 'دخول إلى لوحة التحكم';

      if (submitBtn) {
        submitBtn.disabled = true;
        if (btnSpan) btnSpan.textContent = 'جاري التحقق...';
      }
      if (errorMsg) errorMsg.style.display = 'none';

      try {
        const payload = (username || password) ? { username, password, remember } : { pin };
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          window.location.reload();
        } else {
          if (errorMsg) {
            errorMsg.textContent = data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
            errorMsg.style.display = 'block';
          }
          if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
          } else if (pinInput) {
            pinInput.value = '';
            pinInput.focus();
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        if (errorMsg) {
          errorMsg.textContent = 'حدث خطأ في الاتصال بالخادم';
          errorMsg.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnSpan) btnSpan.textContent = originalText;
        }
      }
    });
  }

  // 2. Tab Switching
  function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetTab = this.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        const activePanel = document.getElementById(targetTab);
        if (activePanel) activePanel.classList.add('active');
      });
    });
  }

  // 3. Table Search
  function setupTableSearch() {
    const searchInput = document.getElementById('admin-search-input');
    const table = document.getElementById('admin-products-table');
    if (!searchInput || !table) return;

    const rows = table.querySelectorAll('tbody tr');

    searchInput.addEventListener('input', function () {
      const term = this.value.trim().toLowerCase();

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (!term || text.includes(term)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Helper: Upload Image (Base64) to Server
  async function uploadImageToServer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const base64Data = e.target.result;
        try {
          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64Data, filename: file.name })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            resolve(data.imageUrl);
          } else {
            reject(new Error(data.error || 'فشل رفع الصورة'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة'));
      reader.readAsDataURL(file);
    });
  }

  // 4. Modal: Add Product with Direct Image Upload
  function setupAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    const openBtn = document.getElementById('btn-open-add-product-modal');
    const closeBtn = document.getElementById('btn-close-add-modal');
    const cancelBtn = document.getElementById('btn-cancel-add-modal');
    const form = document.getElementById('form-add-product');

    // Image Upload Controls
    const dropzone = document.getElementById('add-image-dropzone');
    const fileInput = document.getElementById('add-image-file-input');
    const promptBox = document.getElementById('add-dropzone-prompt');
    const previewContainer = document.getElementById('add-preview-container');
    const previewImg = document.getElementById('add-preview-image');
    const removePreviewBtn = document.getElementById('btn-remove-add-preview');
    const imageUrlField = document.getElementById('add-image-url-field');

    if (!modal || !form) return;

    function openModal() {
      form.reset();
      resetImageUpload();
      modal.style.display = 'flex';
      const firstInput = form.querySelector('input[name="nameAr"]');
      if (firstInput) firstInput.focus();
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    function resetImageUpload() {
      if (fileInput) fileInput.value = '';
      if (imageUrlField) imageUrlField.value = '';
      if (previewImg) previewImg.src = '';
      if (previewContainer) previewContainer.style.display = 'none';
      if (promptBox) promptBox.style.display = 'flex';
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Image Drag & Drop / Click
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', function (e) {
        if (e.target.closest('#btn-remove-add-preview')) return;
        fileInput.click();
      });

      ['dragenter', 'dragover'].forEach(ev => {
        dropzone.addEventListener(ev, e => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(ev => {
        dropzone.addEventListener(ev, e => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          handleImageFile(files[0]);
        }
      });

      fileInput.addEventListener('change', function () {
        if (this.files && this.files.length > 0) {
          handleImageFile(this.files[0]);
        }
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        resetImageUpload();
      });
    }

    async function handleImageFile(file) {
      if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً، الحد الأقصى 10 ميجابايت', 'error');
        return;
      }

      // Show local thumbnail preview immediately
      const localUrl = URL.createObjectURL(file);
      previewImg.src = localUrl;
      promptBox.style.display = 'none';
      previewContainer.style.display = 'flex';

      showToast('جاري رفع الصورة إلى السيرفر...', 'info');

      try {
        const uploadedUrl = await uploadImageToServer(file);
        imageUrlField.value = uploadedUrl;
        showToast('تم رفع صورة القطعة بنجاح!', 'success');
      } catch (err) {
        console.error('Upload failed:', err);
        showToast(err.message || 'فشل رفع الصورة', 'error');
        resetImageUpload();
      }
    }

    // Form Submit
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const payload = {
        nameAr: formData.get('nameAr'),
        price: parseFloat(formData.get('price')),
        oldPrice: formData.get('oldPrice') ? parseFloat(formData.get('oldPrice')) : null,
        makeId: formData.get('makeId'),
        modelNameAr: formData.get('modelNameAr'),
        sectionId: formData.get('sectionId'),
        quality: formData.get('quality') || 'original',
        stockStatus: 'in_stock',
        descriptionAr: formData.get('descriptionAr') || '',
        imageUrl: imageUrlField.value.trim() || undefined
      };

      const submitBtn = document.getElementById('btn-submit-add-prod');
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري الإدراج والحفظ...';

      try {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('تمت إضافة قطعة الغيار بنجاح إلى الكتالوج!', 'success');
          closeModal();
          setTimeout(() => window.location.reload(), 800);
        } else {
          showToast(data.error || 'حدث خطأ أثناء إضافة القطعة', 'error');
        }
      } catch (err) {
        console.error('Add product error:', err);
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ وإدراج القطعة';
      }
    });
  }

  // 5. Modal: Edit Product
  function setupEditProductModal() {
    const modal = document.getElementById('modal-edit-product');
    const closeBtn = document.getElementById('btn-close-edit-modal');
    const cancelBtn = document.getElementById('btn-cancel-edit-modal');
    const form = document.getElementById('form-edit-product');

    const triggerImageBtn = document.getElementById('btn-trigger-edit-image');
    const editFileInput = document.getElementById('edit-image-file-input');
    const editPreviewImg = document.getElementById('edit-preview-image');
    const editImageUrlField = document.getElementById('edit-image-url-field');

    if (!modal || !form) return;

    function closeModal() {
      modal.style.display = 'none';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    // Edit button click in table rows
    document.addEventListener('click', async function (e) {
      const editBtn = e.target.closest('.btn-table-edit');
      if (!editBtn) return;

      const id = editBtn.getAttribute('data-id');
      editBtn.disabled = true;

      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`);
        const p = await res.json();

        if (res.ok && p) {
          // Populate fields
          document.getElementById('edit-prod-id').value = p.id;
          document.getElementById('edit-prod-name').value = p.nameAr || '';
          document.getElementById('edit-prod-price').value = p.price !== undefined ? p.price : '';
          document.getElementById('edit-prod-old-price').value = p.oldPrice || '';
          document.getElementById('edit-prod-make').value = p.makeId || '';
          document.getElementById('edit-prod-model-name').value = p.modelNameAr || '';
          document.getElementById('edit-prod-section').value = p.sectionId || '';
          document.getElementById('edit-prod-quality').value = p.quality || 'original';
          const editStockEl = document.getElementById('edit-prod-stock');
          if (editStockEl) editStockEl.value = p.stockStatus || 'in_stock';
          document.getElementById('edit-prod-desc').value = p.descriptionAr || '';

          const curImg = p.imageUrl || p.image || '/images/products/p20517155.jpg';
          editPreviewImg.src = curImg;
          editImageUrlField.value = curImg;

          modal.style.display = 'flex';
        } else {
          showToast('تعذر العثور على بيانات القطعة', 'error');
        }
      } catch (err) {
        console.error('Fetch edit product error:', err);
        showToast('خطأ في جلب بيانات القطعة', 'error');
      } finally {
        editBtn.disabled = false;
      }
    });

    // Image change handler in edit modal
    if (triggerImageBtn && editFileInput) {
      triggerImageBtn.addEventListener('click', () => editFileInput.click());

      editFileInput.addEventListener('change', async function () {
        if (this.files && this.files.length > 0) {
          const file = this.files[0];
          if (!file.type.startsWith('image/')) {
            showToast('يرجى اختيار ملف صورة صالح', 'error');
            return;
          }

          editPreviewImg.src = URL.createObjectURL(file);
          showToast('جاري رفع الصورة وتحديثها بالسيرفر...', 'info');

          try {
            const uploadedUrl = await uploadImageToServer(file);
            editImageUrlField.value = uploadedUrl;
            showToast('تم رفع الصورة بنجاح!', 'success');
          } catch (err) {
            console.error('Edit upload failed:', err);
            showToast(err.message || 'فشل رفع الصورة', 'error');
          }
        }
      });
    }

    // Submit Edit Form
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const id = document.getElementById('edit-prod-id').value;
      const formData = new FormData(form);
      const payload = {
        nameAr: formData.get('nameAr'),
        price: parseFloat(formData.get('price')),
        oldPrice: formData.get('oldPrice') ? parseFloat(formData.get('oldPrice')) : null,
        makeId: formData.get('makeId'),
        modelNameAr: formData.get('modelNameAr'),
        sectionId: formData.get('sectionId'),
        quality: formData.get('quality'),
        stockStatus: formData.get('stockStatus') || 'in_stock',
        descriptionAr: formData.get('descriptionAr') || '',
        imageUrl: editImageUrlField.value.trim()
      };

      const submitBtn = document.getElementById('btn-submit-edit-prod');
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري حفظ التعديلات...';

      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('تم تحديث بيانات القطعة والصورة بنجاح!', 'success');
          closeModal();
          setTimeout(() => window.location.reload(), 700);
        } else {
          showToast(data.error || 'فشل تحديث القطعة', 'error');
        }
      } catch (err) {
        console.error('Update product error:', err);
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'حفظ التعديلات';
      }
    });
  }

  // 6. Quick Inline Price, Stock, and Clean Delete Actions
  function setupInlineProductActions() {
    // Quick Inline Save button
    document.addEventListener('click', async function (e) {
      const saveBtn = e.target.closest('.btn-table-save');
      if (!saveBtn) return;

      const id = saveBtn.getAttribute('data-id');
      const row = saveBtn.closest('tr');
      if (!row) return;

      const priceInput = row.querySelector('.inline-price-input');
      const stockSelect = row.querySelector('.inline-stock-select');

      const price = parseFloat(priceInput.value);

      if (isNaN(price) || price <= 0) {
        showToast('يرجى إدخال سعر صحيح أكبر من صفر', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = '...';

      try {
        const payload = { price };
        if (stockSelect) payload.stockStatus = stockSelect.value;

        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(`تم حفظ السعر الجديد (${price} ر.س) بنجاح!`, 'success');
        } else {
          showToast(data.error || 'فشل التحديث', 'error');
        }
      } catch (err) {
        console.error('Update error:', err);
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'حفظ';
      }
    });

    // Clean Delete button (deletes product and its uploaded image file)
    document.addEventListener('click', async function (e) {
      const delBtn = e.target.closest('.btn-table-del');
      if (!delBtn) return;

      const id = delBtn.getAttribute('data-id');
      const row = delBtn.closest('tr');
      const name = row ? row.querySelector('td strong')?.textContent || id : id;

      if (!confirm(`هل أنت متأكد من حذف القطعة نهائياً: "${name}"؟\n(سيتم حذف كافة بياناتها وصورتها من السيرفر)`)) {
        return;
      }

      delBtn.disabled = true;

      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('تم حذف القطعة وتطهير ملفاتها من السيرفر بنجاح', 'info');
          if (row) {
            row.style.opacity = '0';
            row.style.transform = 'scale(0.95)';
            row.style.transition = 'all 0.3s ease';
            setTimeout(() => row.remove(), 300);
          }
        } else {
          showToast(data.error || 'فشل الحذف', 'error');
          delBtn.disabled = false;
        }
      } catch (err) {
        console.error('Delete error:', err);
        showToast('خطأ في الاتصال بالخادم', 'error');
        delBtn.disabled = false;
      }
    });
  }

  // 7. Store Settings & PIN Change Form
  function setupSettingsForm() {
    const form = document.getElementById('settings-form');
    const waInput = document.getElementById('set-whatsapp');
    const waLiveTest = document.getElementById('wa-live-test-btn');

    if (!form) return;

    if (waInput && waLiveTest) {
      waInput.addEventListener('input', function () {
        const cleanNum = this.value.replace(/[^0-9]/g, '');
        waLiveTest.href = `https://wa.me/${cleanNum}?text=${encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار عن توفر وسعر القطعة.')}`;
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const payload = {
        adminUsername: formData.get('adminUsername'),
        adminPassword: formData.get('adminPassword'),
        adminPin: formData.get('adminPin'),
        whatsappNumber: formData.get('whatsappNumber'),
        whatsappGreeting: formData.get('whatsappGreeting'),
        storeName: formData.get('storeName'),
        storeTagline: formData.get('storeTagline'),
        storeDescription: formData.get('storeDescription'),
        vatRate: parseFloat(formData.get('vatRate')) || 15,
        currency: formData.get('currency') || 'ر.س',
        phone: formData.get('phone') || '',
        email: formData.get('email') || ''
      };

      const submitBtn = document.getElementById('btn-save-settings');
      submitBtn.disabled = true;
      submitBtn.querySelector('span:last-child').textContent = 'جاري الحفظ...';

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('تم حفظ جميع الإعدادات ورمز PIN بنجاح وتطبيقها فوراً!', 'success');
        } else {
          showToast(data.error || 'حدث خطأ أثناء الحفظ', 'error');
        }
      } catch (err) {
        console.error('Settings save error:', err);
        showToast('خطأ في الاتصال بالخادم', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('span:last-child').textContent = 'حفظ جميع الإعدادات وتطبيقها فوراً';
      }
    });
  }

  // 8. Secondary Import Engine (Backup/Restore)
  function setupImportEngine() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-import-input');
    const previewArea = document.getElementById('import-preview-area');
    const previewCount = document.getElementById('preview-count');
    const previewContainer = document.getElementById('preview-table-container');
    const confirmBtn = document.getElementById('btn-confirm-import');

    if (!dropZone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('drop', e => {
      const files = e.dataTransfer.files;
      if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', function () {
      if (this.files.length) handleFile(this.files[0]);
    });

    let parsedItems = [];

    function handleFile(file) {
      const isJson = file.name.endsWith('.json');
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const content = e.target.result;
          if (isJson) {
            parsedItems = JSON.parse(content);
          } else {
            showToast('يدعم ملفات JSON للنسخ الاحتياطي', 'info');
            return;
          }

          if (!Array.isArray(parsedItems)) {
            showToast('ملف غير صالح', 'error');
            return;
          }

          previewCount.textContent = parsedItems.length;
          previewContainer.innerHTML = `<p class="p-3 text-sm text-gray-300">جاهز لاستيراد ${parsedItems.length} قطعة.</p>`;
          previewArea.style.display = 'block';
        } catch (err) {
          showToast('فشل قراءة الملف', 'error');
        }
      };
      reader.readAsText(file);
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async function () {
        if (!parsedItems.length) return;
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'جاري الاستيراد...';

        try {
          const res = await fetch('/api/admin/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: parsedItems, mode: 'append' })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`تم استيراد ${data.added || 0} قطعة بنجاح!`, 'success');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            showToast(data.error || 'فشل الاستيراد', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'تأكيد الاستيراد';
          }
        } catch (e) {
          showToast('خطأ في الاتصال بالخادم', 'error');
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'تأكيد الاستيراد';
        }
      });
    }
  }

  function init() {
    setupLogin();
    setupTabs();
    setupTableSearch();
    setupInlineProductActions();
    setupAddProductModal();
    setupEditProductModal();
    setupSettingsForm();
    setupImportEngine();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
