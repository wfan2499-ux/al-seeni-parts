/**
 * Firebase Admin SDK Initialization
 * -----------------------------------
 * يدعم وضعين:
 * 1. محلياً: يقرأ ملف serviceAccountKey.json
 * 2. Vercel: يقرأ المتغيرات البيئية FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

const admin = require('firebase-admin');

let db = null;

function initFirebase() {
  try {
    if (admin.apps && admin.apps.length > 0) {
      db = admin.app().firestore();
      return db;
    }
  } catch (_) {}

  let credential;

  // الوضع 1: متغيرات البيئة (Vercel / Production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel يحول \n إلى \\n في المتغيرات، نعيدها لأسطر حقيقية
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }
  // الوضع 2: ملف JSON المحلي (للتطوير)
  else {
    const path = require('path');
    const fs = require('fs');
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (!fs.existsSync(keyPath)) {
      console.error('⚠️  Firebase: لا يوجد serviceAccountKey.json ولا متغيرات بيئة. الـ DB سيعمل في وضع الملفات.');
      return null;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({ credential });
  db = admin.firestore();
  console.log('✅ Firebase Firestore connected');
  return db;
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

module.exports = { initFirebase, getDb };
