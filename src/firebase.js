/**
 * Firebase Admin SDK Initialization
 * -----------------------------------
 * يدعم وضعين:
 * 1. محلياً: يقرأ ملف serviceAccountKey.json
 * 2. Vercel: يقرأ المتغيرات البيئية FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let db = null;

function initFirebase() {
  try {
    const apps = getApps();
    if (apps.length > 0) {
      db = getFirestore(getApp());
      return db;
    }
  } catch (_) {}

  let credential;

  // الوضع 1: متغيرات البيئة (Vercel / Production)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      let privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        privateKey: privateKey,
      });
    } catch (err) {
      console.error('⚠️ خطأ في قراءة مفتاح Firebase من متغيرات البيئة:', err.message);
      return null;
    }
  }
  // الوضع 2: ملف JSON المحلي (للتطوير)
  else {
    const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (!fs.existsSync(keyPath)) {
      console.error('⚠️  Firebase: لا يوجد serviceAccountKey.json ولا متغيرات بيئة. الـ DB سيعمل في وضع الملفات.');
      return null;
    }

    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      credential = cert(serviceAccount);
    } catch (err) {
      console.error('⚠️ خطأ في قراءة ملف serviceAccountKey.json:', err.message);
      return null;
    }
  }

  try {
    const app = initializeApp({ credential });
    db = getFirestore(app);
    console.log('✅ Firebase Firestore connected successfully');
    return db;
  } catch (err) {
    console.error('⚠️ فشل الاتصال بـ Firebase Firestore:', err.message);
    return null;
  }
}

function getDb() {
  if (!db) initFirebase();
  return db;
}

module.exports = { initFirebase, getDb };
