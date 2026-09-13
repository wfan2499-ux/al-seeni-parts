// HTML & Component Rendering Engine for Saudi Parts Catalog
// Minimalist Monochrome Edition - Zero-Fluff, Zero-Fake-Claims, Direct Commerce
const db = require('./db');

// Technical SVG Icons - Clean Mechanical Symbols (No Childish Shapes)
const icons = {
  logo: `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7"><rect x="3" y="3" width="26" height="26" rx="6" fill="#111827"/><path d="M9 16L14 21L23 11" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  brakes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`,
  suspension: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M12 2v4M12 18v4M8 6h8M8 18h8M12 6c-3 1.5-3 3 0 4.5s3 3 0 4.5"/></svg>`,
  engine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M2 10h2M2 14h2M20 10h2M20 14h2M8 2v4M16 2v4M9 18v4M15 18v4"/></svg>`,
  cooling: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M12 5v14M17 5v14M3 10h18M3 14h18"/></svg>`,
  filters: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M3 5h18l-7 8v6l-4-2v-4L3 5z"/></svg>`,
  electrical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  steering: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 3v7M5.5 16.5L10.5 13M18.5 16.5L13.5 13"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

// Generate polite, clean WhatsApp inquiry link (Direct, No Emojis, No Exaggerations)
function buildWhatsAppLink(product, currentUrl = '') {
  const settings = db.getSettings();
  const rawNumber = (settings.whatsappNumber || '').replace(/[^0-9]/g, '');
  if (!rawNumber) {
    return {
      isValid: false,
      url: '#no-whatsapp-configured',
      errorMessage: 'رقم الواتساب غير مهيأ حالياً.'
    };
  }

  const greeting = settings.whatsappGreeting || 'السلام عليكم، أود الاستفسار عن توفر وسعر القطعة التالية:';
  const name = product ? product.nameAr : 'استفسار عن قطع غيار';
  const car = product ? `${product.makeNameAr} ${product.modelNameAr} (${(product.years || []).join(' - ')})` : '';
  const price = product ? `${product.price} ريال` : '';
  const productUrl = currentUrl || '';

  let message = `${greeting}\n\n`;
  message += `اسم القطعة: ${name}\n`;
  if (car) message += `السيارة: ${car}\n`;
  if (price) message += `السعر: ${price}\n`;
  if (productUrl) message += `الرابط: ${productUrl}\n\n`;
  message += `وشكراً.`;

  const encodedText = encodeURIComponent(message);
  return {
    isValid: true,
    url: `https://wa.me/${rawNumber}?text=${encodedText}`
  };
}

// Master Layout Template (Sleek, Monochrome, Clean White, Zero Emojis)
function layout({
  title = '',
  description = '',
  canonicalUrl = '',
  activeNav = '',
  bodyContent = '',
  pageHeadExtra = ''
}) {
  const settings = db.getSettings();
  const pageTitle = title ? `${title} | ${settings.storeName}` : settings.storeName;
  const pageDesc = description || settings.storeDescription;
  const canonical = canonicalUrl || 'https://chinesepartscatalog.com';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(pageDesc)}">
  <link rel="canonical" href="${canonical}">
  
  <!-- Certified Arabic & Mono Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS Engine -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            brand: "#111827",
            brandHover: "#000000",
            waGreen: "#15803d",
            waGreenHover: "#166534"
          },
          fontFamily: {
            sans: ["IBM Plex Sans Arabic", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"]
          }
        }
      }
    };
  </script>

  <link rel="stylesheet" href="/css/stitch-enterprise.css?v=mono_v3">
  ${pageHeadExtra || ''}
