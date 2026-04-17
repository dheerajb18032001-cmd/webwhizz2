// Firebase Admin SDK Configuration
// Initialize Firebase Admin for backend use

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin using environment variables or service account
let serviceAccount = null;

// Try to load service account
try {
  // Priority 1: Environment variable (for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('✅ Firebase Admin: Loaded service account from FIREBASE_SERVICE_ACCOUNT env var');
    } catch (parseError) {
      console.error('❌ Firebase Error: Invalid JSON in FIREBASE_SERVICE_ACCOUNT:', parseError.message);
    }
  } else {
    // Priority 2: Local file (for development)
    try {
      serviceAccount = require('../src/firebase/serviceAccountKey.json');
      console.log('✅ Firebase Admin: Loaded service account from serviceAccountKey.json');
    } catch (fileError) {
      console.warn('⚠️  Firebase: No serviceAccountKey.json found at src/firebase/serviceAccountKey.json');
      console.warn('   Falling back to default credentials (development mode)');
      serviceAccount = null;
    }
  }
} catch (error) {
  console.error('⚠️  Firebase: Unexpected error loading credentials:', error.message);
  serviceAccount = null;
}

// Initialize Firebase Admin SDK
try {
  if (serviceAccount && serviceAccount.private_key) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'whizz-3fcf2',
    });
    console.log('✅ Firebase Admin SDK initialized with credentials');
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'whizz-3fcf2',
    });
    console.log('⚠️  Firebase Admin SDK initialized with default credentials (development mode)');
    console.log('   For production, set FIREBASE_SERVICE_ACCOUNT env variable');
  }
} catch (error) {
  console.error('❌ Firebase Initialization Error:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// Test connection
db.collection('_test').limit(1).get()
  .then(() => {
    console.log('✅ Firestore connection verified');
  })
  .catch((error) => {
    console.warn('⚠️  Firestore connection test failed (may be due to permissions):', error.code);
  });

module.exports = {
  admin,
  db,
  auth,
};
