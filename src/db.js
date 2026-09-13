const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const CATEGORIES_FILE = path.join(__dirname, '..', 'data', 'categories.json');
const SETTINGS_FILE = path.join(__dirname, '..', 'config', 'settings.json');

// In-memory caches
let productsCache = [];
let categoriesCache = { makes: [], sections: [] };
let settingsCache = {};

function loadData() {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      productsCache = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading products.json:', err);
    productsCache = [];
  }

  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      categoriesCache = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading categories.json:', err);
    categoriesCache = { makes: [], sections: [] };
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      settingsCache = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading settings.json:', err);
    settingsCache = {};
  }
}

// Initial load
loadData();

// Auto reload on file change
fs.watchFile(PRODUCTS_FILE, { interval: 1500 }, () => {
  loadData();
});
fs.watchFile(SETTINGS_FILE, { interval: 2000 }, () => {
  loadData();
});

function saveProducts(newProducts) {
  productsCache = newProducts;
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning: Could not persist products.json to disk (serverless mode):', err.message);
  }
}

function saveSettings(newSettings) {
  settingsCache = { ...settingsCache, ...newSettings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning: Could not persist settings.json to disk (serverless mode):', err.message);
  }
}

function getSettings() {
  return settingsCache;
}

function getCategories() {
  return categoriesCache;
}

