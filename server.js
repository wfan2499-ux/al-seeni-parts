const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('./src/db');
const views = require('./src/views');
const { layout, escapeHtml } = require('./src/templates');

const app = express();
const PORT = process.env.PORT || 3000;

// Cookie helper
function getCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Token generator based on current credentials
function generateAdminToken(username, password) {
  return crypto.createHash('sha256').update(`al-seeni-admin-auth-${username}-${password}`).digest('hex');
}

app.disable('x-powered-by');

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Helper to get admin credentials with environment variable priority
function getAdminCredentials() {
  const settings = db.getSettings();
  const username = (process.env.ADMIN_USERNAME || settings.adminUsername || 'admin').trim();
  const password = (process.env.ADMIN_PASSWORD || settings.adminPassword || 'admin2026').trim();
  const pin = (process.env.ADMIN_PIN || settings.adminPin || '2026').trim();
  return { username, password, pin };
}

// Authentication validator
function isAdminAuthenticated(req) {
  const { username, password, pin } = getAdminCredentials();
  const expectedToken = generateAdminToken(username, password);
  
  const cookieToken = getCookie(req, 'admin_token');
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const queryToken = req.query ? req.query.auth_token : null;

  // Legacy pin token support for backwards compatibility
  const legacyToken = crypto.createHash('sha256').update(`al-seeni-admin-salt-${pin}`).digest('hex');

  return cookieToken === expectedToken || headerToken === expectedToken || queryToken === expectedToken ||
         cookieToken === legacyToken || headerToken === legacyToken || queryToken === legacyToken;
}

// Login rate limiter (in-memory, 10 attempts per 15 minutes)
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 0;
    record.firstAttempt = now;
  }

  if (record.count >= 10) {
    return res.status(429).json({ error: 'تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار لمدة 15 دقيقة.' });
  }

  record.count++;
  loginAttempts.set(ip, record);
  next();
}

