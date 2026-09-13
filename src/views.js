// Views and Pages Renderers
const db = require('./db');
const { icons, layout, renderPartCard, renderRiyalSymbol, buildWhatsAppLink, cleanSaudiPhone, escapeHtml } = require('./templates');

// 1. Homepage (Minimalist Monochrome Architecture)
function renderHomePage() {
  const settings = db.getSettings();
  const categories = db.getCategories();
  const featuredParts = db.getAllProducts().filter(p => p.featured).slice(0, 9);

  const bodyContent = `
  <!-- Official Brands Hero Section in Gradient -->
  <section class="bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-white pt-8 pb-10 px-4 text-white border-b border-gray-200">
    <div class="max-w-6xl mx-auto">
      
      <!-- Section Header inside Gradient -->
      <div class="text-center mb-6">
        <h1 class="text-xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          العلامات الصينية المعتمدة
        </h1>
        <p class="text-xs md:text-sm text-gray-300 max-w-lg mx-auto font-normal">
          اختر علامتك التجارية لعرض القطع المخصصة مباشرة
        </p>
      </div>

      <!-- 4 Brands Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <!-- JAC -->
        <a href="/catalog?make=jac" class="bg-white border border-gray-200/80 hover:border-[#0B132B] rounded-xl p-4 flex items-center justify-center h-20 sm:h-22 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group" title="قطع غيار جاك (JAC)">
          <img src="/images/brands/jac.svg?v=real_v2" alt="JAC Motors" class="h-9 sm:h-10 max-w-[130px] sm:max-w-[145px] object-contain group-hover:scale-105 transition-transform">
        </a>

        <!-- FAW -->
        <a href="/catalog?make=faw" class="bg-white border border-gray-200/80 hover:border-[#0B132B] rounded-xl p-4 flex items-center justify-center h-20 sm:h-22 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group" title="قطع غيار فاو (FAW)">
          <img src="/images/brands/faw.svg?v=3d_emblem_v1" alt="FAW" class="h-8 sm:h-9 max-w-[130px] sm:max-w-[145px] object-contain group-hover:scale-105 transition-transform">
        </a>

        <!-- Great Wall / Haval -->
        <a href="/catalog?make=greatwall" class="bg-white border border-gray-200/80 hover:border-[#0B132B] rounded-xl p-4 flex items-center justify-center h-20 sm:h-22 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group" title="قطع غيار جريت وول وهافال (GWM & Haval)">
          <img src="/images/brands/greatwall.svg?v=real_v2" alt="Great Wall Motors" class="h-9 sm:h-10 max-w-[130px] sm:max-w-[145px] object-contain group-hover:scale-105 transition-transform">
        </a>

        <!-- Jetour -->
        <a href="/catalog?make=jetour" class="bg-white border border-gray-200/80 hover:border-[#0B132B] rounded-xl p-4 flex items-center justify-center h-20 sm:h-22 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group" title="قطع غيار جيتور (Jetour)">
          <img src="/images/brands/jetour.svg?v=real_v2" alt="Jetour" class="h-8 sm:h-9 max-w-[130px] sm:max-w-[145px] object-contain group-hover:scale-105 transition-transform">
        </a>
      </div>

    </div>
  </section>

  <!-- Mechanical Systems / Categories Grid (Realistic 3D Component Studio Cards) -->
  <section class="py-8 px-4 border-b border-[#e5e7eb] bg-[#f9fafb]">
    <div class="max-w-6xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-[#111827]">أقسام وأنظمة قطع الغيار</h2>
          <p class="text-xs text-[#6b7280]">تصفح القطع حسب الأنظمة الميكانيكية والكهربائية المعتمدة</p>
        </div>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        ${categories.sections.slice(0, 7).map(s => `
          <a href="/catalog?section=${s.id}" class="bg-white border border-[#e5e7eb] hover:border-black rounded-lg p-3 flex flex-col items-center justify-between text-center transition-all duration-200 group hover:shadow-sm">
            <div class="w-full aspect-square flex items-center justify-center p-2 mb-2">
              <img src="/images/categories/${s.id}.jpg?v=1" alt="${escapeHtml(s.nameAr)}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" loading="lazy">
            </div>
            <span class="text-xs font-bold text-[#111827] group-hover:text-black">${escapeHtml(s.nameAr)}</span>
          </a>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Featured Available Products Grid -->
  <section class="py-6 px-4 max-w-6xl mx-auto">
    <div class="flex items-center justify-end mb-4">
      <a href="/catalog" class="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B132B] hover:text-black hover:underline bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors">
        <span>عرض كامل الكتالوج (${db.getAllProducts().length} قطعة)</span>
        <span class="material-symbols-outlined text-[15px]">arrow_back</span>
      </a>
    </div>

    <!-- Product Grid: 2 Cols on mobile, 3 on tablet/desktop -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
      ${featuredParts.map(p => renderPartCard(p, `https://chinesepartscatalog.com/product/${p.slug}`)).join('')}
    </div>
  </section>

  <!-- Quick Direct RFQ Form (Simple, Flat, No Fake Claims) -->
  <section class="py-8 px-4 border-t border-[#e5e7eb] bg-[#f9fafb]" id="quick-rfq">
    <div class="max-w-2xl mx-auto bg-white border border-[#e5e7eb] rounded-lg p-6">
      <h3 class="text-base font-bold text-[#111827] mb-1">طلب تسعير خاص</h3>
      <p class="text-xs text-[#4b5563] mb-4">أدخل رقم القطعة أو رقم الهيكل أو اسم القطعة، وسنقوم بالرد عليك مباشرة بالسعر والتوفر عبر واتساب.</p>

      <form id="rfq-form" onsubmit="event.preventDefault(); submitDirectWhatsAppRfq();" class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-[#374151] mb-1">اسم القطعة المطلوبة / رقم الهيكل (VIN)</label>
          <input type="text" id="rfq-part" required placeholder="مثال: فحمات أمامية، كشافات ضباب، رديتر..." class="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded text-xs text-[#111827] focus:bg-white focus:border-black focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-medium text-[#374151] mb-1">السيارة والموديل وسنة الصنع</label>
          <input type="text" id="rfq-car" placeholder="مثال: هافال H6 موديل 2023" class="w-full h-9 px-3 bg-[#f9fafb] border border-[#e5e7eb] rounded text-xs text-[#111827] focus:bg-white focus:border-black focus:outline-none">
        </div>
        <button type="submit" class="w-full h-10 btn-whatsapp text-xs font-semibold flex items-center justify-center gap-2">
          ${icons.whatsapp}
          <span>إرسال الطلب عبر واتساب</span>
        </button>
      </form>

      <script>
        function submitDirectWhatsAppRfq() {
          const part = document.getElementById('rfq-part').value.trim();
          const car = document.getElementById('rfq-car').value.trim();
          if (!part) return;
          const phone = "${cleanSaudiPhone(settings.whatsappNumber || '966581194038')}";
          let msg = "السلام عليكم، أود طلب تسعير وتوفر القطعة التالية:\\n";
          msg += "القطعة / الكود: " + part + "\\n";
          if (car) msg += "السيارة والموديل: " + car + "\\n";
          msg += "وشكراً.";
          window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
        }
      </script>
    </div>
  </section>
  `;

  return layout({
    title: "الرئيسية",
    description: settings.storeDescription,
    canonicalUrl: "https://chinesepartscatalog.com/",
    activeNav: "home",
    bodyContent
  });
}

// 2. Catalog Page with multi-faceted search, filters, and pagination
function renderCatalogPage(queryObj = {}) {
  const settings = db.getSettings();
  const categories = db.getCategories();

  const query = queryObj.q || '';
  const make = queryObj.make || '';
  const model = queryObj.model || '';
  const year = queryObj.year || '';
  const section = queryObj.section || '';
  const quality = queryObj.quality || '';
  const minPrice = queryObj.minPrice || '';
  const maxPrice = queryObj.maxPrice || '';
  const inStock = queryObj.inStock === 'true' || queryObj.inStock === true;
  const sort = queryObj.sort || 'newest';
  const page = parseInt(queryObj.page, 10) || 1;

  const result = db.filterProducts({
    query,
    make,
    model,
    year,
    section,
    quality,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    inStock,
    sort,
    page,
    limit: 12
  });

  // Canonical & SEO URL
  const searchParams = new URLSearchParams();
  if (query) searchParams.set('q', query);
  if (make) searchParams.set('make', make);
  if (model) searchParams.set('model', model);
  if (year) searchParams.set('year', year);
  if (section) searchParams.set('section', section);
  if (quality) searchParams.set('quality', quality);
  if (sort && sort !== 'newest') searchParams.set('sort', sort);
  if (page > 1) searchParams.set('page', String(page));

  const currentSearchStr = searchParams.toString();
  const canonicalUrl = `https://saudichineseparts.com/catalog${currentSearchStr ? '?' + currentSearchStr : ''}`;

  // Find models for selected make
  const selectedMakeObj = categories.makes.find(m => m.id === make);
  const availableModels = selectedMakeObj ? selectedMakeObj.models : [];

  // Generate Pagination Links
  function buildPageUrl(p) {
    const sp = new URLSearchParams(searchParams);
    sp.set('page', String(p));
    return `/catalog?${sp.toString()}`;
  }

  // Smart Pagination Items (Ellipsis Windowing)
  function generatePaginationItems(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const items = [1];
    if (current > 3) items.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!items.includes(i)) items.push(i);
    }
    if (current < total - 2) items.push('...');
    if (!items.includes(total)) items.push(total);
    return items;
  }

  const bodyContent = `
  <div class="catalog-page-wrapper">
    <div class="container">
      
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="مسار التصفح">
        <a href="/">الرئيسية</a>
        <span class="sep">/</span>
        <span class="current">كتالوج قطع الغيار</span>
        ${make && selectedMakeObj ? `<span class="sep">/</span><span>${selectedMakeObj.nameAr}</span>` : ''}
        ${section ? `<span class="sep">/</span><span>${(categories.sections.find(s => s.id === section) || {}).nameAr || section}</span>` : ''}
      </nav>

      <div class="catalog-title-bar">
        <div>
          <h1 class="catalog-main-title">
            ${query ? `نتائج البحث عن: "${escapeHtml(query)}"` : 'كتالوج قطع الغيار الصينية'}
          </h1>
          <p class="catalog-results-count">
            تم العثور على <strong>${result.totalCount}</strong> قطعة مطابقة لمواصفات البحث
          </p>
        </div>

        <!-- Mobile Filter Toggle Button -->
        <button type="button" class="btn-toggle-mobile-filters" id="btn-toggle-filters">
          ${icons.filter}
          <span>تصفية النتائج (${result.totalCount})</span>
        </button>
      </div>

      <!-- Catalog Main Layout (Sidebar + Results) -->
      <div class="catalog-layout">
        
        <!-- Filter Sidebar -->
        <aside class="catalog-sidebar" id="catalog-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-title">${icons.filter} تصفية متقدمة</span>
            <button type="button" class="btn-close-sidebar" id="btn-close-sidebar" aria-label="إغلاق التصفية">
              ${icons.close}
            </button>
          </div>

          <form action="/catalog" method="GET" id="catalog-filters-form">
            <!-- Search Keyword -->
            <div class="filter-group">
              <label class="filter-label" for="filter-q">بحث بالاسم أو نوع السيارة</label>
              <input type="search" name="q" id="filter-q" value="${escapeHtml(query)}" placeholder="مثال: فحمات، كشاف، مساعد..." class="filter-input">
            </div>

            <!-- Make Filter -->
            <div class="filter-group">
              <label class="filter-label" for="filter-make">الشركة المصنعة</label>
              <select name="make" id="filter-make" class="filter-select">
                <option value="">جميع الشركات</option>
                ${categories.makes.map(m => `<option value="${m.id}" ${make === m.id ? 'selected' : ''}>${m.nameAr} (${m.nameEn})</option>`).join('')}
              </select>
            </div>

            <!-- Model Filter -->
            <div class="filter-group">
              <label class="filter-label" for="filter-model">موديل السيارة</label>
              <select name="model" id="filter-model" class="filter-select">
                <option value="">جميع الموديلات</option>
                ${availableModels.map(mod => `<option value="${mod.id}" ${model === mod.id ? 'selected' : ''}>${mod.nameAr} (${mod.nameEn})</option>`).join('')}
              </select>
            </div>

            <!-- Year Filter -->
            <div class="filter-group">
              <label class="filter-label" for="filter-year">سنة الصنع</label>
              <select name="year" id="filter-year" class="filter-select">
                <option value="">جميع السنوات</option>
                ${[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => `<option value="${y}" ${year === String(y) ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>

            <!-- Mechanical Section -->
            <div class="filter-group">
              <label class="filter-label" for="filter-section">القسم الميكانيكي</label>
              <select name="section" id="filter-section" class="filter-select">
                <option value="">جميع الأقسام</option>
                ${categories.sections.map(s => `<option value="${s.id}" ${section === s.id ? 'selected' : ''}>${s.nameAr}</option>`).join('')}
              </select>
            </div>

            <!-- Quality Filter -->
            <div class="filter-group">
              <label class="filter-label" for="filter-quality">مستوى الجودة</label>
              <select name="quality" id="filter-quality" class="filter-select">
                <option value="">الكل</option>
                <option value="original" ${quality === 'original' ? 'selected' : ''}>أصلي وكالة</option>
                <option value="commercial_grade_a" ${quality === 'commercial_grade_a' ? 'selected' : ''}>تجاري درجة أولى</option>
              </select>
            </div>

            <!-- In Stock Filter -->
            <div class="filter-group filter-checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" name="inStock" value="true" ${inStock ? 'checked' : ''}>
                <span>المتوفر بالمستودع فقط</span>
              </label>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <label class="filter-label flex items-center gap-1">نطاق السعر (${renderRiyalSymbol('w-3 h-3')})</label>
              <div class="price-inputs-row">
                <input type="number" name="minPrice" placeholder="من" value="${escapeHtml(minPrice)}" class="filter-input-sm" min="0">
                <span class="price-sep">-</span>
                <input type="number" name="maxPrice" placeholder="إلى" value="${escapeHtml(maxPrice)}" class="filter-input-sm" min="0">
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="filter-actions">
              <button type="submit" class="btn-apply-filters">تطبيق التصفية</button>
              <a href="/catalog" class="btn-reset-filters">إعادة ضبط</a>
            </div>
          </form>
        </aside>

        <!-- Catalog Results Column -->
        <main class="catalog-results-content">
          
          <!-- Sorting & Active Filters Toolbar -->
          <div class="catalog-toolbar">
            <div class="toolbar-sort">
              <label for="catalog-sort">ترتيب حسب:</label>
              <select id="catalog-sort" class="sort-select" onchange="window.location.href=this.value">
                <option value="${buildSortUrl('newest', searchParams)}" ${sort === 'newest' ? 'selected' : ''}>المميز والأحدث</option>
                <option value="${buildSortUrl('price-asc', searchParams)}" ${sort === 'price-asc' ? 'selected' : ''}>السعر: من الأقل للأعلى</option>
                <option value="${buildSortUrl('price-desc', searchParams)}" ${sort === 'price-desc' ? 'selected' : ''}>السعر: من الأعلى للأقل</option>
                <option value="${buildSortUrl('name-asc', searchParams)}" ${sort === 'name-asc' ? 'selected' : ''}>الاسم: أ - ي</option>
              </select>
            </div>
          </div>

          <!-- Products Grid or Empty State -->
          ${result.products.length > 0 ? `
            <div class="parts-grid catalog-grid">
              ${result.products.map(p => renderPartCard(p, `https://saudichineseparts.com/product/${p.slug}`)).join('')}
            </div>

            <!-- Pagination -->
            ${result.totalPages > 1 ? `
              <nav class="pagination-wrapper" aria-label="ترقيم الصفحات">
                ${result.currentPage > 1 ? `<a href="${buildPageUrl(result.currentPage - 1)}" class="page-link prev-link" aria-label="الصفحة السابقة"><span class="material-symbols-outlined text-[18px]">chevron_right</span> <span>السابق</span></a>` : `<span class="page-link disabled"><span class="material-symbols-outlined text-[18px]">chevron_right</span> <span>السابق</span></span>`}
                
                <div class="page-numbers">
                  ${generatePaginationItems(result.currentPage, result.totalPages).map(item => {
                    if (item === '...') {
                      return `<span class="page-ellipsis">…</span>`;
                    }
                    return `<a href="${buildPageUrl(item)}" class="page-number ${item === result.currentPage ? 'active' : ''}">${item}</a>`;
                  }).join('')}
                </div>

                ${result.currentPage < result.totalPages ? `<a href="${buildPageUrl(result.currentPage + 1)}" class="page-link next-link" aria-label="الصفحة التالية"><span>التالي</span> <span class="material-symbols-outlined text-[18px]">chevron_left</span></a>` : `<span class="page-link disabled"><span>التالي</span> <span class="material-symbols-outlined text-[18px]">chevron_left</span></span>`}
              </nav>
            ` : ''}
          ` : `
            <!-- Empty State with Helpful Suggestions & WhatsApp Call -->
            <div class="empty-state-card">
              <div class="empty-icon">${icons.search}</div>
              <h2 class="empty-title">لم نجد قطع غيار مطابقة لبحثك</h2>
              <p class="empty-desc">
                ربما تكون القطعة غير مسجلة بالاسم المدخل، تواصل معنا وسنوفرها لك فوراً بمطابقة رقم الهيكل.
              </p>

              <div class="empty-suggestions">
                <h4>اقتراحات مفيدة:</h4>
                <ul>
                  <li>تأكد من صحة كتابة اسم القطعة أو نوع السيارة.</li>
                  <li>جرّب التصفية باختيار الشركة والموديل فقط لعرض كل قطع الطراز.</li>
                  <li>تأكد من اختيار سنة الصنع الصحيحة لسيارتك.</li>
                </ul>
              </div>

              <div class="empty-actions">
                <a href="/catalog" class="btn-empty-reset">تفريغ كل الفلاتر وعرض الكتالوج</a>
                <a href="${buildWhatsAppLink(null, canonicalUrl).url}" target="_blank" rel="noopener noreferrer" class="btn-empty-wa">
                  ${icons.whatsapp}
                  <span>اطلب قطعتك غير الموجودة عبر واتساب الآن</span>
                </a>
              </div>
            </div>
          `}

        </main>
      </div>

    </div>
  </div>
  `;

  function buildSortUrl(s, sp) {
    const p = new URLSearchParams(sp);
    p.set('sort', s);
    p.set('page', '1');
    return `/catalog?${p.toString()}`;
  }

  return layout({
    title: query ? `البحث عن ${query} - قطع غيار السيارات` : 'الكتالوج الكامل لقطع غيار السيارات الصينية',
    description: `تصفح وابحث عن قطع غيار السيارات الصينية في السعودية: شانجان، جيلي، هافال، شيري، إم جي. فحمات، مساعدات، بواجي، فلاتر بأسعار تبدأ من أسعار الوكيل.`,
    canonicalUrl,
    activeNav: 'catalog',
    bodyContent
  });
}

// 3. Product Details Page (Flat, Single-Surface, Zero Nested Boxes, No Fake Claims)
function renderProductPage(product) {
  const settings = db.getSettings();
  const currentUrl = `https://chinesepartscatalog.com/product/${product.slug}`;
  const waLink = buildWhatsAppLink(product, currentUrl);
  const related = db.getRelatedProducts(product, 4);
  const sectionIcon = icons[product.sectionId] || icons.brakes;

  const bodyContent = `
  <div class="py-6 px-4 max-w-5xl mx-auto">
    
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap" aria-label="مسار التصفح">
      <a href="/" class="hover:text-black">الرئيسية</a>
      <span>/</span>
      <a href="/catalog" class="hover:text-black">الكتالوج</a>
      <span>/</span>
      <a href="/catalog?make=${product.makeId}" class="hover:text-black">${escapeHtml(product.makeNameAr)}</a>
      <span>/</span>
      <span class="text-gray-900 font-medium">${escapeHtml(product.nameAr)}</span>
    </nav>

    <!-- Main Product Layout: 2 Columns, Flat Single Surface -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      
      <!-- Column 1: Image & Technical Specs -->
      <div>
        <!-- Image Card -->
        <div class="w-full aspect-square bg-[#f9fafb] border border-[#e5e7eb] rounded-lg relative overflow-hidden flex items-center justify-center p-6 mb-4">
          ${product.image ? `
            <img src="${escapeHtml(product.image)}?v=clean_v8" alt="${escapeHtml(product.nameAr)}" class="w-full h-full object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="w-full h-full hidden items-center justify-center text-gray-400">${sectionIcon}</div>
          ` : `
            <div class="w-full h-full flex items-center justify-center text-gray-400">${sectionIcon}</div>
          `}
          <span class="absolute top-3 right-3 tag-quality">
            ${product.quality === 'original' ? 'أصلي وكالة' : 'تجاري درجة أولى'}
          </span>
        </div>

        <!-- Technical Specs Table -->
        <div class="border border-[#e5e7eb] rounded-lg overflow-hidden text-xs">
          <div class="bg-[#f9fafb] px-4 py-2.5 font-bold text-[#111827] border-b border-[#e5e7eb]">
            المواصفات الفنية
          </div>
          <table class="w-full text-right border-collapse">
            <tbody class="divide-y divide-[#e5e7eb]">
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium w-1/3">الشركة المصنعة</td>
                <td class="px-4 py-2.5 text-[#111827] font-semibold">${escapeHtml(product.makeNameAr)}</td>
              </tr>
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium">الموديل</td>
                <td class="px-4 py-2.5 text-[#111827] font-semibold">${escapeHtml(product.modelNameAr)}</td>
              </tr>
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium">سنوات التوافق</td>
                <td class="px-4 py-2.5 text-[#111827]">${(product.years || []).join(' ، ')}</td>
              </tr>
              ${product.oemNumber ? `
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium">رقم القطعة (OEM)</td>
                <td class="px-4 py-2.5 font-mono font-bold text-[#111827]" dir="ltr">${escapeHtml(product.oemNumber)}</td>
              </tr>` : ''}
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium">القسم الميكانيكي</td>
                <td class="px-4 py-2.5 text-[#111827]">${escapeHtml(product.sectionNameAr)}</td>
              </tr>
              <tr>
                <td class="px-4 py-2.5 text-gray-500 font-medium">حالة التوفر</td>
                <td class="px-4 py-2.5 text-[#111827]">${product.stockStatus === 'in_stock' ? 'متوفر بالمستودع' : 'عند الطلب'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Column 2: Details, Price & Direct Purchase -->
      <div class="flex flex-col justify-between">
        <div>
          <!-- Make & Category Tag -->
          <div class="text-xs font-semibold text-gray-500 mb-1">
            ${escapeHtml(product.makeNameAr)} • ${escapeHtml(product.sectionNameAr)}
          </div>

          <!-- Product Title -->
          <h1 class="text-xl md:text-2xl font-bold text-[#111827] mb-4 leading-snug">
            ${escapeHtml(product.nameAr)}
          </h1>

          ${product.oemNumber ? `
          <!-- OEM Code Bar with 1-click Copy -->
          <div class="flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded px-3 py-2 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">رقم القطعة OEM:</span>
              <span class="font-mono font-bold text-sm text-[#111827]" dir="ltr">${escapeHtml(product.oemNumber)}</span>
            </div>
            <button type="button" class="text-xs text-gray-600 hover:text-black flex items-center gap-1 font-medium transition-colors btn-copy-oem" data-copy="${escapeHtml(product.oemNumber)}" aria-label="نسخ الكود">
              <span class="material-symbols-outlined text-[16px]">content_copy</span>
              <span>نسخ</span>
            </button>
          </div>` : ''}

          <!-- Price Display (Clean Sans-Serif Font, No Dotted Zero) -->
          <div class="mb-5 pb-4 border-b border-[#e5e7eb]">
            <div class="flex items-baseline gap-2 mb-1">
              <span class="text-3xl font-bold text-[#111827]">${product.price.toFixed(0)}</span>
              <span class="text-gray-600 inline-flex items-center gap-0.5">${renderRiyalSymbol('w-5 h-5')}<span class="sr-only">﷼</span></span>
              ${product.oldPrice ? `<span class="text-xs text-gray-400 line-through mr-2 inline-flex items-center gap-0.5">${product.oldPrice.toFixed(0)} ${renderRiyalSymbol('w-3 h-3')}</span>` : ''}
            </div>
            <p class="text-[11px] text-gray-400">الأسعار وحالات التوفر قابلة للتحديث اللحظي</p>
          </div>

          <!-- Direct Purchase CTA (WhatsApp & Add to Cart) -->
          <div class="space-y-3 mb-6">
            <div class="flex flex-col sm:flex-row gap-2">
              <a href="${waLink.url}" target="_blank" rel="noopener noreferrer" class="flex-1 h-12 btn-whatsapp text-sm font-bold flex items-center justify-center gap-2">
                ${icons.whatsapp}
                <span>طلب واستفسار عبر واتساب</span>
              </a>
              <button type="button" class="btn-add-to-cart h-12 px-6 bg-[#0B132B] hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm" data-id="${product.id}" data-title="${escapeHtml(product.nameAr)}" data-price="${product.price}">
                <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
                <span>إضافة إلى السلة</span>
              </button>
            </div>
            
            <!-- VIN Reassurance Note (Direct & Reassuring, No Exaggerations) -->
            <div class="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded text-xs text-[#4b5563] flex items-start gap-2.5">
              <span class="material-symbols-outlined text-[18px] text-gray-500 shrink-0">check_circle</span>
              <div class="leading-relaxed">
                <strong>فحص التوافق الفني:</strong> يمكنك إرسال رقم الهيكل (VIN) في محادثة الواتساب للتأكد التام من مطابقة القطعة لسيارتك قبل التجهيز والشحن.
              </div>
            </div>
          </div>

          <!-- Technical Description -->
          <div class="mb-6">
            <h2 class="text-sm font-bold text-[#111827] mb-2">الوصف الفني</h2>
            <div class="text-xs text-[#4b5563] leading-relaxed">
              <p>${escapeHtml(product.descriptionAr)}</p>
            </div>
          </div>

          <!-- Warranty & Return Policy (Simple, Honest, Direct) -->
          <div class="border-t border-[#e5e7eb] pt-4 text-xs text-[#4b5563] space-y-1.5">
            <div class="font-bold text-[#111827] mb-1">الضمان والاسترجاع:</div>
            <p>• إمكانية الاستبدال أو الاسترجاع خلال 7 أيام من الاستلام بحالتها الأصلية دون تركيب.</p>
            <p>• الضمان ضد العيوب المصنعية لمدة ${product.warrantyMonths} أشهر من تاريخ الاستلام.</p>
          </div>

        </div>
      </div>

    </div>

    <!-- Related Parts -->
    ${related.length > 0 ? `
      <section class="border-t border-[#e5e7eb] pt-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-[#111827]">قطع غيار أخرى متوافقة</h2>
          <a href="/catalog?make=${product.makeId}" class="text-xs text-gray-500 hover:text-black">عرض المزيد &larr;</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          ${related.map(r => renderPartCard(r, `https://chinesepartscatalog.com/product/${r.slug}`)).join('')}
        </div>
      </section>
    ` : ''}

  </div>
  `;

  const productSchema = JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.nameAr,
    "description": product.descriptionAr || product.nameAr,
    "sku": product.id,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": product.makeNameAr
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "SAR",
      "price": product.price,
      "availability": product.stockStatus === 'in_stock' ? "https://schema.org/InStock" : "https://schema.org/PreOrder"
    }
  });

  return layout({
    title: `${product.nameAr} | ${product.makeNameAr} ${product.modelNameAr}`,
    description: `اشترِ ${product.nameAr} لسيارات ${product.makeNameAr} ${product.modelNameAr} بسعر ${product.price} ريال. اطلب مباشرة عبر واتساب مع فحص التوافق برقم الهيكل.`,
    canonicalUrl: currentUrl,
    activeNav: 'catalog',
    bodyContent,
    pageHeadExtra: `<script type="application/ld+json">${productSchema}</script>`
  });
}