function getAllProducts() {
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
  query = '',
  make = '',
  model = '',
  year = '',
  section = '',
  quality = '',
  minPrice = null,
  maxPrice = null,
  inStock = false,
  sort = 'newest',
  page = 1,
  limit = 12
}) {
  let results = [...productsCache];

  // 1. Text Search (Name, OEM, Alternates, Description)
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(p => {
      const matchName = (p.nameAr && p.nameAr.toLowerCase().includes(q)) || (p.nameEn && p.nameEn.toLowerCase().includes(q));
      const matchOem = (p.oemNumber && p.oemNumber.toLowerCase().includes(q)) ||
        (p.alternateNumbers && p.alternateNumbers.some(a => a.toLowerCase().includes(q)));
      const matchDesc = p.descriptionAr && p.descriptionAr.toLowerCase().includes(q);
      const matchMake = (p.makeNameAr && p.makeNameAr.toLowerCase().includes(q)) || (p.makeId && p.makeId.toLowerCase().includes(q));
      const matchModel = (p.modelNameAr && p.modelNameAr.toLowerCase().includes(q)) || (p.modelId && p.modelId.toLowerCase().includes(q));
      const matchSection = (p.sectionNameAr && p.sectionNameAr.toLowerCase().includes(q)) || (p.sectionId && p.sectionId.toLowerCase().includes(q));
      return matchName || matchOem || matchDesc || matchMake || matchModel || matchSection;
    });
  }

  // 2. Make Filter
  if (make && make !== 'all') {
    results = results.filter(p => p.makeId === make);
  }

  // 3. Model Filter
  if (model && model !== 'all') {
    results = results.filter(p => p.modelId === model);
  }

  // 4. Year Filter
  if (year && year !== 'all') {
    const y = parseInt(year, 10);
    if (!isNaN(y)) {
      results = results.filter(p => Array.isArray(p.years) && p.years.includes(y));
    }
  }

  // 5. Section Filter
  if (section && section !== 'all') {
    results = results.filter(p => p.sectionId === section);
  }

  // 6. Quality Filter
  if (quality && quality !== 'all') {
    results = results.filter(p => p.quality === quality);
  }

  // 7. Price Filter
  if (minPrice !== null && !isNaN(minPrice)) {
    results = results.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice !== null && !isNaN(maxPrice)) {
    results = results.filter(p => p.price <= parseFloat(maxPrice));
  }

  // 8. Stock Filter
  if (inStock === true || inStock === 'true') {
    results = results.filter(p => p.stockStatus === 'in_stock');
  }

  // 9. Sorting
  if (sort === 'price-asc' || sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc' || sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'name-asc' || sort === 'name_asc') {
    results.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  } else {
    // default newest
    results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  // Total count before pagination
  const totalCount = results.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const currentPage = Math.max(1, Math.min(parseInt(page, 10) || 1, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return {
    products: paginatedResults,
    totalCount,
    totalPages,
    currentPage,
    limit
  };
}

function addProduct(productData) {
  const id = `part-${Date.now()}`;
  const makeSlug = productData.makeId || 'part';
  const nameSlug = productData.nameAr ? productData.nameAr.replace(/[^a-zA-Z0-9\u0621-\u064A]/g, '-').replace(/-+/g, '-').toLowerCase() : 'item';
  const slug = productData.slug || `${makeSlug}-${nameSlug}-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id,
    slug,
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
    featured: Boolean(productData.featured)
  };

  productsCache.unshift(newProduct);
  saveProducts(productsCache);
  return newProduct;
}

function updateProduct(id, productData) {
  const index = productsCache.findIndex(p => p.id === id);
  if (index === -1) return null;

  productsCache[index] = {
    ...productsCache[index],
    ...productData,
    price: productData.price !== undefined ? parseFloat(productData.price) : productsCache[index].price,
    oldPrice: productData.oldPrice !== undefined ? (productData.oldPrice ? parseFloat(productData.oldPrice) : null) : productsCache[index].oldPrice,
    stockQuantity: productData.stockQuantity !== undefined ? parseInt(productData.stockQuantity, 10) : productsCache[index].stockQuantity,
    ...(productData.imageUrl ? { image: productData.imageUrl, imageUrl: productData.imageUrl } : {})
  };

  saveProducts(productsCache);
  return productsCache[index];
}

function deleteProduct(id) {
  const productToDelete = productsCache.find(p => p.id === id);
  if (!productToDelete) return false;

  // Clean up uploaded image if exists on disk
  const imgToDelete = productToDelete.imageUrl || productToDelete.image;
  if (imgToDelete && imgToDelete.startsWith('/images/products/uploads/')) {
    try {
      const relPath = imgToDelete.replace(/^\//, '');
      const fullPath = path.join(__dirname, '..', 'public', relPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.error('Error deleting product image file:', e);
    }
  }

  productsCache = productsCache.filter(p => p.id !== id);
  saveProducts(productsCache);
  return true;
}

function importProducts(importedArray, mode = 'append') {
  if (!Array.isArray(importedArray)) {
    throw new Error('بيانات الاستيراد يجب أن تكون مصفوفة صالحة');
  }

  const validProducts = [];
  const errors = [];

  importedArray.forEach((item, idx) => {
    if (!item.nameAr || !item.oemNumber || item.price === undefined) {
      errors.push(`السطر ${idx + 1}: ينقصه اسم القطعة أو رقم OEM أو السعر`);
      return;
    }

    const id = item.id || `part-imp-${Date.now()}-${idx}`;
    const slug = item.slug || `${item.makeId || 'part'}-${item.oemNumber.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${idx}`;

    validProducts.push({
      id,
      slug,
      nameAr: String(item.nameAr).trim(),
      nameEn: item.nameEn ? String(item.nameEn).trim() : '',
      oemNumber: String(item.oemNumber).trim(),
      alternateNumbers: Array.isArray(item.alternateNumbers) ? item.alternateNumbers : (item.alternateNumbers ? String(item.alternateNumbers).split(',').map(s => s.trim()) : []),
      makeId: item.makeId || 'greatwall',
      makeNameAr: item.makeNameAr || 'جريت وول',
      modelId: item.modelId || 'general',
      modelNameAr: item.modelNameAr || 'عام',
      years: Array.isArray(item.years) ? item.years : [2020, 2021, 2022, 2023, 2024],
      sectionId: item.sectionId || 'brakes',
      sectionNameAr: item.sectionNameAr || 'الفرامل والمكابح',
      price: parseFloat(item.price) || 0,
      oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : null,
      quality: item.quality || 'original',
      qualityLabelAr: item.qualityLabelAr || (item.quality === 'original' ? 'أصلي وكالة' : 'تجاري درجة أولى'),
      originCountry: item.originCountry || 'الصين',
      warrantyMonths: item.warrantyMonths ? parseInt(item.warrantyMonths, 10) : 6,
      stockStatus: item.stockStatus || 'in_stock',
      stockQuantity: item.stockQuantity ? parseInt(item.stockQuantity, 10) : 15,
      descriptionAr: item.descriptionAr || 'قطعة غيار بديلة مطابقة.',
      specifications: typeof item.specifications === 'object' ? item.specifications : {},
      featured: Boolean(item.featured)
    });
  });

  let added = 0;
  let updated = 0;

  if (mode === 'overwrite') {
    productsCache = validProducts;
    added = validProducts.length;
  } else {
    // Append or update existing by oemNumber
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

  saveProducts(productsCache);

  return {
    importedCount: validProducts.length,
    added,
    updated,
    total: productsCache.length,
    totalNow: productsCache.length,
    errors
  };
}

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
  importProducts
};
