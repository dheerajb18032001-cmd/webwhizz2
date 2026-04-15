// API Service - Frontend to Backend Communication
// All backend API calls

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

// Error handler
const handleError = (response) => {
  if (!response.ok) {
    return response.json().then(data => {
      throw new Error(data.message || 'API Error');
    });
  }
  return response.json();
};

// ============ AUTHENTICATION ENDPOINTS ============

export const authAPI = {
  // Signup
  signup: async (email, password, name, role = 'student') => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    return handleError(response);
  },

  // Get current user
  getCurrentUser: async (user) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },

  // Update profile
  updateProfile: async (user, data) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleError(response);
  },

  // Logout
  logout: async (user) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers,
    });
    return handleError(response);
  },
};

// ============ COURSES ENDPOINTS ============

export const coursesAPI = {
  // Get all courses
  getAllCourses: async (category = null, search = null, limit = 50, offset = 0) => {
    let url = `${API_BASE_URL}/courses?limit=${limit}&offset=${offset}`;
    if (category && category !== 'all') url += `&category=${encodeURIComponent(category)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url);
    return handleError(response);
  },

  // Get single course
  getCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    return handleError(response);
  },

  // Create course (Instructor/Admin)
  createCourse: async (user, courseData) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(courseData),
    });
    return handleError(response);
  },

  // Update course (Instructor/Admin)
  updateCourse: async (user, courseId, courseData) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(courseData),
    });
    return handleError(response);
  },

  // Delete course (Instructor/Admin)
  deleteCourse: async (user, courseId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers,
    });
    return handleError(response);
  },

  // Get instructor's courses
  getInstructorCourses: async (user) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/courses/instructor/my-courses`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },
};

// ============ ENROLLMENTS ENDPOINTS ============

export const enrollmentsAPI = {
  // Enroll in course
  enrollCourse: async (user, courseId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ courseId }),
    });
    return handleError(response);
  },

  // Get my enrollments
  getMyEnrollments: async (user) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },

  // Check if enrolled
  checkEnrollment: async (user, courseId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/check/${courseId}`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },

  // Update progress
  updateProgress: async (user, enrollmentId, progress) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/progress/${enrollmentId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ progress }),
    });
    return handleError(response);
  },

  // Complete course
  completeCourse: async (user, enrollmentId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/complete/${enrollmentId}`, {
      method: 'POST',
      headers,
    });
    return handleError(response);
  },

  // Unenroll
  unenroll: async (user, enrollmentId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
      headers,
    });
    return handleError(response);
  },

  // Get course enrollments (Instructor)
  getCourseEnrollments: async (user, courseId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}/enrollments`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },
};

// ============ USERS ENDPOINTS ============

export const usersAPI = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return handleError(response);
  },

  // Get all users
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleError(response);
  },

  // Update user profile
  updateUserProfile: async (user, userId, data) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return handleError(response);
  },

  // Get user stats
  getUserStats: async (user, userId) => {
    const headers = await getAuthHeader(user);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
      method: 'GET',
      headers,
    });
    return handleError(response);
  },
};

// ============ HEALTH CHECK ============

export const apiUtils = {
  checkBackendHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
      return await handleError(response);
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  },
};
