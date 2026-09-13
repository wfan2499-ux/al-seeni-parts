/**
 * Database Layer - Hybrid Mode
 * --------------------------------
 * يعمل في وضعين تلقائياً:
 *   FIRESTORE MODE: عند وجود Firebase credentials → كل العمليات على Firestore
 *   FILE MODE:      عند غياب credentials → يعمل بملفات JSON (للتطوير المحلي بدون Firebase)
 *
 * الأداء: يستخدم in-memory cache لتقليل Firestore reads
 */

const fs = require('fs');
const path = require('path');
const { getDb } = require('./firebase');

// ======================================================
// الثوابت والـ Cache المحلي
// ======================================================
const PRODUCTS_FILE   = path.join(__dirname, '..', 'data', 'products.json');
const CATEGORIES_FILE = path.join(__dirname, '..', 'data', 'categories.json');
const SETTINGS_FILE   = path.join(__dirname, '..', 'config', 'settings.json');

const CACHE_TTL_MS = 30 * 1000; // 30 ثانية

let productsCache   = [];
let categoriesCache = { makes: [], sections: [] };
let settingsCache   = {};

let productsCacheAt   = 0;
let settingsCacheAt   = 0;
let categoriesCacheAt = 0;

// ======================================================
// دالة مساعدة: هل Firebase متاح؟
// ======================================================
function useFirestore() {
  return getDb() !== null;
}

// ======================================================
// قراءة البيانات - File Mode
// ======================================================
function loadFromFiles() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      productsCache = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    }
  } catch (e) { productsCache = []; }

  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      categoriesCache = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
    }
  } catch (e) { categoriesCache = { makes: [], sections: [] }; }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      settingsCache = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (e) { settingsCache = {}; }
}

// ======================================================
// الإعداد الأولي
// ======================================================
function loadData() {
  if (!useFirestore()) {
    loadFromFiles();
    // مراقبة الملفات عند التطوير المحلي بدون Firebase
    try {
      fs.watchFile(PRODUCTS_FILE, { interval: 1500 }, loadFromFiles);
      fs.watchFile(SETTINGS_FILE, { interval: 2000 }, loadFromFiles);
    } catch (_) {}
  } else {
    // تحميل أولي من Firestore بشكل متزامن (best-effort)
    _refreshAllFromFirestore().catch(console.error);
  }
}

async function _refreshAllFromFirestore() {
  const firestore = getDb();
  if (!firestore) return;

  try {
    const [settingsSnap, productsSnap, categoriesSnap] = await Promise.all([
      firestore.collection('settings').doc('main').get(),
      firestore.collection('products').orderBy('createdAt', 'desc').get(),
      firestore.collection('settings').doc('categories').get(),
    ]);

    if (settingsSnap.exists) settingsCache = settingsSnap.data();
    if (!categoriesSnap.exists) {
      // إذا ما وُجد categories في Firestore، نقرأ من الملف المحلي
      try { categoriesCache = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8')); } catch (_) {}
    } else {
      categoriesCache = categoriesSnap.data();
    }
    productsCache = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const now = Date.now();
    settingsCacheAt = now;
    categoriesCacheAt = now;
    productsCacheAt = now;
  } catch (err) {
    console.error('Firestore refresh error:', err);
  }
}

loadData();

// ======================================================
// Settings
// ======================================================
function getSettings() {
  // إعادة تحديث في الخلفية إذا انتهت مدة الـ Cache
  if (useFirestore() && Date.now() - settingsCacheAt > CACHE_TTL_MS) {
    settingsCacheAt = Date.now(); // منع طلبات متكررة
    getDb().collection('settings').doc('main').get().then(snap => {
      if (snap.exists) settingsCache = snap.data();
    }).catch(console.error);
  }
  return settingsCache;
}

function saveSettings(newSettings) {
  settingsCache = { ...settingsCache, ...newSettings };
  settingsCacheAt = Date.now();

  if (useFirestore()) {
    // كتابة في الخلفية
    getDb().collection('settings').doc('main').set(settingsCache, { merge: true }).catch(console.error);
  } else {
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf8');
    } catch (err) {
      console.warn('Warning: Could not persist settings.json:', err.message);
    }
  }
}

// ======================================================
// Categories
// ======================================================
function getCategories() {
  if (useFirestore() && Date.now() - categoriesCacheAt > CACHE_TTL_MS) {
    categoriesCacheAt = Date.now();
    getDb().collection('settings').doc('categories').get().then(snap => {
      if (snap.exists) categoriesCache = snap.data();
    }).catch(console.error);
  }
  return categoriesCache;
}

// ======================================================
// Products - Reads
// ======================================================
function getAllProducts() {
  if (useFirestore() && Date.now() - productsCacheAt > CACHE_TTL_MS) {
    productsCacheAt = Date.now();
    getDb().collection('products').orderBy('createdAt', 'desc').get().then(snap => {
      productsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }).catch(console.error);
  }
  return productsCache;
}

