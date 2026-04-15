import { db } from './config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

// Enroll student in a course
export const enrollStudentInCourse = async (studentId, studentEmail, courseId, courseTitle) => {
  try {
    const enrollmentData = {
      studentId,
      studentEmail,
      courseId,
      courseTitle,
      enrolledAt: serverTimestamp(),
      progress: 0,
      status: 'active',
      completedAt: null,
      certificateIssued: false,
    };

    // Add to enrollments collection
    const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentData);

    // Update course students array
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      students: arrayUnion(studentId)
    });

    return { success: true, enrollmentId: enrollmentRef.id };
  } catch (error) {
    console.error('Error enrolling student:', error);
    return { success: false, error: error.message };
  }
};

// Get all courses a student is enrolled in
export const getStudentEnrollments = async (studentId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(q);
    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return enrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
};

// Check if student is already enrolled
export const isStudentEnrolled = async (studentId, courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

// Unenroll student from course
export const unenrollStudentFromCourse = async (enrollmentId) => {
  try {
    // Delete enrollment document
    await deleteDoc(doc(db, 'enrollments', enrollmentId));
    
    return { success: true };
  } catch (error) {
    console.error('Error unenrolling student:', error);
    return { success: false, error: error.message };
  }
};

// Update course progress
export const updateCourseProgress = async (enrollmentId, progress) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      progress: Math.min(progress, 100)
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: error.message };
  }
};

// Mark course as completed
export const completeCourse = async (enrollmentId) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    await updateDoc(enrollmentRef, {
      progress: 100,
      status: 'completed',
      completedAt: serverTimestamp(),
      certificateIssued: true,
    });
    return { success: true };
  } catch (error) {
    console.error('Error completing course:', error);
    return { success: false, error: error.message };
  }
};

// Get students enrolled in a course
export const getCourseEnrollments = async (courseId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return enrollments;
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return [];
  }
};
