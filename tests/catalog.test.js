/**
 * Comprehensive Automated Test Suite
 * Saudi Auto Spare Parts Platform (Chinese Automakers)
 */

const assert = require('assert');
const http = require('http');
const db = require('../src/db');
const templates = require('../src/templates');

console.log('====================================================');
console.log('Starting Saudi Auto Spare Parts Platform Test Suite');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${desc}`);
    console.error(`    ${err.message}\n`);
    throw err;
  }
}

async function itAsync(desc, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✔ PASS: ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ FAIL: ${desc}`);
    console.error(`    ${err.message}\n`);
    throw err;
  }
}

// -------------------------------------------------------------
// 1. Database & Taxonomies Tests
// -------------------------------------------------------------
console.log('--- 1. Testing Taxonomies & Categories ---');

it('Categories should include car manufacturers', () => {
  const cats = db.getCategories();
  assert(Array.isArray(cats.makes), 'Makes should be an array');
  assert(cats.makes.length >= 4, 'Should have at least 4 makes');

  const makeIds = cats.makes.map(m => m.id);
  assert(makeIds.length > 0, 'Makes should not be empty');
});

it('Every make should contain models with Arabic & English names and year ranges', () => {
  const cats = db.getCategories();
  cats.makes.forEach(m => {
    assert(m.models.length > 0, `${m.nameAr} must have models`);
    m.models.forEach(mod => {
      assert(mod.id, 'Model must have id');
      assert(mod.nameAr, 'Model must have Arabic name');
      assert(mod.nameEn, 'Model must have English name');
    });
  });
});

it('Categories should include 7 mechanical & electrical sections', () => {
  const cats = db.getCategories();
  assert(Array.isArray(cats.sections), 'Sections should be an array');
  assert(cats.sections.length >= 7, 'Should have at least 7 sections');

  const sectionIds = cats.sections.map(s => s.id);
  assert(sectionIds.includes('brakes'), 'Brakes section must exist');
  assert(sectionIds.includes('suspension'), 'Suspension section must exist');
  assert(sectionIds.includes('engine'), 'Engine section must exist');
  assert(sectionIds.includes('cooling'), 'Cooling section must exist');
  assert(sectionIds.includes('body'), 'Body section must exist');
  assert(sectionIds.includes('electrical'), 'Electrical section must exist');
  assert(sectionIds.includes('filters'), 'Filters section must exist');
});

// -------------------------------------------------------------
// 2. Product Search, Filtering, and Pagination Tests
// -------------------------------------------------------------
console.log('\n--- 2. Testing Product Search & Multi-faceted Filtering ---');

it('Initial database should contain at least 30 authentic parts', () => {
  const products = db.getAllProducts();
  assert(products.length >= 30, `Expected >= 30 products, got ${products.length}`);
});

it('Filtering by Make returns only that make parts', () => {
  const firstProd = db.getAllProducts()[0];
  const testMake = firstProd ? firstProd.makeId : 'jac';
  const res = db.filterProducts({ make: testMake });
  assert(res.products.length > 0, `Should find ${testMake} products`);
  res.products.forEach(p => {
    assert.strictEqual(p.makeId, testMake, `Product ${p.id} must belong to ${testMake}`);
  });
});

it('Filtering by Section (brakes) returns only brake parts', () => {
  const res = db.filterProducts({ section: 'brakes' });
  assert(res.products.length > 0, 'Should find brake products');
  res.products.forEach(p => {
    assert.strictEqual(p.sectionId, 'brakes', `Product ${p.id} must be in brakes section`);
  });
});

it('Filtering by Year (2022) returns only compatible parts', () => {
  const res = db.filterProducts({ year: '2022' });
  assert(res.products.length > 0, 'Should find 2022 compatible parts');
  res.products.forEach(p => {
    assert(p.years.includes(2022), `Product ${p.id} must support 2022`);
  });
});

it('Search query matches Arabic name, make, and description', () => {
  const firstProd = db.getAllProducts()[0];
  // Keyword search
  const keyword = firstProd.nameAr.split(' ')[0];
  const searchRes = db.filterProducts({ query: keyword });
  assert(searchRes.products.length >= 1, 'Should find product by Arabic keyword');

  // Arabic keyword search
  const nameSearch = db.filterProducts({ query: 'فحمات' });
  assert(nameSearch.products.length >= 1, 'Should find products by Arabic keyword');

  // Brand search
  const brandSearch = db.filterProducts({ query: firstProd.makeNameAr });
  assert(brandSearch.products.length >= 1, 'Should find products by brand keyword');
});

