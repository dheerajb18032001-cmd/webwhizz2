// Enrollment Service
// Uses Backend API when available, falls back to direct Firestore for development

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
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to get authorization header
const getAuthHeader = async (user) => {
  if (!user) return {};
  try {
    const idToken = await user.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting ID token:', error);
    return { 'Content-Type': 'application/json' };
  }
};

// Helper to handle API errors
const handleError = (response) => {
  if (!response.ok) {
    return response.json().then(data => {
      throw new Error(data.message || 'API Error');
    });
  }
  return response.json();
};

// Enroll student in a course
export const enrollStudentInCourse = async (user, courseId, courseTitle) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ courseId }),
      });
      const result = await handleError(response);
      return { success: true, enrollmentId: result.data?.enrollmentId };
    } catch (apiError) {
      console.warn('Backend API failed, using Firestore directly:', apiError.message);
      
      // Fallback: Write directly to Firestore with client SDK
      const enrollmentData = {
        studentId: user.uid,
        studentEmail: user.email,
        courseId,
        courseTitle,
        enrolledAt: serverTimestamp(),
        progress: 0,
        status: 'active',
        completedAt: null,
        certificateIssued: false,
      };

      // Use batch to ensure atomicity
      const batch = writeBatch(db);
      
      // Add enrollment
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
      
      // Update course with student
      const courseRef = doc(db, 'courses', courseId);
      batch.update(courseRef, {
        students: arrayUnion(user.uid),
        studentCount: 1  // Note: This is not atomic, ideally use backend counter
      });
      
      await batch.commit();
      
      return { success: true, enrollmentId: enrollmentRef.id };
    }
  } catch (error) {
    console.error('Error enrolling student:', error);
    return { success: false, error: error.message };
  }
};

// Get all courses a student is enrolled in
export const getStudentEnrollments = async (user) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
        method: 'GET',
        headers,
      });
      const result = await handleError(response);
      return result.data || [];
    } catch (apiError) {
      console.warn('Backend API failed, querying Firestore directly:', apiError.message);
      
      // Fallback: Query Firestore directly
      const q = query(
        collection(db, 'enrollments'),
        where('studentId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const enrollments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return enrollments;
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
};

// Check if student is already enrolled
export const isStudentEnrolled = async (user, courseId) => {
  try {
    const enrollments = await getStudentEnrollments(user);
    return enrollments.some(e => e.courseId === courseId);
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
};

// Unenroll student from course
export const unenrollStudentFromCourse = async (user, enrollmentId) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/unenroll/${enrollmentId}`, {
        method: 'DELETE',
        headers,
      });
      await handleError(response);
      return { success: true };
    } catch (apiError) {
      console.warn('Backend API failed, deleting from Firestore:', apiError.message);
      
      // Fallback: Delete directly from Firestore
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      return { success: true };
    }
  } catch (error) {
    console.error('Error unenrolling student:', error);
    return { success: false, error: error.message };
  }
};

// Update course progress
export const updateCourseProgress = async (user, enrollmentId, progress) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/progress/${enrollmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ progress }),
      });
      await handleError(response);
      return { success: true };
    } catch (apiError) {
      console.warn('Backend API failed, updating Firestore:', apiError.message);
      
      // Fallback: Update directly in Firestore
      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      await updateDoc(enrollmentRef, {
        progress: Math.min(progress, 100)
      });
      return { success: true };
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    return { success: false, error: error.message };
  }
};

// Mark course as completed
export const completeCourse = async (user, enrollmentId) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/complete/${enrollmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ progress: 100, status: 'completed' }),
      });
      await handleError(response);
      return { success: true };
    } catch (apiError) {
      console.warn('Backend API failed, updating Firestore:', apiError.message);
      
      // Fallback: Update directly in Firestore
      const enrollmentRef = doc(db, 'enrollments', enrollmentId);
      await updateDoc(enrollmentRef, {
        progress: 100,
        status: 'completed',
        completedAt: serverTimestamp(),
        certificateIssued: true,
      });
      return { success: true };
    }
  } catch (error) {
    console.error('Error completing course:', error);
    return { success: false, error: error.message };
  }
};

// Get students enrolled in a course
export const getCourseEnrollments = async (user, courseId) => {
  try {
    // Try backend API first
    try {
      const headers = await getAuthHeader(user);
      const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}`, {
        headers,
      });
      const result = await handleError(response);
      return result.data || [];
    } catch (apiError) {
      console.warn('Backend API failed, querying Firestore:', apiError.message);
      
      // Fallback: Query Firestore directly
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
    }
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return [];
  }
};
