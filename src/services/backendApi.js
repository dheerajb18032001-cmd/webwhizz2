// Backend API Service for Frontend
// Handles all backend API calls with proper authentication

import { getAuth } from 'firebase/auth';

// Get base URL - adjust for your environment
const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://whizz-backend.herokuapp.com/api'  // Update with your production backend URL
    : 'http://localhost:5000/api'
  );

/**
 * Get ID token for authenticated requests
 */
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return await user.getIdToken();
};

/**
 * Make authenticated API call
 */
const apiCall = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

// ==================== 🛡️ ADMIN API ====================

/**
 * Verify if user is authorized admin
 * GET /admin/verify
 */
export const verifyAdminAccess = async () => {
  return apiCall('/admin/verify');
};

/**
 * Get list of approved admins
 * GET /admin/list
 */
export const getApprovedAdminsList = async () => {
  return apiCall('/admin/list');
};

/**
 * Add new admin to approved list
 * POST /admin/add
 */
export const addAdminToList = async (email, name = '') => {
  return apiCall('/admin/add', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
};

/**
 * Remove admin from approved list
 * DELETE /admin/remove/:email
 */
export const removeAdminFromList = async (email) => {
  return apiCall(`/admin/remove/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
};

/**
 * Get dashboard statistics
 * GET /admin/stats
 */
export const getDashboardStats = async () => {
  return apiCall('/admin/stats');
};

/**
 * Get all users with optional filters
 * GET /admin/users?role=student&limit=50&offset=0
 */
export const getAllUsers = async (role = null, limit = 50, offset = 0) => {
  const params = new URLSearchParams({
    limit,
    offset,
  });
  
  if (role) {
    params.append('role', role);
  }

  return apiCall(`/admin/users?${params.toString()}`);
};

/**
 * Delete user by ID
 * DELETE /admin/users/:userId
 */
export const deleteUser = async (userId) => {
  return apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

// ==================== 📚 COURSES API ====================

/**
 * Get all courses
 * GET /courses
 */
export const getCourses = async () => {
  return apiCall('/courses');
};

/**
 * Get course by ID
 * GET /courses/:courseId
 */
export const getCourseById = async (courseId) => {
  return apiCall(`/courses/${courseId}`);
};

/**
 * Create new course (instructor/admin only)
 * POST /courses
 */
export const createCourse = async (courseData) => {
  return apiCall('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });
};

/**
 * Update course (instructor/admin only)
 * PUT /courses/:courseId
 */
export const updateCourse = async (courseId, courseData) => {
  return apiCall(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });
};

/**
 * Delete course (admin only)
 * DELETE /courses/:courseId
 */
export const deleteCourse = async (courseId) => {
  return apiCall(`/courses/${courseId}`, {
    method: 'DELETE',
  });
};

// ==================== ✏️ ENROLLMENTS API ====================

/**
 * Get user enrollments
 * GET /enrollments
 */
export const getUserEnrollments = async () => {
  return apiCall('/enrollments');
};

/**
 * Enroll in course
 * POST /enrollments
 */
export const enrollCourse = async (courseId) => {
  return apiCall('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });
};

/**
 * Get enrollment by ID
 * GET /enrollments/:enrollmentId
 */
export const getEnrollmentById = async (enrollmentId) => {
  return apiCall(`/enrollments/${enrollmentId}`);
};

/**
 * Update enrollment
 * PUT /enrollments/:enrollmentId
 */
export const updateEnrollment = async (enrollmentId, data) => {
  return apiCall(`/enrollments/${enrollmentId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Delete enrollment
 * DELETE /enrollments/:enrollmentId
 */
export const deleteEnrollment = async (enrollmentId) => {
  return apiCall(`/enrollments/${enrollmentId}`, {
    method: 'DELETE',
  });
};

// ==================== 👥 USERS API ====================

/**
 * Get current user profile
 * GET /users/profile
 */
export const getUserProfile = async () => {
  return apiCall('/users/profile');
};

/**
 * Update user profile
 * PUT /users/profile
 */
export const updateUserProfile = async (profileData) => {
  return apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

/**
 * Get user by ID
 * GET /users/:userId
 */
export const getUserById = async (userId) => {
  return apiCall(`/users/${userId}`);
};

// ==================== 🔐 AUTH API ====================

/**
 * Get current user
 * GET /auth/me
 */
export const getCurrentUser = async () => {
  return apiCall('/auth/me');
};

/**
 * Update user profile via auth
 * PUT /auth/profile
 */
export const updateAuthProfile = async (profileData) => {
  return apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

/**
 * Get user by email
 * GET /auth/user/:email
 */
export const getUserByEmail = async (email) => {
  return apiCall(`/auth/user/${encodeURIComponent(email)}`);
};

// ==================== 🔐 HEALTH CHECK ====================

/**
 * Check if backend is running
 */
export const checkHealthStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// ==================== ERROR HANDLING ====================

/**
 * Format API error for display
 */
export const formatErrorMessage = (error) => {
  if (error.message.includes('User not authenticated')) {
    return 'Please log in to continue';
  }
  if (error.message.includes('Cannot update')) {
    return 'You do not have permission to make this change';
  }
  return error.message || 'An error occurred. Please try again.';
};

// Export API_BASE_URL for debugging
export { API_BASE_URL };