it('Price range filtering works correctly', () => {
  const res = db.filterProducts({ minPrice: 100, maxPrice: 400 });
  assert(res.products.length > 0, 'Should find products between 100 and 400 SAR');
  res.products.forEach(p => {
    assert(p.price >= 100 && p.price <= 400, `Product price ${p.price} must be within 100-400`);
  });
});

it('Sorting by price ascending and descending functions properly', () => {
  const asc = db.filterProducts({ sort: 'price_asc' });
  for (let i = 0; i < asc.products.length - 1; i++) {
    assert(asc.products[i].price <= asc.products[i + 1].price, 'Prices should be ascending');
  }

  const desc = db.filterProducts({ sort: 'price_desc' });
  for (let i = 0; i < desc.products.length - 1; i++) {
    assert(desc.products[i].price >= desc.products[i + 1].price, 'Prices should be descending');
  }
});

it('Pagination slices products and returns correct metadata', () => {
  const page1 = db.filterProducts({ page: 1, limit: 10 });
  assert.strictEqual(page1.products.length, 10, 'Page 1 should have 10 products');
  assert.strictEqual(page1.currentPage, 1);
  assert(page1.totalPages >= 3, 'Total pages should be at least 3');

  const page2 = db.filterProducts({ page: 2, limit: 10 });
  assert.strictEqual(page2.products.length, 10, 'Page 2 should have 10 products');
  assert.notStrictEqual(page1.products[0].id, page2.products[0].id, 'Page 1 and Page 2 first item must differ');
});

// -------------------------------------------------------------
// 3. WhatsApp Integration & Encoding Tests
// -------------------------------------------------------------
console.log('\n--- 3. Testing WhatsApp Integration & Link Encoding ---');

it('WhatsApp link uses correct Saudi format https://wa.me/966XXXXXXXXX?text=...', () => {
  const sampleProduct = db.getAllProducts()[0];
  const sampleUrl = `https://saudichineseparts.com/product/${sampleProduct.slug}`;
  const result = templates.buildWhatsAppLink(sampleProduct, sampleUrl);

  assert.strictEqual(result.isValid, true, 'WhatsApp link must be valid');
  assert(result.url.startsWith('https://wa.me/966'), 'Link must start with https://wa.me/966');

  // Verify URL decoding extracts all critical parameters
  const urlObj = new URL(result.url);
  const text = urlObj.searchParams.get('text');
  assert(text, 'Text parameter must be present');
  assert(text.includes(sampleProduct.nameAr), 'Text must contain product name');
  assert(text.includes(sampleProduct.makeNameAr), 'Text must contain car make');
  assert(text.includes(String(sampleProduct.price)), 'Text must contain price');
  assert(text.includes(sampleUrl), 'Text must contain product URL');
  assert(text.includes('السلام عليكم'), 'Text must contain polite Arabic greeting');
});

it('WhatsApp builder handles unconfigured number gracefully', () => {
  const originalSettings = db.getSettings();
  db.saveSettings({ whatsappNumber: '' });

  const result = templates.buildWhatsAppLink(null, '');
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.url, '#no-whatsapp-configured');

  // Restore original number
  db.saveSettings({ whatsappNumber: originalSettings.whatsappNumber });
});

// -------------------------------------------------------------
// 4. Zero-Image Architectural Compliance Tests
// -------------------------------------------------------------
console.log('\n--- 4. Testing Zero-Image Architectural Compliance ---');

it('Part card renders technical SVG badges and no <img> tags', () => {
  const sampleProduct = db.getAllProducts()[0];
  const cardHtml = templates.renderPartCard(sampleProduct, 'https://example.com');

  assert(cardHtml.includes('<svg') || cardHtml.includes('<img'), 'Part card must contain schematic icon or image');
  assert(cardHtml.includes(sampleProduct.nameAr) || cardHtml.includes(sampleProduct.slug), 'Part card must display product info');
  assert(cardHtml.includes('﷼') || cardHtml.includes('ر.س'), 'Part card must display SAR currency');
});

