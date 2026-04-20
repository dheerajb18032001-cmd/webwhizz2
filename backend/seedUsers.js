#!/usr/bin/env node
/**
 * Seed test users to Firebase
 * Usage: node seedUsers.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using environment or default
let serviceAccount;
try {
  serviceAccount = require('./src/firebase/serviceAccountKey.json');
} catch (err) {
  console.log('⚠️  serviceAccountKey.json not found. Using default credentials.');
  // Try to use default credentials (works with GOOGLE_APPLICATION_CREDENTIALS env var)
  admin.initializeApp();
  runSeed();
  process.exit(0);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://computer-250e7.firebaseio.com'
});

runSeed();

async function runSeed() {
  const db = admin.firestore();
  const auth = admin.auth();

  const testUsers = [
    {
      email: 'admin@whizz.com',
      password: 'Admin@123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'student@whizz.com',
      password: 'Student@123',
      name: 'Student User',
      role: 'student'
    },
    {
      email: 'instructor@whizz.com',
      password: 'Instructor@123',
      name: 'Instructor User',
      role: 'instructor'
    }
  ];

  console.log('🚀 Starting to seed users...\n');

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      let user;
      try {
        user = await auth.getUserByEmail(userData.email);
        console.log(`⏭️  User already exists: ${userData.email}`);
      } catch (err) {
        // User doesn't exist, create it
        user = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.name
        });
        console.log(`✅ Created Firebase auth user: ${userData.email}`);
      }

      // Create/Update user document in Firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: userData.email,
        fullName: userData.name,
        name: userData.name,
        role: userData.role,
        sign_up_as: userData.role,
        profilePicture: null,
        bio: '',
        phone: '',
        status: 'active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        enrolledCourses: [],
        completedCourses: [],
      }, { merge: true });

      console.log(`✅ Created Firestore user: ${userData.email} (Role: ${userData.role})\n`);
    } catch (error) {
      console.error(`❌ Failed to seed user ${userData.email}:`, error.message);
    }
  }

  console.log('✅ User seeding complete!\n');
  console.log('Test credentials:');
  testUsers.forEach(u => {
    console.log(`  📧 ${u.email} / ${u.password} (${u.role})`);
  });

  process.exit(0);
}
