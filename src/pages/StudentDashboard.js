import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (userRole !== 'student') {
      navigate('/');
      return;
    }

    fetchStudentData();
  }, [user, userRole, navigate]);

  const fetchStudentData = async () => {
    try {
      // Fetch user profile
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        // Fetch enrolled courses
        const enrollmentsRef = collection(db, 'enrollments');
        const q = query(enrollmentsRef, where('studentId', '==', user.uid));
        const snapshot = await getDocs(q);

        const courses = [];
        for (const enrollmentDoc of snapshot.docs) {
          const courseId = enrollmentDoc.data().courseId;
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          if (courseDoc.exists()) {
            courses.push({
              id: courseId,
              enrollmentId: enrollmentDoc.id,
              progress: enrollmentDoc.data().progress || 0,
              ...courseDoc.data(),
            });
          }
        }
        setEnrolledCourses(courses);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📚 My Learning Dashboard</h1>
        <p>Welcome back, {userProfile?.name || user?.email}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{enrolledCourses.length}</h3>
            <p>Courses Enrolled</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>
              {enrolledCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / enrolledCourses.length || 0}%
            </h3>
            <p>Average Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>{userProfile?.certificates?.length || 0}</h3>
            <p>Certificates</p>
          </div>
        </div>
      </div>

      <div className="course-section">
        <h2>Your Courses</h2>
        {loading ? (
          <div className="loading">Loading your courses...</div>
        ) : enrolledCourses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <a href="/courses" className="browse-btn">Browse Courses</a>
          </div>
        ) : (
          <div className="enrolled-courses">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="enrolled-course-card">
                <img
                  src={course.image || 'https://via.placeholder.com/300x150?text=' + course.title}
                  alt={course.title}
                  className="course-image"
                />
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <p className="course-category">{course.category}</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <p className="progress-text">Progress: {course.progress}%</p>
                </div>
                <button className="continue-btn">Continue Learning →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
