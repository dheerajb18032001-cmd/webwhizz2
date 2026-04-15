// Firebase Admin SDK Configuration
// Initialize Firebase Admin for backend use

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin using environment variables or service account
let serviceAccount;

try {
  // Try to load from environment variable first (for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fall back to local service account file (for development)
    serviceAccount = require('../src/firebase/serviceAccountKey.json');
  }
} catch (error) {
  console.error('⚠️  Could not load Firebase service account. Using default credentials...');
  serviceAccount = null;
}

// Initialize Firebase Admin SDK
if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'whizz-3fcf2',
  });
} else {
  admin.initializeApp({
    projectId: 'whizz-3fcf2',
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
