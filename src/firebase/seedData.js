// Firebase seed utility to populate sample courses
import { db } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import sampleCourses from '../data/sampleCourses';

export const seedSampleCourses = async (instructorId) => {
  try {
    const coursesCollection = collection(db, 'courses');
    let addedCount = 0;

    for (const course of sampleCourses) {
      const newCourse = {
        ...course,
        instructorId: instructorId,
        createdAt: Timestamp.now(),
        students: [],
      };

      await addDoc(coursesCollection, newCourse);
      addedCount++;
    }

    return {
      success: true,
      message: `Successfully added ${addedCount} sample courses!`,
      count: addedCount,
    };
  } catch (error) {
    console.error('Error seeding courses:', error);
    return {
      success: false,
      message: `Error adding courses: ${error.message}`,
      count: 0,
    };
  }
};

// Function to add a single course
export const addCourseToFirestore = async (courseData) => {
  try {
    const coursesCollection = collection(db, 'courses');
    const newCourse = {
      ...courseData,
      createdAt: Timestamp.now(),
      students: [],
    };

    const docRef = await addDoc(coursesCollection, newCourse);
    return {
      success: true,
      courseId: docRef.id,
      message: 'Course added successfully!',
    };
  } catch (error) {
    console.error('Error adding course:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};