</head>
<body class="bg-white text-[#111827] font-sans antialiased">

  <!-- Clean Top Navigation Bar (High-End Tech Slate Header) -->
  <header id="site-header" class="bg-[#0B132B] text-white border-b border-[#1C2541] sticky top-0 z-40 shadow-sm transition-transform duration-300 ease-in-out" style="will-change: transform;">
    <div class="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center md:justify-between gap-4">
      
      <!-- Brand Logo (Centered on Mobile, Aligned on Desktop) -->
      <div class="w-full md:w-auto flex justify-center md:justify-start">
        <a href="/" class="flex items-center shrink-0 text-decoration-none group py-0.5">
          <img src="/images/al_seeni_logo_white.png?v=c2" alt="الصيني | AL-SEENI" class="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105">
        </a>
      </div>

      <!-- Quick Search Bar (Desktop Only) -->
      <form action="/catalog" method="GET" class="hidden md:flex flex-1 max-w-lg mx-4">
        <div class="relative w-full">
          <input type="search" name="q" placeholder="ابحث باسم القطعة، نوع السيارة، أو رقم الهيكل (VIN)..." class="w-full h-10 pr-10 pl-16 bg-[#1C2541] border border-[#3A506B] rounded-lg text-xs text-white placeholder-gray-400 focus:bg-[#0B132B] focus:border-white focus:outline-none transition-all">
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <span class="material-symbols-outlined text-[18px]">search</span>
          </div>
          <button type="submit" class="absolute inset-y-1 left-1 px-3.5 bg-white hover:bg-gray-100 text-[#0B132B] rounded-md text-[11px] font-bold transition-colors">
            بحث
          </button>
        </div>
      </form>

      <!-- Navigation Links & WhatsApp (Desktop Only) -->
      <div class="hidden md:flex items-center gap-3 shrink-0">
        <nav class="flex items-center gap-5 text-xs font-semibold text-gray-300">
          <a href="/" class="hover:text-white transition-colors ${activeNav === 'home' ? 'text-white border-b-2 border-white pb-1' : ''}">الرئيسية</a>
          <a href="/catalog" class="hover:text-white transition-colors ${activeNav === 'catalog' ? 'text-white border-b-2 border-white pb-1' : ''}">الكتالوج</a>
        </nav>

        <a href="${buildWhatsAppLink(null, canonical).url}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp text-xs py-2 px-3.5 shadow-sm">
          ${icons.whatsapp}
          <span>طلب تسعير خاص</span>
        </a>
      </div>

    </div>
  </header>

  <!-- Main Body Content -->
  <main class="w-full ${activeNav === 'admin' ? 'pb-8' : 'pb-20 md:pb-8'}">
    ${bodyContent}
  </main>

  <!-- Minimal Neutral Footer (Hidden on Mobile as requested) -->
  <footer class="hidden md:block border-t border-[#e5e7eb] bg-[#f9fafb] text-xs text-[#6b7280] py-10">
    <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
      <div class="flex items-center gap-4">
        <a href="/" class="shrink-0">
          <img src="/images/al_seeni_logo.png?v=real_opt2" alt="الصيني | AL-SEENI" class="h-11 w-auto object-contain">
        </a>
        <div class="text-right border-r border-[#e5e7eb] pr-4">
          <p class="text-xs text-[#111827] font-bold mb-0.5">الصيني لقطع غيار السيارات</p>
          <p class="text-[11px] text-[#6b7280]">${escapeHtml(settings.storeTagline)}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
        <a href="/catalog" class="hover:text-[#111827] transition-colors">الكتالوج الكامل</a>
        <span class="text-gray-300">•</span>
        <a href="#vin-search" class="hover:text-[#111827] transition-colors">استعلام برقم الهيكل (VIN)</a>
        <span class="text-gray-300">•</span>
        <a href="#quick-rfq" class="hover:text-[#111827] transition-colors">طلب تسعير مباشر</a>
        <span class="text-gray-300">•</span>
        <a href="${buildWhatsAppLink(null, canonical).url}" target="_blank" class="text-[#15803d] font-bold hover:underline">خدمة العملاء عبر واتساب</a>
      </div>
      <p class="text-[11px] text-[#9ca3af]">جميع الحقوق محفوظة &copy; ${new Date().getFullYear()}</p>
    </div>
  </footer>

  ${activeNav !== 'admin' ? `
  <!-- Floating Circular WhatsApp Button (Mobile Only) -->
  <a id="floating-wa-btn" href="${buildWhatsAppLink(null, canonical).url}" target="_blank" rel="noopener noreferrer" 
     class="md:hidden fixed z-40 w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95 border-2 border-white/30"
     style="bottom: 70px; left: 16px;" title="تواصل معنا عبر واتساب" aria-label="تواصل معنا عبر واتساب">
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z"/>
    </svg>
  </a>

  <!-- Mobile Bottom Sticky Navigation (Enhanced 4-Item Bar: Home, Catalog, Search, Cart) -->
  <nav class="mobile-bottom-bar md:hidden bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg fixed bottom-0 left-0 right-0 z-40 h-14 flex items-center justify-around px-2" aria-label="شريط الجوال">
    <!-- 1. الرئيسية -->
    <a href="/" class="flex flex-col items-center justify-center flex-1 py-1 ${activeNav === 'home' ? 'text-[#0B132B] font-bold' : 'text-gray-500'}">
      <span class="material-symbols-outlined text-[22px]">home</span>
      <span class="text-[10px] mt-0.5 font-medium">الرئيسية</span>
    </a>

    <!-- 2. الكتالوج -->
    <a href="/catalog" class="flex flex-col items-center justify-center flex-1 py-1 ${activeNav === 'catalog' ? 'text-[#0B132B] font-bold' : 'text-gray-500'}">
      <span class="material-symbols-outlined text-[22px]">grid_view</span>
      <span class="text-[10px] mt-0.5 font-medium">الكتالوج</span>
    </a>

    <!-- 3. البحث -->
    <button type="button" id="btn-mobile-search" class="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-[#0B132B] transition-colors">
      <span class="material-symbols-outlined text-[22px]">search</span>
      <span class="text-[10px] mt-0.5 font-medium">البحث</span>
    </button>

    <!-- 4. السلة -->
    <button type="button" id="btn-mobile-cart" class="flex flex-col items-center justify-center flex-1 py-1 text-gray-500 hover:text-[#0B132B] transition-colors relative">
      <div class="relative flex items-center justify-center">
        <span class="material-symbols-outlined text-[22px]">shopping_cart</span>
        <span id="mobile-cart-badge" class="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center hidden">0</span>
      </div>
      <span class="text-[10px] mt-0.5 font-medium">السلة</span>
    </button>
  </nav>

  <!-- Mobile Search Modal (Clean White & Royal Blue Professional Theme) -->
  <div id="search-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden flex-col p-4">
    <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl max-w-lg mx-auto w-full mt-10">
      <div class="flex items-center justify-between mb-3.5">
        <span class="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span class="material-symbols-outlined text-[#004AC6] text-xl">search</span>
          <span>البحث في قطع الغيار</span>
        </span>
        <button type="button" id="btn-close-search" class="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
      <form action="/catalog" method="GET" class="relative w-full mb-3.5">
        <input type="search" name="q" id="search-modal-input" placeholder="اسم القطعة، نوع السيارة، أو رقم الهيكل..." class="w-full h-12 pr-10 pl-20 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004AC6] focus:bg-white focus:ring-2 focus:ring-[#004AC6]/10 transition-all">
        <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
          <span class="material-symbols-outlined text-[20px]">search</span>
        </div>
        <button type="submit" class="absolute inset-y-1.5 left-1.5 px-4 bg-[#004AC6] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs">
          بحث
        </button>
      </form>
      <div class="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span class="text-gray-400 font-medium">الأكثر بحثاً:</span>
        <a href="/catalog?q=فحمات" class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#004AC6] text-gray-700 transition-colors font-medium text-[11px]">فحمات</a>
        <a href="/catalog?q=فلتر" class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#004AC6] text-gray-700 transition-colors font-medium text-[11px]">فلتر زيت</a>
        <a href="/catalog?q=مساعدات" class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#004AC6] text-gray-700 transition-colors font-medium text-[11px]">مساعدات</a>
        <a href="/catalog?q=شمعة" class="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-50 hover:text-[#004AC6] text-gray-700 transition-colors font-medium text-[11px]">شمعات</a>
      </div>
    </div>
  </div>

  <!-- Mobile Cart Drawer -->
  <div id="cart-drawer" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex-col justify-end">
    <div class="bg-white rounded-t-2xl max-w-lg mx-auto w-full p-4 max-h-[80vh] flex flex-col shadow-2xl">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-gray-700">shopping_cart</span>
          <h3 class="text-sm font-bold text-gray-900">سلة المشتريات (<span id="cart-count-title">0</span>)</h3>
        </div>
        <button type="button" id="btn-close-cart" class="text-gray-400 hover:text-gray-600 p-1">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="cart-items-container" class="py-8 text-center text-gray-500 text-xs flex-1 overflow-y-auto">
        <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">remove_shopping_cart</span>
        <p class="font-bold text-gray-700 mb-1 text-sm">السلة فارغة حالياً</p>
        <p class="text-[11px] text-gray-400 mb-4">تصفح الكتالوج وأضف القطع التي تحتاجها لطلبها دفعة واحدة</p>
        <a href="/catalog" class="inline-block px-5 py-2 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-lg transition-colors">
          تصفح الكتالوج الآن
        </a>
      </div>
      <div id="cart-footer" class="pt-3 border-t border-gray-100 hidden">
        <div class="flex justify-between items-center text-xs font-bold text-gray-800 mb-3">
          <span>المجموع المقدر:</span>
          <span id="cart-total-price" class="text-base font-bold text-[#0B132B] inline-flex items-center gap-1">0 ${renderRiyalSymbol('w-4 h-4')}</span>
        </div>
        <a href="#" id="btn-checkout-whatsapp" target="_blank" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
          <span>طلب كافة القطع عبر واتساب</span>
        </a>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Toast Notification Container -->
  <div id="toast-container" class="fixed top-4 left-4 right-4 md:right-auto md:w-80 z-50 pointer-events-none"></div>

  <!-- Scripts -->
  <script src="/js/app.js"></script>
</body>
</html>`;
}