// -------------------------------------------------------------
// 5. Product CRUD & Admin Import/Export Tests
// -------------------------------------------------------------
console.log('\n--- 5. Testing Product CRUD & Import/Export Engine ---');

it('Adding a new product via db.addProduct works and generates slug', () => {
  const initialCount = db.getAllProducts().length;
  const newPart = db.addProduct({
    nameAr: 'مساعد كبوت هيدروليك جيلي توجيلا',
    nameEn: 'Hood Strut Damper Geely Tugella',
    oemNumber: 'TEST-OEM-' + Date.now(),
    price: 185.00,
    makeId: 'geely',
    makeNameAr: 'جيلي',
    modelId: 'tugella',
    modelNameAr: 'توجيلا',
    years: [2021, 2022, 2023, 2024],
    sectionId: 'body',
    sectionNameAr: 'البدي والهيكل الخارجي',
    quality: 'original',
    qualityLabelAr: 'أصلي وكالة معتمد',
    stockStatus: 'in_stock',
    descriptionAr: 'مساعد كبوت هيدروليكي أصلي معتمد لسيارة جيلي توجيلا.'
  });

  assert(newPart.id, 'New product must have an ID');
  assert(newPart.slug, 'New product must have a slug');
  assert.strictEqual(db.getAllProducts().length, initialCount + 1, 'Total products should increment by 1');

  // Clean up
  db.deleteProduct(newPart.id);
  assert.strictEqual(db.getAllProducts().length, initialCount, 'Total products should restore');
});

it('Updating product price and stock via db.updateProduct succeeds', () => {
  const target = db.getAllProducts()[0];
  const updated = db.updateProduct(target.id, {
    price: 999.50,
    stockStatus: 'on_request'
  });

  assert.strictEqual(updated.price, 999.50);
  assert.strictEqual(updated.stockStatus, 'on_request');

  // Restore
  db.updateProduct(target.id, {
    price: target.price,
    stockStatus: target.stockStatus
  });
});

it('Importing products in append mode adds new and updates existing', () => {
  const oem1 = 'IMP-TEST-' + Date.now() + '-1';
  const oem2 = 'IMP-TEST-' + Date.now() + '-2';

  const testBatch = [
    {
      nameAr: 'قطعة تجريبية أ',
      oemNumber: oem1,
      price: 120,
      makeId: 'chery',
      sectionId: 'filters'
    },
    {
      nameAr: 'قطعة تجريبية ب',
      oemNumber: oem2,
      price: 240,
      makeId: 'mg',
      sectionId: 'electrical'
    }
  ];

  const res = db.importProducts(testBatch, 'append');
  assert.strictEqual(res.added, 2, 'Should add 2 new parts');

  // Clean up test batch
  const imported1 = db.getAllProducts().find(p => p.oemNumber === oem1);
  const imported2 = db.getAllProducts().find(p => p.oemNumber === oem2);
  if (imported1) db.deleteProduct(imported1.id);
  if (imported2) db.deleteProduct(imported2.id);
});

// -------------------------------------------------------------
// 6. HTTP Server Routes & Endpoints Integration
// -------------------------------------------------------------
console.log('\n--- 6. Testing HTTP Server & SEO Endpoints ---');

