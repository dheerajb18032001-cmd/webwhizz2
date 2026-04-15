#!/usr/bin/env node
/**
 * Seed all sample courses to Firebase Firestore
 * Usage: node seedCourses.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./src/firebase/serviceAccountKey.json').default || require('./src/firebase/serviceAccountKey.json');
const sampleCourses = require('./src/data/sampleCourses').default;

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://computer-250e7.firebaseio.com'
});

const db = admin.firestore();

async function seedCourses() {
  try {
    console.log('🚀 Starting to seed courses...\n');
    
    let addedCount = 0;
    const errors = [];

    for (const course of sampleCourses) {
      try {
        const newCourse = {
          ...course,
          instructorId: 'system_seed',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          students: [],
        };

        const docRef = await db.collection('courses').add(newCourse);
        console.log(`✅ Added: ${course.title} (${course.category})`);
        addedCount++;
      } catch (err) {
        errors.push(`${course.title}: ${err.message}`);
        console.log(`❌ Failed: ${course.title}`);
      }
    }

    console.log(`\n========================================`);
    console.log(`📊 Seeding Complete!`);
    console.log(`✅ Successfully added: ${addedCount} courses`);
    if (errors.length > 0) {
      console.log(`❌ Failed: ${errors.length} courses`);
      console.log('\nErrors:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    console.log(`========================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

seedCourses();
