// Firebase auto-seeding utility
// Automatically fetches courses from backend API (or uses sample data if offline)

import sampleCourses from '../data/sampleCourses';

const SEED_STATUS_KEY = 'whizz_courses_seeded';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ensureCoursesSeeded = async () => {
  try {
    // Check if already seeded in this session
    const sessionSeeded = sessionStorage.getItem(SEED_STATUS_KEY);
    if (sessionSeeded === 'true') {
      return { seeded: false, message: 'Courses already loaded in session' };
    }

    // Try to fetch courses from backend API
    try {
      const response = await fetch(`${API_BASE_URL}/courses?limit=100`);
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          sessionStorage.setItem(SEED_STATUS_KEY, 'true');
          return {
            seeded: false,
            message: `✅ Loaded ${result.data.length} courses from backend`,
            count: result.data.length,
          };
        }
      }
    } catch (fetchError) {
      console.warn('Could not fetch from backend API:', fetchError.message);
    }

    // If backend didn't work, use sample data from local cache
    console.log('📚 Using sample courses locally');
    sessionStorage.setItem(SEED_STATUS_KEY, 'true');
    localStorage.setItem('whizz_courses_cache', JSON.stringify(sampleCourses));

    return {
      seeded: false,
      message: 'Using sample courses (backend offline)',
      count: sampleCourses.length,
    };
  } catch (error) {
    console.error('Error in auto-seeding:', error);
    return {
      seeded: false,
      message: 'Could not verify courses',
      error: error.message,
    };
  }
};

// Cache courses locally for offline access
export const getCoursesCached = async () => {
  try {
    // Try to get from backend API first
    try {
      const response = await fetch(`${API_BASE_URL}/courses?limit=100`);
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          // Cache locally
          localStorage.setItem('whizz_courses_cache', JSON.stringify(result.data));
          localStorage.setItem('whizz_courses_cache_time', Date.now().toString());
          return result.data;
        }
      }
    } catch (fetchError) {
      console.warn('Could not fetch from backend:', fetchError.message);
    }

    // Fall back to cached data or sample data
    const cached = localStorage.getItem('whizz_courses_cache');
    if (cached) {
      console.log('📦 Using cached courses');
      return JSON.parse(cached);
    }

    console.log('📚 Using sample courses');
    return sampleCourses;
  } catch (err) {
    console.warn('Could not fetch courses:', err.message);
    return sampleCourses;
  }
};