function getProductBySlug(slug) {
  return productsCache.find(p => p.slug === slug || p.id === slug);
}

function getProductById(id) {
  return productsCache.find(p => p.id === id);
}

function getRelatedProducts(product, limit = 4) {
  return productsCache
    .filter(p => p.id !== product.id && (p.makeId === product.makeId || p.sectionId === product.sectionId))
    .slice(0, limit);
}

function filterProducts({
  query = '', make = '', model = '', year = '', section = '',
  quality = '', minPrice = null, maxPrice = null,
  inStock = false, sort = 'newest', page = 1, limit = 12
}) {
  let results = [...getAllProducts()];

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(p => {
      const matchName  = (p.nameAr && p.nameAr.toLowerCase().includes(q)) || (p.nameEn && p.nameEn.toLowerCase().includes(q));
      const matchOem   = (p.oemNumber && p.oemNumber.toLowerCase().includes(q)) ||
        (p.alternateNumbers && p.alternateNumbers.some(a => a.toLowerCase().includes(q)));
      const matchDesc  = p.descriptionAr && p.descriptionAr.toLowerCase().includes(q);
      const matchMake  = (p.makeNameAr && p.makeNameAr.toLowerCase().includes(q)) || (p.makeId && p.makeId.toLowerCase().includes(q));
      const matchModel = (p.modelNameAr && p.modelNameAr.toLowerCase().includes(q)) || (p.modelId && p.modelId.toLowerCase().includes(q));
      const matchSect  = (p.sectionNameAr && p.sectionNameAr.toLowerCase().includes(q)) || (p.sectionId && p.sectionId.toLowerCase().includes(q));
      return matchName || matchOem || matchDesc || matchMake || matchModel || matchSect;
    });
  }

  if (make && make !== 'all')    results = results.filter(p => p.makeId === make);
  if (model && model !== 'all')  results = results.filter(p => p.modelId === model);
  if (year && year !== 'all')    { const y = parseInt(year, 10); if (!isNaN(y)) results = results.filter(p => Array.isArray(p.years) && p.years.includes(y)); }
  if (section && section !== 'all') results = results.filter(p => p.sectionId === section);
  if (quality && quality !== 'all') results = results.filter(p => p.quality === quality);
  if (minPrice !== null && !isNaN(minPrice)) results = results.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice !== null && !isNaN(maxPrice)) results = results.filter(p => p.price <= parseFloat(maxPrice));
  if (inStock === true || inStock === 'true') results = results.filter(p => p.stockStatus === 'in_stock');

  if (sort === 'price-asc' || sort === 'price_asc')   results.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc' || sort === 'price_desc') results.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc' || sort === 'name_asc') results.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  else results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const totalCount  = results.length;
  const totalPages  = Math.ceil(totalCount / limit) || 1;
  const currentPage = Math.max(1, Math.min(parseInt(page, 10) || 1, totalPages));
  const startIndex  = (currentPage - 1) * limit;

  return { products: results.slice(startIndex, startIndex + limit), totalCount, totalPages, currentPage, limit };
}

// ======================================================
// Products - Writes
// ======================================================
async function _saveProductsToFile() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning: Could not persist products.json:', err.message);
  }
}

function _buildProductDoc(productData) {
  return {
    slug: productData.slug || '',
    nameAr: productData.nameAr || 'قطعة غيار',
    nameEn: productData.nameEn || '',
    oemNumber: productData.oemNumber || '',
    alternateNumbers: Array.isArray(productData.alternateNumbers) ? productData.alternateNumbers : [],
    makeId: productData.makeId || 'greatwall',
    makeNameAr: productData.makeNameAr || 'جريت وول',
    modelId: productData.modelId || 'general',
    modelNameAr: productData.modelNameAr || 'عام',
    years: Array.isArray(productData.years) ? productData.years : [2020, 2021, 2022, 2023, 2024],
    sectionId: productData.sectionId || 'brakes',
    sectionNameAr: productData.sectionNameAr || 'الفرامل والمكابح',
    price: parseFloat(productData.price) || 0,
    oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : null,
    quality: productData.quality || 'original',
    qualityLabelAr: productData.qualityLabelAr || (productData.quality === 'original' ? 'أصلي وكالة' : 'تجاري درجة أولى'),
    originCountry: productData.originCountry || 'الصين',
    warrantyMonths: productData.warrantyMonths ? parseInt(productData.warrantyMonths, 10) : 6,
    stockStatus: productData.stockStatus || 'in_stock',
    stockQuantity: parseInt(productData.stockQuantity, 10) || 10,
    descriptionAr: productData.descriptionAr || '',
    image: productData.imageUrl || productData.image || '/images/products/p20517155.jpg',
    imageUrl: productData.imageUrl || productData.image || '/images/products/p20517155.jpg',
    featured: Boolean(productData.featured),
  };
}

