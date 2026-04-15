// Firebase auto-seeding utility
// Automatically seeds courses to Firestore on first run

import { db } from './config';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import sampleCourses from '../data/sampleCourses';

const SEED_STATUS_KEY = 'whizz_courses_seeded';

export const ensureCoursesSeeded = async () => {
  try {
    // Check if already seeded in this session
    const sessionSeeded = sessionStorage.getItem(SEED_STATUS_KEY);
    if (sessionSeeded === 'true') {
      return { seeded: false, message: 'Courses already loaded in session' };
    }

    // Check Firestore for existing courses
    const coursesCollection = collection(db, 'courses');
    const snapshot = await getDocs(coursesCollection);
    
    if (snapshot.size > 0) {
      sessionStorage.setItem(SEED_STATUS_KEY, 'true');
      return { 
        seeded: false, 
        message: `Found ${snapshot.size} existing courses in database`,
        count: snapshot.size 
      };
    }

    // If no courses exist, seed them
    console.log('📚 No courses found in database. Seeding sample courses...');
    
    let addedCount = 0;
    const coursesRef = collection(db, 'courses');

    for (const course of sampleCourses) {
      try {
        const newCourse = {
          ...course,
          instructorId: 'system_default',
          createdAt: Timestamp.now(),
          students: [],
        };

        await addDoc(coursesRef, newCourse);
        addedCount++;
      } catch (err) {
        console.error(`Failed to add course ${course.title}:`, err.message);
      }
    }

    sessionStorage.setItem(SEED_STATUS_KEY, 'true');
    
    return {
      seeded: true,
      message: `✅ Successfully seeded ${addedCount} courses to Firebase!`,
      count: addedCount,
    };
  } catch (error) {
    console.error('Error in auto-seeding:', error);
    return {
      seeded: false,
      message: 'Could not verify courses (offline?)',
      error: error.message,
    };
  }
};

// Cache courses locally for offline access
export const getCoursesCached = async () => {
  try {
    const coursesCollection = collection(db, 'courses');
    const snapshot = await getDocs(coursesCollection);
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Cache locally
    localStorage.setItem('whizz_courses_cache', JSON.stringify(courses));
    localStorage.setItem('whizz_courses_cache_time', Date.now().toString());
    
    return courses;
  } catch (err) {
    console.warn('Could not fetch from Firebase, using cache:', err.message);
    const cached = localStorage.getItem('whizz_courses_cache');
    return cached ? JSON.parse(cached) : sampleCourses;
  }
};