// 4. Admin Authentication & Management Dashboard Views
function renderAdminLoginPage() {
  const settings = db.getSettings();
  const bodyContent = `
  <div class="stitch-admin-login-wrapper">
    <div class="stitch-admin-login-container">
      
      <!-- Main Login Card -->
      <div class="stitch-login-card">
        <div class="stitch-login-card-header">
          <div class="stitch-login-icon-box">
            <span class="material-symbols-outlined text-[28px]">admin_panel_settings</span>
          </div>
          <h1 class="stitch-login-title">بوابة إدارة كتالوج قطع الغيار</h1>
          <p class="stitch-login-subtitle">تسجيل الدخول المخصص لمدراء النظام ومسؤولي التسعير والمخزون</p>
        </div>

        <form id="admin-login-form" class="stitch-login-form">
          <div id="login-error-msg" class="stitch-login-error" style="display: none;"></div>

          <!-- Username Input -->
          <div class="stitch-form-group">
            <label for="admin-username" class="stitch-form-label">
              <span>اسم المستخدم الإداري</span>
              <span class="text-rose-500">*</span>
            </label>
            <div class="stitch-input-wrapper">
              <span class="material-symbols-outlined stitch-input-icon">person</span>
              <input type="text" id="admin-username" name="username" class="stitch-input" placeholder="اسم المستخدم (مثال: admin)" autofocus required autocomplete="username" dir="ltr">
            </div>
          </div>

          <!-- Password Input -->
          <div class="stitch-form-group">
            <div class="stitch-label-row">
              <label for="admin-password" class="stitch-form-label">
                <span>كلمة المرور المشفرة</span>
                <span class="text-rose-500">*</span>
              </label>
            </div>
            <div class="stitch-input-wrapper">
              <span class="material-symbols-outlined stitch-input-icon">lock</span>
              <input type="password" id="admin-password" name="password" class="stitch-input font-mono" placeholder="••••••••" required autocomplete="current-password" dir="ltr">
              <button type="button" class="stitch-btn-toggle-pw" id="btn-toggle-password" title="إظهار / إخفاء كلمة المرور">
                <span class="material-symbols-outlined" id="password-eye-icon">visibility</span>
              </button>
            </div>
          </div>

          <!-- Remember Me Option -->
          <div class="stitch-remember-box">
            <label class="stitch-checkbox-label">
              <input type="checkbox" id="admin-remember-me" name="remember" checked class="stitch-checkbox">
              <div class="stitch-checkbox-text">
                <span class="stitch-checkbox-title">تثبيت جلسة العمل على هذا المتصفح</span>
                <span class="stitch-checkbox-desc">تتيح لك الدخول المباشر إلى لوحة الإدارة لمدة 30 يوماً</span>
              </div>
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="stitch-btn-submit" id="btn-login-submit">
            <span class="material-symbols-outlined text-[20px]">login</span>
            <span>دخول إلى لوحة التحكم</span>
          </button>
        </form>

        <!-- Card Footer Status -->
        <div class="stitch-login-card-footer">
          <div class="server-status">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
            <span>حالة النظام: متصل ومحمي 100%</span>
          </div>
          <span class="server-id font-mono text-xs">PORTAL-v4.8</span>
        </div>
      </div>

      <!-- Return to Catalog Link -->
      <div class="stitch-return-box">
        <a href="/catalog" class="stitch-return-link">
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          <span>العودة إلى كتالوج قطع الغيار العام</span>
        </a>
      </div>

    </div>
  </div>
  `;

  return layout({
    title: "تسجيل الدخول - لوحة إدارة المتجر",
    description: "بوابة تسجيل الدخول الآمنة للوحة إدارة متجر قطع الغيار.",
    canonicalUrl: "https://saudichineseparts.com/admin",
    activeNav: "admin",
    pageHeadExtra: `<link rel="stylesheet" href="/css/admin.css?v=2026_m5"><script src="/js/admin.js?v=2026_m5" defer></script>`,
    bodyContent
  });
}