// Render Part Card (Flat, Single-Surface, No Nested Boxes)
function renderPartCard(product, currentUrl = '') {
  const icon = icons[product.sectionId] || icons.brakes;

  return `
  <article class="catalog-card p-3 flex flex-col justify-between" data-id="${product.id}">
    <div>
      <!-- Product Image (Clickable Link to Details) -->
      <a href="/product/${product.slug}" class="block w-full h-40 bg-[#f9fafb] border border-[#e5e7eb] hover:border-gray-400 rounded overflow-hidden mb-3 relative flex items-center justify-center group/img transition-colors" title="عرض تفاصيل ${escapeHtml(product.nameAr)}">
        ${product.image ? `
          <img src="${escapeHtml(product.image)}?v=clean_v8" alt="${escapeHtml(product.nameAr)}" class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="w-full h-full hidden items-center justify-center text-gray-400">${icon}</div>
        ` : `
          <div class="w-full h-full flex items-center justify-center text-gray-400">${icon}</div>
        `}
        <span class="absolute top-2 right-2 tag-quality">
          ${product.quality === 'original' ? 'أصلي' : 'تجاري'}
        </span>
      </a>

      <!-- Make & Section Tag -->
      <div class="text-[11px] text-gray-500 mb-1">
        ${escapeHtml(product.makeNameAr)} • ${escapeHtml(product.sectionNameAr || '')}
      </div>

      <!-- Title (Clickable Link to Details) -->
      <h3 class="text-sm font-bold text-[#111827] leading-snug line-clamp-2 mb-2">
        <a href="/product/${product.slug}" class="hover:text-black transition-colors">${escapeHtml(product.nameAr)}</a>
      </h3>
    </div>

    <!-- Price & Direct Add to Cart Action -->
    <div class="pt-2.5 border-t border-[#F1F5F9]">
      <div class="flex items-baseline justify-between mb-3">
        <div class="flex items-baseline gap-1">
          <span class="text-base sm:text-lg font-bold text-[#0B132B]">${product.price.toFixed(0)}</span>
          <span class="text-gray-500 inline-flex items-center gap-0.5">${renderRiyalSymbol('w-3.5 h-3.5')}<span class="sr-only">﷼</span></span>
        </div>
        <span class="text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">${product.stockStatus === 'in_stock' ? 'متوفر' : 'عند الطلب'}</span>
      </div>

      <!-- Only Add to Cart Button -->
      <button type="button" class="btn-add-to-cart w-full h-9 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs" data-id="${product.id}" data-title="${escapeHtml(product.nameAr)}" data-price="${product.price}">
        <span class="material-symbols-outlined text-[17px]">add_shopping_cart</span>
        <span>إضافة إلى السلة</span>
      </button>
    </div>
  </article>`;
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Official Saudi Riyal Symbol (SAMA 2025 Standard)
function renderRiyalSymbol(sizeClass = 'w-3.5 h-3.5', extraClass = '') {
  return `<svg class="sar-symbol ${sizeClass} ${extraClass} inline-block fill-current align-[-0.12em] shrink-0" viewBox="0 0 1125 1257" aria-label="ريال" role="img"><path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/><path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/></svg>`;
}

module.exports = {
  icons,
  buildWhatsAppLink,
  layout,
  renderPartCard,
  renderRiyalSymbol,
  escapeHtml
};