function addProduct(productData) {
  const id = productData.id || `part-${Date.now()}`;
  const makeSlug = productData.makeId || 'part';
  const nameSlug = productData.nameAr
    ? productData.nameAr.replace(/[^a-zA-Z0-9\u0621-\u064A]/g, '-').replace(/-+/g, '-').toLowerCase()
    : 'item';
  const slug = productData.slug || `${makeSlug}-${nameSlug}-${Date.now().toString().slice(-4)}`;

  const newProduct = { id, slug, ..._buildProductDoc({ ...productData, slug }), createdAt: Date.now() };

  productsCache.unshift(newProduct);
  productsCacheAt = Date.now();

  // كتابة في الخلفية - لا تنتظر
  if (useFirestore()) {
    getDb().collection('products').doc(id).set(newProduct).catch(console.error);
  } else {
    _saveProductsToFile().catch(console.error);
  }

  return newProduct;
}

function updateProduct(id, productData) {
  const index = productsCache.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated = {
    ...productsCache[index],
    ...productData,
    price: productData.price !== undefined ? parseFloat(productData.price) : productsCache[index].price,
    oldPrice: productData.oldPrice !== undefined ? (productData.oldPrice ? parseFloat(productData.oldPrice) : null) : productsCache[index].oldPrice,
    stockQuantity: productData.stockQuantity !== undefined ? parseInt(productData.stockQuantity, 10) : productsCache[index].stockQuantity,
    ...(productData.imageUrl ? { image: productData.imageUrl, imageUrl: productData.imageUrl } : {}),
    updatedAt: Date.now(),
  };

  productsCache[index] = updated;
  productsCacheAt = Date.now();

  // كتابة في الخلفية
  if (useFirestore()) {
    getDb().collection('products').doc(id).set(updated, { merge: true }).catch(console.error);
  } else {
    _saveProductsToFile().catch(console.error);
  }

  return updated;
}

function deleteProduct(id) {
  const productToDelete = productsCache.find(p => p.id === id);
  if (!productToDelete) return false;

  // تنظيف الصورة المحلية إن وُجدت
  const imgToDelete = productToDelete.imageUrl || productToDelete.image;
  if (imgToDelete && imgToDelete.startsWith('/images/products/uploads/')) {
    try {
      const fullPath = path.join(__dirname, '..', 'public', imgToDelete.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (e) { console.error('Error deleting product image:', e); }
  }

  productsCache = productsCache.filter(p => p.id !== id);
  productsCacheAt = Date.now();

  // كتابة في الخلفية
  if (useFirestore()) {
    getDb().collection('products').doc(id).delete().catch(console.error);
  } else {
    _saveProductsToFile().catch(console.error);
  }

  return true;
}

function importProducts(importedArray, mode = 'append') {
  if (!Array.isArray(importedArray)) throw new Error('بيانات الاستيراد يجب أن تكون مصفوفة صالحة');

  const validProducts = [];
  const errors = [];

  importedArray.forEach((item, idx) => {
    if (!item.nameAr || !item.oemNumber || item.price === undefined) {
      errors.push(`السطر ${idx + 1}: ينقصه اسم القطعة أو رقم OEM أو السعر`);
      return;
    }
    const id   = item.id || `part-imp-${Date.now()}-${idx}`;
    const slug = item.slug || `${item.makeId || 'part'}-${item.oemNumber.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${idx}`;
    validProducts.push({ id, slug, ..._buildProductDoc(item), createdAt: Date.now() });
  });

  let added = 0, updated = 0;

  if (mode === 'overwrite') {
    productsCache = validProducts;
    added = validProducts.length;
  } else {
    validProducts.forEach(newP => {
      const existingIdx = productsCache.findIndex(p => p.oemNumber.toLowerCase() === newP.oemNumber.toLowerCase());
      if (existingIdx !== -1) {
        productsCache[existingIdx] = { ...productsCache[existingIdx], ...newP, id: productsCache[existingIdx].id };
        updated++;
      } else {
        productsCache.unshift(newP);
        added++;
      }
    });
  }

  productsCacheAt = Date.now();

  // كتابة في الخلفية
  if (useFirestore()) {
    const firestore = getDb();
    const batch = firestore.batch();
    let batchCount = 0;
    for (const prod of productsCache) {
      batch.set(firestore.collection('products').doc(prod.id), prod);
      batchCount++;
      if (batchCount >= 490) break;
    }
    batch.commit().catch(console.error);
  } else {
    _saveProductsToFile().catch(console.error);
  }

  return { importedCount: validProducts.length, added, updated, total: productsCache.length, totalNow: productsCache.length, errors };
}

// ======================================================
// الصادرات
// ======================================================
module.exports = {
  loadData,
  getSettings,
  saveSettings,
  getCategories,
  getAllProducts,
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  filterProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  importProducts,
};