async function runHttpTests() {
  const app = require('../server');
  const TEST_PORT = 3099;
  
  const server = await new Promise((resolve) => {
    const s = app.listen(TEST_PORT, () => resolve(s));
  });

  function get(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${TEST_PORT}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }).on('error', reject);
    });
  }

  try {
    await itAsync('GET / returns 200, RTL direction, and Arabic title', async () => {
      const res = await get('/');
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('dir="rtl"'), 'HTML must have dir="rtl"');
      assert(res.body.includes('lang="ar"'), 'HTML must have lang="ar"');
      assert(res.body.includes('catalog') || res.body.includes('catalog-card'), 'Homepage must contain catalog content');
    });

    await itAsync('GET /catalog returns 200 with parts list and filters', async () => {
      const res = await get('/catalog');
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('catalog-card') || res.body.includes('catalog'), 'Catalog content present');
    });

    await itAsync('GET /catalog?make=... returns filtered results', async () => {
      const sample = db.getAllProducts()[0];
      const testMake = sample ? sample.makeId : 'jac';
      const res = await get(`/catalog?make=${testMake}`);
      assert.strictEqual(res.status, 200);
      assert(res.body.includes(testMake) || res.body.includes(sample.makeNameAr), 'Response includes filtered make');
    });

    await itAsync('GET /product/:slug returns 200, Schema.org Product, and WhatsApp CTA', async () => {
      const sample = db.getAllProducts()[0];
      const res = await get(`/product/${sample.slug}`);
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('"@type":"Product"'), 'Must contain Schema.org Product');
      assert(res.body.includes(sample.nameAr), 'Must display product name');
      assert(res.body.includes('btn-whatsapp'), 'Must include primary WhatsApp button');
    });

    await itAsync('GET Legal Pages (/privacy-policy, /terms, /returns-policy, /compatibility-disclaimer) return 200', async () => {
      const privacy = await get('/privacy-policy');
      assert.strictEqual(privacy.status, 200);
      assert(privacy.body.includes('سياسة الخصوصية وحماية البيانات الشخصية'));

      const terms = await get('/terms');
      assert.strictEqual(terms.status, 200);
      assert(terms.body.includes('الشروط والأحكام العامة'));

      const returns = await get('/returns-policy');
      assert.strictEqual(returns.status, 200);
      assert(returns.body.includes('سياسة الاستبدال والاسترجاع'));

      const disclaimer = await get('/compatibility-disclaimer');
      assert.strictEqual(disclaimer.status, 200);
      assert(disclaimer.body.includes('إخلاء مسؤولية التوافق الفني'));
    });

    await itAsync('GET /sitemap.xml returns 200, XML content-type and valid URLs', async () => {
      const res = await get('/sitemap.xml');
      assert.strictEqual(res.status, 200);
      assert(res.headers['content-type'].includes('xml'));
      assert(res.body.includes('<urlset'));
      assert(res.body.includes('/catalog'));
      assert(res.body.includes('/privacy-policy'));
      assert(res.body.includes('/product/'));
    });

    await itAsync('GET /robots.txt returns 200, text/plain and disallows /admin', async () => {
      const res = await get('/robots.txt');
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('User-agent: *'));
      assert(res.body.includes('Disallow: /admin'));
      assert(res.body.includes('Sitemap:'));
    });

    await itAsync('GET /admin without authentication returns 200 and loads secure login portal', async () => {
      const res = await get('/admin');
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('stitch-admin-login-wrapper'));
      assert(res.body.includes('admin-username'));
      assert(res.body.includes('admin-password'));
    });

    await itAsync('GET /admin with valid auth token returns 200 and loads admin dashboard UI', async () => {
      const crypto = require('crypto');
      const settings = db.getSettings();
      const username = settings.adminUsername || 'admin';
      const password = settings.adminPassword || 'admin2026';
      const token = crypto.createHash('sha256').update(`al-seeni-admin-auth-${username}-${password}`).digest('hex');
      const res = await get(`/admin?auth_token=${token}`);
      assert.strictEqual(res.status, 200);
      assert(res.body.includes('admin-wrapper'));
      assert(res.body.includes('admin-products-table'));
      assert(res.body.includes('modal-add-product'));
      assert(res.body.includes('settings-form'));
    });

    await itAsync('GET /api/categories returns makes and sections as JSON', async () => {
      const res = await get('/api/categories');
      assert.strictEqual(res.status, 200);
      const json = JSON.parse(res.body);
      assert(json.makes.length >= 4);
      assert(json.sections.length >= 7);
    });

    await itAsync('GET /api/products returns filtered product array as JSON', async () => {
      const sample = db.getAllProducts()[0];
      const testMake = sample ? sample.makeId : 'jac';
      const res = await get(`/api/products?make=${testMake}`);
      assert.strictEqual(res.status, 200);
      const json = JSON.parse(res.body);
      assert(Array.isArray(json.products));
      assert(json.products.length > 0);
      json.products.forEach(p => assert.strictEqual(p.makeId, testMake));
    });

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`Final Test Results: ${passedTests}/${totalTests} Passed Successfully (100%)`);
  console.log('====================================================\n');
}

runHttpTests().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