// Body Parsers for JSON & Form Data
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware to protect ALL /api/admin/* endpoints (except /api/admin/login)
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login') return next();
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ success: false, error: 'غير مصرح: يجب تسجيل الدخول كمسؤول للوصول إلى هذه الخدمة' });
  }
  next();
});

// Static Assets with Cache Control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0
}));

// -------------------------------------------------------------
// Public Client Pages
// -------------------------------------------------------------

// 1. Homepage
app.get('/', (req, res) => {
  try {
    const html = views.renderHomePage();
    res.send(html);
  } catch (err) {
    console.error('Error rendering homepage:', err);
    res.status(500).send('حدث خطأ في الخادم أثناء تحميل الصفحة.');
  }
});

// 2. Catalog / Search Page
app.get('/catalog', (req, res) => {
  try {
    const html = views.renderCatalogPage(req.query);
    res.send(html);
  } catch (err) {
    console.error('Error rendering catalog:', err);
    res.status(500).send('حدث خطأ أثناء تحميل الكتالوج.');
  }
});

// 3. Brand Landing Route (e.g. /brand/changan -> redirect to catalog)
app.get('/brand/:makeId', (req, res) => {
  const { makeId } = req.params;
  res.redirect(`/catalog?make=${encodeURIComponent(makeId)}`);
});

// 4. Section Landing Route (e.g. /category/brakes -> redirect to catalog)
app.get('/category/:sectionId', (req, res) => {
  const { sectionId } = req.params;
  res.redirect(`/catalog?section=${encodeURIComponent(sectionId)}`);
});

// 5. Product Details Page
app.get('/product/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const product = db.getProductBySlug(slug);
    if (!product) {
      return res.status(404).send(render404Page(slug));
    }
    const html = views.renderProductPage(product);
    res.send(html);
  } catch (err) {
    console.error('Error rendering product:', err);
    res.status(500).send('حدث خطأ أثناء تحميل تفاصيل القطعة.');
  }
});

// 6. Legal & Policy Pages
app.get('/privacy-policy', (req, res) => {
  res.send(views.renderLegalPage('privacy'));
});

app.get('/terms', (req, res) => {
  res.send(views.renderLegalPage('terms'));
});

app.get('/returns-policy', (req, res) => {
  res.send(views.renderLegalPage('returns'));
});

app.get('/compatibility-disclaimer', (req, res) => {
  res.send(views.renderLegalPage('disclaimer'));
});

// -------------------------------------------------------------
// SEO Endpoints (Sitemap & Robots.txt)
// -------------------------------------------------------------

// Dynamic XML Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const baseUrl = 'https://saudichineseparts.com';
  const products = db.getAllProducts();
  const categories = db.getCategories();
  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/catalog', priority: '0.9', changefreq: 'daily' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'monthly' },
    { path: '/returns-policy', priority: '0.4', changefreq: 'monthly' },
    { path: '/compatibility-disclaimer', priority: '0.4', changefreq: 'monthly' }
  ];

  staticPages.forEach(p => {
    xml += `  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
  });

  // Makes / Brands
  categories.makes.forEach(m => {
    xml += `  <url>\n    <loc>${baseUrl}/catalog?make=${m.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Sections
  categories.sections.forEach(s => {
    xml += `  <url>\n    <loc>${baseUrl}/catalog?section=${s.id}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Products
  products.forEach(prod => {
    xml += `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  res.send(xml);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: https://saudichineseparts.com/sitemap.xml
`;
  res.send(txt);
});

// -------------------------------------------------------------
// Admin & Management Endpoints
// -------------------------------------------------------------

// Admin Dashboard UI
app.get('/admin', (req, res) => {
  try {
    if (!isAdminAuthenticated(req)) {
      return res.send(views.renderAdminLoginPage());
    }
    const html = views.renderAdminPage();
    res.send(html);
  } catch (err) {
    console.error('Error rendering admin page:', err);
    res.status(500).send('حدث خطأ في تحميل لوحة الإدارة.');
  }
});

// Admin Authentication Endpoints
app.post('/api/admin/login', rateLimitLogin, (req, res) => {
  try {
    const { username, password, pin, remember } = req.body;
    const { username: currentUsername, password: currentPassword, pin: currentPin } = getAdminCredentials();

    let authenticated = false;

    if (username !== undefined || password !== undefined) {
      if (String(username || '').trim() === currentUsername && String(password || '').trim() === currentPassword) {
        authenticated = true;
      }
    } else if (pin !== undefined) {
      if (String(pin).trim() === currentPin) {
        authenticated = true;
      }
    }

    if (authenticated) {
      // Reset rate limiter on successful login
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      loginAttempts.delete(ip);

      const token = generateAdminToken(currentUsername, currentPassword);
      const maxAge = remember ? 30 * 24 * 3600 : 7 * 24 * 3600;
      res.setHeader('Set-Cookie', `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
});

// REST API: Upload Product Image Directly
app.post('/api/admin/upload-image', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'ملف الصورة مطلوب' });
    }

    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'صيغة الصورة غير مدعومة. يرجى اختيار ملف JPG أو PNG أو WebP' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext.includes('svg')) ext = 'svg';

    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'حجم الصورة يتجاوز الحد الأقصى (10 ميجابايت)' });
    }

    const uploadDir = path.join(__dirname, 'public', 'images', 'products', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFilename = `up_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const targetPath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    const imageUrl = `/images/products/uploads/${safeFilename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'فشل حفظ الصورة على السيرفر' });
  }
});

// REST API: Get Products (Public / Filtered)
app.get('/api/products', (req, res) => {
  const result = db.filterProducts(req.query);
  res.json(result);
});

// REST API: Get Single Product by ID (Admin)
app.get('/api/admin/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'القطعة غير موجودة' });
  res.json(product);
});

// REST API: Get Categories
app.get('/api/categories', (req, res) => {
  res.json(db.getCategories());
});

// REST API: Add New Product
app.post('/api/admin/products', async (req, res) => {
  try {
    const { nameAr, price, makeId, sectionId } = req.body;
    if (!nameAr || price === undefined || !makeId || !sectionId) {
      return res.status(400).json({ error: 'الحقول الإلزامية غير مكتملة (اسم القطعة، السعر، الشركة المصنعة، والقسم)' });
    }
    const categories = db.getCategories();
    const makeObj = categories.makes.find(m => m.id === makeId);
    const sectionObj = categories.sections.find(s => s.id === sectionId);

    const newProd = await db.addProduct({
      ...req.body,
      makeNameAr: makeObj ? makeObj.nameAr : makeId,
      sectionNameAr: sectionObj ? sectionObj.nameAr : sectionId
    });

    res.status(201).json({ success: true, product: newProd });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

// REST API: Update Existing Product (Price / Stock / Image / Info)
app.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = db.getCategories();
    const updateData = { ...req.body };

    if (updateData.makeId) {
      const makeObj = categories.makes.find(m => m.id === updateData.makeId);
      if (makeObj) updateData.makeNameAr = makeObj.nameAr;
    }
    if (updateData.sectionId) {
      const sectionObj = categories.sections.find(s => s.id === updateData.sectionId);
      if (sectionObj) updateData.sectionNameAr = sectionObj.nameAr;
    }

    const updated = await db.updateProduct(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'القطعة غير موجودة' });
    }
    res.json({ success: true, product: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// REST API: Delete Product
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ error: 'القطعة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف القطعة وتطهير ملفاتها بنجاح' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// REST API: Import Products (CSV / JSON)
app.post('/api/admin/import', async (req, res) => {
  try {
    const { items, mode } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'مصفوفة المنتجات مطلوبة للاستيراد' });
    }
    const result = await db.importProducts(items, mode || 'append');
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error importing products:', err);
    res.status(500).json({ error: err.message });
  }
});

// REST API: Export Products (JSON or CSV)
app.get('/api/admin/export', (req, res) => {
  try {
    const format = req.query.format || 'json';
    const products = db.getAllProducts();

    if (format === 'csv') {
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.attachment(`saudi-parts-catalog-${Date.now()}.csv`);
      
      const headers = ['id', 'oemNumber', 'nameAr', 'nameEn', 'makeId', 'makeNameAr', 'modelNameAr', 'sectionId', 'sectionNameAr', 'price', 'quality', 'stockStatus', 'descriptionAr'];
      let csv = '\uFEFF' + headers.join(',') + '\n';
      
      products.forEach(p => {
        const row = headers.map(h => {
          let val = p[h] !== undefined ? String(p[h]) : '';
          val = val.replace(/"/g, '""');
          return `"${val}"`;
        });
        csv += row.join(',') + '\n';
      });

      return res.send(csv);
    }

    res.header('Content-Type', 'application/json; charset=utf-8');
    res.attachment(`saudi-parts-catalog-${Date.now()}.json`);
    res.json(products);
  } catch (err) {
    console.error('Error exporting products:', err);
    res.status(500).json({ error: err.message });
  }
});

// REST API: Fetch Settings
app.get('/api/admin/settings', (req, res) => {
  res.json(db.getSettings());
});

// REST API: Update Settings (WhatsApp number, Store Name, VAT, etc.)
app.post('/api/admin/settings', async (req, res) => {
  try {
    const allowed = ['storeName', 'storeTagline', 'storeDescription', 'whatsappNumber', 'phone', 'email', 'vatNumber', 'vatRate', 'currency', 'whatsappGreeting', 'vinCheckNotice', 'adminPin', 'adminUsername', 'adminPassword'];
    const updatePayload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    }

    await db.saveSettings(updatePayload);
    res.json({ success: true, settings: db.getSettings() });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send(render404Page(req.path));
});

function render404Page(pathStr) {
  const bodyContent = `
  <div class="container error-page-wrapper">
    <div class="error-card">
      <span class="error-code">404</span>
      <h1 class="error-title">الصفحة أو القطعة المطلوبة غير موجودة</h1>
      <p class="error-desc">عذراً، الرابط الذي تحاول الوصول إليه <code>${escapeHtml(pathStr)}</code> قد يكون تم تحديثه أو نقله إلى كود بديل.</p>
      
      <div class="error-actions">
        <a href="/catalog" class="btn-primary-lg">تصفح كتالوج قطع الغيار</a>
        <a href="/" class="btn-secondary">العودة للرئيسية</a>
      </div>
    </div>
  </div>`;

  return layout({
    title: 'الصفحة غير موجودة 404',
    description: 'الصفحة المطلوبة غير موجودة في كتالوج قطع غيار السيارات الصينية.',
    canonicalUrl: 'https://saudichineseparts.com/404',
    bodyContent
  });
}

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Saudi Chinese Auto Parts Catalog Server Running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📱 Emulator:  http://10.0.2.2:${PORT}`);
    console.log(`🛠️ Admin URL: http://localhost:${PORT}/admin`);
    console.log(`📦 Catalog:   http://localhost:${PORT}/catalog`);
    console.log(`🗺️ Sitemap:   http://localhost:${PORT}/sitemap.xml`);
    console.log(`====================================================`);
  });
}

module.exports = app;
