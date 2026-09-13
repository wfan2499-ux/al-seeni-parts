/**
 * seed-firebase.js
 * ------------------
 * سكريبت يرفع البيانات الحالية من JSON files إلى Firebase Firestore.
 * يُشغَّل مرة واحدة فقط بعد إعداد Firebase.
 *
 * الاستخدام:
 *   node scripts/seed-firebase.js
 *
 * المتطلبات: وجود serviceAccountKey.json في جذر المشروع
 */

const path = require('path');
const fs   = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ==========================================
// تهيئة Firebase
// ==========================================
const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
  console.error('\n❌ الملف serviceAccountKey.json غير موجود في جذر المشروع!');
  console.error('   قم بتحميله من Firebase Console > Project Settings > Service Accounts\n');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ==========================================
// قراءة البيانات المحلية
// ==========================================
const PRODUCTS_FILE   = path.join(__dirname, '..', 'data', 'products.json');
const CATEGORIES_FILE = path.join(__dirname, '..', 'data', 'categories.json');
const SETTINGS_FILE   = path.join(__dirname, '..', 'config', 'settings.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`⚠️  لا يمكن قراءة ${filePath}، سيُستخدم الافتراضي.`);
    return fallback;
  }
}

const settings   = readJson(SETTINGS_FILE, {});
const categories = readJson(CATEGORIES_FILE, { makes: [], sections: [] });
const products   = readJson(PRODUCTS_FILE, []);

// ==========================================
// رفع البيانات إلى Firestore
// ==========================================
async function seed() {
  console.log('\n🔥 بدء رفع البيانات إلى Firebase Firestore...\n');

  // 1. الإعدادات
  console.log('📋 رفع الإعدادات (settings)...');
  await db.collection('settings').doc('main').set(settings);
  console.log('   ✅ تم رفع الإعدادات');

  // 2. التصنيفات
  console.log('🏷️  رفع التصنيفات (categories)...');
  await db.collection('settings').doc('categories').set(categories);
  console.log(`   ✅ تم رفع ${categories.makes.length} شركة و ${categories.sections.length} قسم`);

  // 3. المنتجات (batch writes لتجاوز الحد 500)
  console.log(`📦 رفع ${products.length} قطعة غيار...`);

  const BATCH_SIZE = 400;
  let totalUploaded = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach(product => {
      const id  = product.id || `part-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ref = db.collection('products').doc(id);
      batch.set(ref, { ...product, id, createdAt: product.createdAt || Date.now() });
    });

    await batch.commit();
    totalUploaded += chunk.length;
    console.log(`   ✅ ${totalUploaded}/${products.length} قطعة تم رفعها`);
  }

  console.log('\n🎉 اكتمل الرفع بنجاح إلى Firebase Firestore!');
  console.log('   جميع قطع الغيار والإعدادات والتصنيفات أصبحت مخزنة على السحابة.\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ خطأ أثناء رفع البيانات:', err.message);
  process.exit(1);
});