function renderAdminPage() {
  const settings = db.getSettings();
  const products = db.getAllProducts();
  const categories = db.getCategories();

  const bodyContent = `
  <div class="admin-wrapper">
    <div class="container">
      
      <div class="admin-top-bar">
        <div>
          <h1 class="admin-page-title flex items-center gap-2"><span class="material-symbols-outlined text-[28px] text-amber-400">tune</span> لوحة إدارة الكتالوج والمنتجات</h1>
          <p class="admin-subtitle">إضافة وتعديل وحذف القطع بالصور، التحكم بالأسعار والمخزون، وتحديث إعدادات المتجر فورياً</p>
        </div>
        <div class="admin-top-actions">
          <a href="/" target="_blank" class="btn-admin-preview flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[18px]">storefront</span>
            <span>معاينة المتجر الفعلي</span>
          </a>
          <button type="button" class="btn-admin-logout flex items-center gap-1" id="btn-admin-logout" title="تسجيل الخروج من لوحة الإدارة">
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>خروج</span>
          </button>
        </div>
      </div>

      <!-- Statistics Bar -->
      <div class="admin-stats-grid">
        <div class="stat-card">
          <span class="stat-num">${products.length}</span>
          <span class="stat-label">إجمالي القطع بالكتالوج</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">${categories.makes.length}</span>
          <span class="stat-label">الشركات الصينية المدعومة</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">${categories.sections.length}</span>
          <span class="stat-label">أقسام القطع الميكانيكية</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-num" dir="ltr">${escapeHtml(settings.whatsappNumber || 'غير محدد')}</span>
          <span class="stat-label">رقم WhatsApp للطلب والتواصل</span>
        </div>
      </div>

      <!-- Admin Tabs -->
      <div class="admin-tabs">
        <button type="button" class="tab-btn active" data-tab="tab-products">
          <span class="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>إدارة المنتجات والمخزون (${products.length})</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-settings">
          <span class="material-symbols-outlined text-[18px]">settings</span>
          <span>إعدادات المتجر و WhatsApp ورمز PIN</span>
        </button>
        <button type="button" class="tab-btn" data-tab="tab-backup">
          <span class="material-symbols-outlined text-[18px]">backup</span>
          <span>النسخ الاحتياطي (تصدير واستيراد)</span>
        </button>
      </div>

      <!-- Tab 1: Products Management -->
      <div class="tab-panel active" id="tab-products">
        <div class="panel-card">
          <div class="panel-header-actions">
            <div class="panel-search-box">
              <span class="material-symbols-outlined search-icon">search</span>
              <input type="text" id="admin-search-input" placeholder="ابحث باسم القطعة، نوع السيارة، أو القسم..." class="form-input search-input">
            </div>
            <button type="button" class="btn-primary btn-add-prod" id="btn-open-add-product-modal">
              <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span>
              <span>+ إضافة قطعة غيار جديدة بالصورة</span>
            </button>
          </div>

          <div class="table-responsive">
            <table class="admin-table" id="admin-products-table">
              <thead>
                <tr>
                  <th style="width: 60px;">الصورة</th>
                  <th>اسم القطعة</th>
                  <th>الشركة والموديل</th>
                  <th>القسم الميكانيكي</th>
                  <th>السعر (${renderRiyalSymbol('w-3.5 h-3.5')})</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr data-id="${p.id}">
                    <td class="table-thumb-col">
                      <img src="${p.imageUrl || p.image || '/images/products/p20517155.jpg'}" alt="${escapeHtml(p.nameAr)}" class="admin-table-thumb" onerror="this.src='/images/products/p20517155.jpg'">
                    </td>
                    <td>
                      <a href="/product/${p.slug}" target="_blank" class="table-link"><strong>${escapeHtml(p.nameAr)}</strong></a>
                      <div class="table-sub-info">
                        <span class="badge-mini ${p.quality === 'original' ? 'orig' : 'comm'}">${p.quality === 'original' ? 'أصلي' : 'تجاري'}</span>
                      </div>
                    </td>
                    <td>${escapeHtml(p.makeNameAr)} - ${escapeHtml(p.modelNameAr)}</td>
                    <td>${escapeHtml(p.sectionNameAr)}</td>
                    <td>
                      <div class="inline-price-wrap">
                        <input type="number" step="0.01" class="inline-price-input" data-id="${p.id}" value="${p.price.toFixed(2)}">
                      </div>
                    </td>
                    <td>
                      <div class="table-btns">
                        <button type="button" class="btn-table-edit" data-id="${p.id}" title="تعديل بيانات القطعة والصورة"><span class="material-symbols-outlined text-[16px]">edit</span> تعديل</button>
                        <button type="button" class="btn-table-save" data-id="${p.id}" title="حفظ السعر">حفظ</button>
                        <button type="button" class="btn-table-del" data-id="${p.id}" title="حذف القطعة وصورتها"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Store Settings & Security -->
      <div class="tab-panel" id="tab-settings">
        <div class="panel-card">
          <h2 class="panel-title flex items-center gap-2"><span class="material-symbols-outlined text-[24px] text-amber-400">admin_panel_settings</span> إعدادات المتجر ورقم WhatsApp والأمان</h2>
          <p class="panel-desc">تعديل الإعدادات هنا ينعكس فوراً على كامل صفحات المتجر وروابط التواصل وحماية لوحة الإدارة.</p>

          <form id="settings-form" class="settings-form">
            
            <div class="settings-grid">
              
              <!-- Security & Admin PIN -->
              <div class="settings-section-col">
                <h3 class="form-section-title flex items-center gap-2"><span class="material-symbols-outlined text-[20px] text-blue-600">lock_person</span> أمان وحماية لوحة الإدارة</h3>
                
                <div class="form-group security-card">
                  <div class="form-group">
                    <label for="set-admin-username" class="font-bold flex items-center gap-1.5 text-slate-800">
                      <span class="material-symbols-outlined text-[18px] text-blue-600">person</span>
                      اسم المستخدم للمسؤول (Admin Username) *
                    </label>
                    <input type="text" id="set-admin-username" name="adminUsername" value="${escapeHtml(settings.adminUsername || 'admin')}" class="form-input" dir="ltr" required>
                  </div>

                  <div class="form-group mt-3">
                    <label for="set-admin-password" class="font-bold flex items-center gap-1.5 text-slate-800">
                      <span class="material-symbols-outlined text-[18px] text-blue-600">key</span>
                      كلمة المرور المشفرة (Admin Password) *
                    </label>
                    <input type="password" id="set-admin-password" name="adminPassword" value="${escapeHtml(settings.adminPassword || 'admin2026')}" class="form-input font-mono" dir="ltr" required>
                  </div>
                  <span class="field-hint">بيانات الاعتماد لتسجيل الدخول إلى لوحة التحكم الإدارية. يمكنك تغييرها في أي وقت لحماية متجرك.</span>
                </div>

                <h3 class="form-section-title flex items-center gap-2 mt-6"><span class="material-symbols-outlined text-[20px] text-emerald-400">chat</span> إعدادات WhatsApp للطلبات</h3>
                
                <div class="form-group">
                  <label for="set-whatsapp">رقم WhatsApp الرسمي (بدون مسافات، مثال: +966551234567)</label>
                  <input type="text" id="set-whatsapp" name="whatsappNumber" value="${escapeHtml(settings.whatsappNumber)}" class="form-input" dir="ltr" required>
                  <span class="field-hint">الرقم الذي يستقبل رسائل طلب واستفسار قطع الغيار من العملاء.</span>
                </div>

                <div class="form-group">
                  <label for="set-greeting">نص الترحيب الافتراضي في رسالة الواتساب</label>
                  <textarea id="set-greeting" name="whatsappGreeting" rows="3" class="form-textarea">${escapeHtml(settings.whatsappGreeting)}</textarea>
                  <span class="field-hint">يظهر في بداية رسالة الواتساب وتُلحق به تفاصيل القطعة ورابطها تلقائياً.</span>
                </div>

                <!-- Test WhatsApp Generator -->
                <div class="wa-test-box">
                  <span class="wa-test-title">تجربة الرابط الحالي:</span>
                  <a href="${buildWhatsAppLink(null, 'https://saudichineseparts.com/test').url}" target="_blank" class="btn-wa-test" id="wa-live-test-btn">
                    ${icons.whatsapp}
                    <span>اختبار الرابط على WhatsApp الآن</span>
                  </a>
                </div>
              </div>

              <!-- Store Identity Settings -->
              <div class="settings-section-col">
                <h3 class="form-section-title flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">domain</span> هوية المتجر والبيانات العامة</h3>

                <div class="form-group">
                  <label for="set-store-name">اسم المتجر / الكتالوج</label>
                  <input type="text" id="set-store-name" name="storeName" value="${escapeHtml(settings.storeName)}" class="form-input" required>
                </div>

                <div class="form-group">
                  <label for="set-tagline">الشعار اللفظي (Slogan)</label>
                  <input type="text" id="set-tagline" name="storeTagline" value="${escapeHtml(settings.storeTagline)}" class="form-input">
                </div>

                <div class="form-group">
                  <label for="set-description">الوصف التعريفي للمتجر (SEO)</label>
                  <textarea id="set-description" name="storeDescription" rows="3" class="form-textarea">${escapeHtml(settings.storeDescription)}</textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="set-vat-rate">نسبة الضريبة (%)</label>
                    <input type="number" id="set-vat-rate" name="vatRate" value="${settings.vatRate || 15}" class="form-input">
                  </div>
                  <div class="form-group">
                    <label for="set-currency">رمز العملة الظاهر</label>
                    <input type="text" id="set-currency" name="currency" value="${escapeHtml(settings.currency)}" class="form-input">
                  </div>
                </div>

                <div class="form-group">
                  <label for="set-phone">رقم الهاتف للاتصال المباشر</label>
                  <input type="text" id="set-phone" name="phone" value="${escapeHtml(settings.phone)}" class="form-input" dir="ltr">
                </div>

                <div class="form-group">
                  <label for="set-email">البريد الإلكتروني الرسمي</label>
                  <input type="email" id="set-email" name="email" value="${escapeHtml(settings.email || '')}" class="form-input" dir="ltr">
                </div>
              </div>

            </div>

            <div class="settings-actions">
              <button type="submit" class="btn-primary-lg" id="btn-save-settings">
                <span class="material-symbols-outlined text-[20px]">save</span>
                <span>حفظ جميع الإعدادات وتطبيقها فوراً</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab 3: Backup & Export -->
      <div class="tab-panel" id="tab-backup">
        <div class="panel-card">
          <h2 class="panel-title flex items-center gap-2"><span class="material-symbols-outlined text-[24px]">backup</span> النسخ الاحتياطي وتصدير البيانات</h2>
          <p class="panel-desc">تصدير نسخة احتياطية من الكتالوج الحالي للرجوع إليها في أي وقت، أو استيراد بيانات سابقة.</p>

          <div class="import-grid">
            <!-- Export Box -->
            <div class="export-box">
              <h3>تصدير الكتالوج الحالي</h3>
              <p>تنزيل ملف بالقطع والأسعار الحالية لحفظها كنسخة احتياطية على جهازك.</p>
              
              <div class="export-buttons">
                <a href="/api/admin/export?format=json" class="btn-export json-btn" download>
                  <span class="material-symbols-outlined text-[20px]">download</span>
                  <span>تصدير نسخة JSON</span>
                </a>
                <a href="/api/admin/export?format=csv" class="btn-export csv-btn" download>
                  <span class="material-symbols-outlined text-[20px]">table_view</span>
                  <span>تصدير جدول Excel (CSV)</span>
                </a>
              </div>
            </div>

            <!-- Upload Box (Secondary) -->
            <div class="import-box">
              <h3>استيراد نسخة احتياطية (اختياري)</h3>
              <div class="drop-zone" id="drop-zone">
                <input type="file" id="file-import-input" accept=".json,.csv" class="file-input-hidden">
                <div class="drop-zone-text">
                  <span class="drop-icon"><span class="material-symbols-outlined text-[32px]">upload_file</span></span>
                  <p>اسحب ملف <strong>JSON</strong> أو <strong>CSV</strong> هنا للاستيراد</p>
                </div>
              </div>

              <!-- Preview Area -->
              <div id="import-preview-area" class="import-preview-area" style="display: none;">
                <h4>معاينة محتوى الملف (<span id="preview-count">0</span> قطعة جاهزة)</h4>
                <div id="preview-table-container" class="table-responsive"></div>
                <button type="button" class="btn-primary mt-3" id="btn-confirm-import">تأكيد الاستيراد</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal 1: Add Product with Direct Image Upload -->
  <div class="modal" id="modal-add-product" style="display: none;">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title flex items-center gap-2"><span class="material-symbols-outlined text-[22px] text-amber-400">add_circle</span> إضافة قطعة غيار جديدة بالصورة</h3>
        <button type="button" class="btn-close-modal" id="btn-close-add-modal">&times;</button>
      </div>
      <form id="form-add-product" class="modal-body">
        
        <!-- Image Upload Box -->
        <div class="form-group">
          <label class="font-bold flex items-center gap-1.5 text-sm">
            <span class="material-symbols-outlined text-[18px] text-amber-400">image</span>
            صورة القطعة (اختياري)
          </label>
          <div class="image-upload-dropzone" id="add-image-dropzone">
            <input type="file" id="add-image-file-input" accept="image/png,image/jpeg,image/webp" class="file-input-hidden">
            <div class="dropzone-content" id="add-dropzone-prompt">
              <span class="material-symbols-outlined text-[36px] text-amber-400">cloud_upload</span>
              <p class="dropzone-main-text">اضغط لاختيار صورة من جهازك / الكاميرا أو اسحبها هنا</p>
              <span class="dropzone-hint-text">يدعم JPG, PNG, WebP (سيتم حفظها بالسيرفر مباشرة)</span>
            </div>
            <div class="image-preview-container" id="add-preview-container" style="display: none;">
              <img id="add-preview-image" src="" alt="معاينة الصورة" class="preview-img-box">
              <button type="button" class="btn-remove-preview" id="btn-remove-add-preview" title="إزالة الصورة">
                <span class="material-symbols-outlined text-[18px]">close</span>
                <span>إزالة الصورة</span>
              </button>
            </div>
          </div>
          <input type="hidden" id="add-image-url-field" name="imageUrl" value="">
        </div>

        <div class="form-group">
          <label for="add-prod-name">اسم القطعة بالعربية *</label>
          <input type="text" id="add-prod-name" name="nameAr" placeholder="مثال: فحمات فرامل أمامية شانجان CS35 بلس" class="form-input" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="add-prod-price">السعر بالريال السعودي *</label>
            <input type="number" step="0.01" id="add-prod-price" name="price" placeholder="185.00" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="add-prod-old-price">السعر السابق (قبل الخصم - اختياري)</label>
            <input type="number" step="0.01" id="add-prod-old-price" name="oldPrice" placeholder="220.00" class="form-input">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="add-prod-make">الشركة المصنعة للسيارة *</label>
            <select id="add-prod-make" name="makeId" class="form-select" required>
              ${categories.makes.map(m => `<option value="${m.id}">${m.nameAr}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="add-prod-model-name">موديل السيارة (كتابة) *</label>
            <input type="text" id="add-prod-model-name" name="modelNameAr" placeholder="مثال: CS35 بلس" class="form-input" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="add-prod-section">القسم الميكانيكي *</label>
            <select id="add-prod-section" name="sectionId" class="form-select" required>
              ${categories.sections.map(s => `<option value="${s.id}">${s.nameAr}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="add-prod-quality">درجة الجودة</label>
            <select id="add-prod-quality" name="quality" class="form-select">
              <option value="original">أصلي وكالة</option>
              <option value="commercial_grade_a">تجاري درجة أولى</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="add-prod-desc">الوصف الفني والملاحظات</label>
          <textarea id="add-prod-desc" name="descriptionAr" rows="2" class="form-textarea" placeholder="تفاصيل إضافية عن القطعة أو أرقام التوافق..."></textarea>
        </div>

        <div class="modal-footer">
          <button type="submit" class="btn-primary" id="btn-submit-add-prod">حفظ وإدراج القطعة</button>
          <button type="button" class="btn-secondary" id="btn-cancel-add-modal">إلغاء</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal 2: Edit Product & Image -->
  <div class="modal" id="modal-edit-product" style="display: none;">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title flex items-center gap-2"><span class="material-symbols-outlined text-[22px] text-amber-400">edit</span> تعديل بيانات القطعة والصورة</h3>
        <button type="button" class="btn-close-modal" id="btn-close-edit-modal">&times;</button>
      </div>
      <form id="form-edit-product" class="modal-body">
        <input type="hidden" id="edit-prod-id" name="id">

        <!-- Image Edit Box -->
        <div class="form-group">
          <label class="font-bold flex items-center gap-1.5 text-sm">
            <span class="material-symbols-outlined text-[18px] text-amber-400">image</span>
            صورة القطعة
          </label>
          <div class="image-upload-dropzone" id="edit-image-dropzone">
            <input type="file" id="edit-image-file-input" accept="image/png,image/jpeg,image/webp" class="file-input-hidden">
            <div class="image-preview-container" id="edit-preview-container">
              <img id="edit-preview-image" src="/images/products/p20517155.jpg" alt="معاينة الصورة" class="preview-img-box">
              <button type="button" class="btn-change-image" id="btn-trigger-edit-image">
                <span class="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>تغيير الصورة</span>
              </button>
            </div>
          </div>
          <input type="hidden" id="edit-image-url-field" name="imageUrl" value="">
        </div>

        <div class="form-group">
          <label for="edit-prod-name">اسم القطعة بالعربية *</label>
          <input type="text" id="edit-prod-name" name="nameAr" class="form-input" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="edit-prod-price">السعر بالريال السعودي *</label>
            <input type="number" step="0.01" id="edit-prod-price" name="price" class="form-input" required>
          </div>
          <div class="form-group">
            <label for="edit-prod-old-price">السعر السابق (قبل الخصم)</label>
            <input type="number" step="0.01" id="edit-prod-old-price" name="oldPrice" class="form-input">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="edit-prod-make">الشركة المصنعة *</label>
            <select id="edit-prod-make" name="makeId" class="form-select" required>
              ${categories.makes.map(m => `<option value="${m.id}">${m.nameAr}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="edit-prod-model-name">موديل السيارة *</label>
            <input type="text" id="edit-prod-model-name" name="modelNameAr" class="form-input" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="edit-prod-section">القسم الميكانيكي *</label>
            <select id="edit-prod-section" name="sectionId" class="form-select" required>
              ${categories.sections.map(s => `<option value="${s.id}">${s.nameAr}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="edit-prod-quality">درجة الجودة</label>
            <select id="edit-prod-quality" name="quality" class="form-select">
              <option value="original">أصلي وكالة</option>
              <option value="commercial_grade_a">تجاري درجة أولى</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="edit-prod-desc">الوصف الفني</label>
          <textarea id="edit-prod-desc" name="descriptionAr" rows="2" class="form-textarea"></textarea>
        </div>

        <div class="modal-footer">
          <button type="submit" class="btn-primary" id="btn-submit-edit-prod">حفظ التعديلات</button>
          <button type="button" class="btn-secondary" id="btn-cancel-edit-modal">إلغاء</button>
        </div>
      </form>
    </div>
  </div>
  `;

  return layout({
    title: "لوحة التحكم وإدارة الكتالوج",
    description: "لوحة تحكم لإدارة منتجات قطع غيار السيارات الصينية والأسعار وإعدادات المتجر.",
    canonicalUrl: "https://saudichineseparts.com/admin",
    activeNav: "admin",
    pageHeadExtra: `<link rel="stylesheet" href="/css/admin.css?v=2026_m5"><script src="/js/admin.js?v=2026_m5" defer></script>`,
    bodyContent
  });
}

// 5. Legal Pages (Privacy Policy, Terms, Returns, Disclaimer)
function renderLegalPage(type) {
  const settings = db.getSettings();

  const legalContent = {
    privacy: {
      title: "سياسة الخصوصية وحماية البيانات الشخصية",
      subtitle: "وفق نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي في المملكة العربية السعودية",
      body: `
        <div class="legal-article">
          <h3>1. المقدمة ونطاق التطبيق</h3>
          <p>نحن في <strong>${escapeHtml(settings.storeName)}</strong> نلتزم التزاماً تاماً بحماية خصوصية بيانات زوارنا ومستخدمي كتالوج قطع الغيار، ونتوافق مع أحكام <strong>نظام حماية البيانات الشخصية (PDPL)</strong> في المملكة العربية السعودية واللوائح الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).</p>

          <h3>2. البيانات التي يتم جمعها</h3>
          <p>لا يتطلب تصفح كتالوج قطع الغيار أو البحث فيه إنشاء حساب أو إدخال بيانات بنكية، حيث أن موقعنا مخصص للاستعراض والاستفسار الفني. يتم جمع البيانات التالية فقط عند الضرورة:</p>
          <ul>
            <li><strong>بيانات الاستفسار الفني:</strong> المعلومات التي تشاركها طوعاً عند التواصل عبر تطبيق WhatsApp مثل (رقم الهيكل VIN، نوع وموديل السيارة، رقم الجوال للتواصل).</li>
            <li><strong>ملفات تعريف الارتباط الفنية (Cookies):</strong> ملفات تقنية مؤقتة تُستخدم لحفظ تفضيلات التصفح (مثل إخفاء شريط الموافقة، وحفظ خيارات التصفية المفضلة) ولا تُستخدم لأي تعقب أو إعلانات خارجية دخيلة.</li>
          </ul>

          <h3>3. الغرض من معالجة البيانات</h3>
          <p>تُستخدم أي بيانات فنية أو معلومات اتصال لغرض واحد فقط وهو: الرد على استفسارك، والتحقق من توافق قطعة الغيار مع سيارتك، وتقديم عرض السعر وإتمام التنسيق اللوجستي، ولا نقوم إطلاقاً ببيع أو تأجير أي بيانات لأطراف ثالثة.</p>

          <h3>4. حقوق صاحب البيانات الشخصية</h3>
          <p>يحق لك نظاماً بموجب الأنظمة السعودية:</p>
          <ul>
            <li>الاطلاع على بياناتك الشخصية المتاحة لدينا.</li>
            <li>طلب تصحيح أو تحديث أي بيانات غير دقيقة.</li>
            <li>طلب إتلاف بياناتك بعد انتهاء الغرض من تقديم الخدمة والاستفسار.</li>
            <li>سحب الموافقة على ملفات تعريف الارتباط في أي وقت عبر رابط "إعدادات الخصوصية والموافقة" الموجود في أسفل الموقع.</li>
          </ul>

          <div class="legal-disclaimer-card">
            <strong>ملاحظة تنظيمية هامة:</strong>
            هذه النصوص القانونية هي إطار عمل مهني لحماية المستخدمين وفق الممارسات المتبعة في التجارة الإلكترونية، وتخضع للمراجعة والاعتماد الدوري من قبل مستشار قانوني مرخص في المملكة العربية السعودية.
          </div>
        </div>
      `
    },

    terms: {
      title: "الشروط والأحكام العامة لاستخدام الكتالوج",
      subtitle: "القواعد والضوابط المنظمة لاستعراض وطلب قطع الغيار",
      body: `
        <div class="legal-article">
          <h3>1. طبيعة الموقع والخدمة</h3>
          <p>موقع <strong>${escapeHtml(settings.storeName)}</strong> هو كتالوج إلكتروني تقني متخصص في استعراض ومطابقة قطع غيار السيارات الصينية المتاحة في السوق السعودي. إن الموقع مخصص لربط العميل مباشرة مع مستشاري القطع عبر تطبيق WhatsApp، ولا يحتوي على بوابة دفع إلكتروني فورية أو عقود شراء مؤتمتة نهائية.</p>

          <h3>2. طبيعة التواصل عبر WhatsApp</h3>
          <p>يُقر المستخدم بأن الضغط على أزرار التواصل أو إرسال رسالة عبر تطبيق WhatsApp يُعد <strong>قناة استفسار وطلب تسعير ومطابقة فنية</strong>، ولا يمثل بمفرده عقداً نهائياً ملزماً بالبيع أو الشراء إلا بعد قيام مسؤولي المبيعات بالتأكيد الصريح للتوفر والسعر واعتماد العميل للطلب النهائي وتأكيد طريقة الاستلام والتوصيل.</p>

          <h3>3. دقة الأسعار والتوفر</h3>
          <p>تخضع جميع الأسعار المعروضة بالريال السعودي (ر.س) وحالات التوفر للتحديثات اللحظية وفقاً لحركة المستودعات وأسعار الموردين والوكلاء. في حال حدوث أي خطأ غير مقصود في تسعير قطعة أو نفاد كميتها أثناء التصفح، يتم توضيح السعر والتوفر النهائي للعميل في محادثة الواتساب قبل أي التزام مالي.</p>

          <h3>4. حقوق الملكية الفكرية والعلامات التجارية</h3>
          <p>جميع أسماء الشركات المصنعة وموديلاتها (مثل: شانجان، جيلي، هافال، شيري، إم جي، جيتور، فاو، جريت وول) وشعاراتها وأرقام قطع الغيار الأصلية (OEM) المذكورة في هذا الموقع هي علامات تجارية مملوكة لأصحابها الشرعيين ومصنعيها الأصليين. يُذكر استخدامها هنا حصراً لغرض الإيضاح الفني والتعريف بمدى توافق القطعة مع المركبة المعنية فقط دون أي ادعاء بالوكالة الحصرية ما لم يُنص على ذلك رسمياً.</p>

          <div class="legal-disclaimer-card">
            <strong>ملاحظة قانونية:</strong>
            تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة واللوائح المعمول بها في المملكة العربية السعودية.
          </div>
        </div>
      `
    },

    returns: {
      title: "سياسة الاستبدال والاسترجاع والضمان",
      subtitle: "الشروط والضوابط المنظمة لإرجاع قطع الغيار والضمان",
      body: `
        <div class="legal-article">
          <h3>1. مهلة الاستبدال والاسترجاع</h3>
          <p>يحق للعميل طلب استبدال أو استرجاع قطع الغيار خلال <strong>7 أيام تقويمية</strong> من تاريخ استلام القطعة، وذلك وفقاً للشروط المحددة أدناه.</p>

          <h3>2. شروط قبول الاسترجاع والاستبدال</h3>
          <ul>
            <li>أن تكون القطعة في <strong>حالتها الأصلية تماماً</strong> وداخل تغليف وكرتون المصنع الأصلي دون أي تلف.</li>
            <li><strong>عدم محاولة تركيب القطعة أو تجريحها أو استخدامها</strong> في السيارة بأي شكل من الأشكال.</li>
            <li>إرفاق فاتورة الشراء أو إشعار الطلب عند التسليم.</li>
          </ul>

          <h3>3. الحالات التي لا يشملها الاسترجاع</h3>
          <ul>
            <li>القطع الكهربائية أو الإلكترونية (مثل: الحساسات، الكويلات، الكمبيوترات، والضفائر) بعد فتح غلافها المغلق بإحكام أو تركيبها، وذلك نظراً لحساسيتها للتلف السريع الناتج عن التوصيل الكهربائي الخاطئ في المركبة، إلا في حال إثبات وجود عيب تصنيعي صريح من تاريخ الفتح.</li>
            <li>القطع التي تم طلبها خصيصاً للعميل (طلب خاص برقم الهيكل من خارج المملكة) بعد تأكيد العميل وموافقته المسبقة.</li>
            <li>القطع التي تعرضت لسوء التركيب أو استخدام زيوت وسوائل غير موصى بها من الصانع.</li>
          </ul>

          <h3>4. الضمان ضد العيوب المصنعية</h3>
          <p>تتمتع القطع الأصلية والتجارية بالضمان الموضح في بطاقة كل قطعة (من 3 إلى 12 شهراً) ضد العيوب المصنعية فقط. ولا يشمل الضمان بأي حال من الأحوال حوادث الطرق أو أخطاء ورش الصيانة في التركيب أو الصيانة الدورية الإهمالية.</p>
        </div>
      `
    },

    disclaimer: {
      title: "إخلاء مسؤولية التوافق الفني ورقم الهيكل (VIN)",
      subtitle: "المسؤولية المشتركة في مطابقة القطعة مع رقم الشاصي",
      body: `
        <div class="legal-article">
          <h3>1. مبدأ المسؤولية المشتركة في قطع الغيار</h3>
          <p>تتميز سيارات الصانعين الصينيين (شانجان، جيلي، هافال، شيري، إم جي، جيتور...) بتعدد أجيالها ومحركاتها وتحديثاتها السنوية (Facelift) التي قد تؤدي أحياناً إلى اختلاف في كود القطعة أو قواعد التثبيت لنفس الموديل في نفس سنة الصنع وفقاً لفئة المركبة ومواصفاتها (مثل: سعة المحرك، نوع القير، بلد التوريد).</p>

          <h3>2. التحقق النهائي برقم الهيكل (VIN)</h3>
          <p>يُعد تزويد فريقنا بـ <strong>رقم الهيكل (VIN - رقم الشاصي)</strong> المكون من 17 رمزاً والمسجل في استمارة السيارة هو <strong>الضمانة الوحيدة والمثلى للتحقق الفني القاطع بنسبة 100%</strong> قبل تأكيد الشحن أو التسليم.</p>

          <h3>3. حدود المسؤولية</h3>
          <p>يبذل فريق عمل الكتالوج أقصى درجات العناية والتدقيق لتوفير أرقام OEM والبدائل المتوافقة بدقة تامة. ومع ذلك، في حال إصرار العميل على طلب قطعة محددة دون تزويدنا برقم الهيكل للتأكد أو رغم تنبيهنا الفني بعدم التطابق، فإن العميل يتحمل وحده مسؤولية عدم توافق القطعة وتكاليف إعادة الشحن الناتجة عن ذلك.</p>

          <div class="legal-disclaimer-card">
            <strong>ملاحظة:</strong>
            يتم فحص وتأكيد رقم الهيكل مجاناً لجميع عملائنا عبر محادثة الواتساب لضمان حصولكم على القطعة الصحيحة من المرة الأولى.
          </div>
        </div>
      `
    }
  };

  const page = legalContent[type] || legalContent.privacy;

  const bodyContent = `
  <div class="legal-page-wrapper">
    <div class="container">
      
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="مسار الصفحة">
        <a href="/">الرئيسية</a>
        <span class="sep">/</span>
        <span class="current">${escapeHtml(page.title)}</span>
      </nav>

      <div class="legal-header-card">
        <h1 class="legal-main-title">${escapeHtml(page.title)}</h1>
        <p class="legal-main-subtitle">${escapeHtml(page.subtitle)}</p>
      </div>

      <div class="legal-body-card">
        ${page.body}
      </div>

    </div>
  </div>
  `;

  return layout({
    title: page.title,
    description: page.subtitle,
    canonicalUrl: `https://saudichineseparts.com/${type === 'privacy' ? 'privacy-policy' : (type === 'returns' ? 'returns-policy' : (type === 'disclaimer' ? 'compatibility-disclaimer' : 'terms'))}`,
    activeNav: '',
    bodyContent
  });
}

module.exports = {
  renderHomePage,
  renderCatalogPage,
  renderProductPage,
  renderAdminPage,
  renderAdminLoginPage,
  renderLegalPage
};
