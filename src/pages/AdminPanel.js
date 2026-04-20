import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalEnrollments: 0,
    totalMessages: 0,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || userRole !== 'admin') {
      navigate('/admin-login');
    }
  }, [user, userRole, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchDashboardData();
    }
  }, [user, userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all students
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(studentsRef, where('role', '==', 'student'));
      const studentsSnap = await getDocs(studentsQuery);
      const studentsList = studentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);

      // Fetch all courses
      const coursesRef = collection(db, 'courses');
      const coursesSnap = await getDocs(coursesRef);
      const coursesList = coursesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(coursesList);

      // Fetch all instructors
      const instructorsRef = collection(db, 'users');
      const instructorsQuery = query(instructorsRef, where('role', '==', 'instructor'));
      const instructorsSnap = await getDocs(instructorsQuery);
      const instructorsList = instructorsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInstructors(instructorsList);

      // Fetch enrollments with course and student details
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsSnap = await getDocs(enrollmentsRef);
      const enrollmentsList = enrollmentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Enrich enrollments with course and student details
      const enrichedEnrollments = await Promise.all(
        enrollmentsList.map(async (enrollment) => {
          try {
            // Fetch course details
            let courseTitle = 'Unknown Course';
            if (enrollment.courseId) {
              const courseDoc = await getDocs(query(collection(db, 'courses'), where('id', '==', enrollment.courseId)));
              if (!courseDoc.empty) {
                courseTitle = courseDoc.docs[0].data().title || 'Unknown Course';
              }
            }

            // Fetch student details
            let studentName = 'Unknown Student';
            let studentEmail = '';
            if (enrollment.studentId) {
              const studentDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', enrollment.studentId)));
              if (!studentDoc.empty) {
                studentName = studentDoc.docs[0].data().fullName || studentDoc.docs[0].data().name || 'Unknown';
                studentEmail = studentDoc.docs[0].data().email || '';
              }
            }

            return {
              ...enrollment,
              courseTitle,
              studentName,
              studentEmail,
            };
          } catch (err) {
            console.warn('Error enriching enrollment:', err);
            return enrollment;
          }
        })
      );

      setEnrollments(enrichedEnrollments);

      // Fetch contact messages from backend
      let messagesList = [];
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const messagesResponse = await fetch(`${apiUrl}/messages/all`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          messagesList = messagesData.data || [];
        }
      } catch (err) {
        console.warn('Could not fetch messages:', err);
      }
      setMessages(messagesList);

      // Update stats
      setStats({
        totalStudents: studentsList.length,
        totalCourses: coursesList.length,
        totalInstructors: instructorsList.length,
        totalEnrollments: enrichedEnrollments.length,
        totalMessages: messagesList.length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'users', studentId));
        setStudents(students.filter(s => s.id !== studentId));
        alert('✓ Student deleted successfully');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('❌ Failed to delete student');
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        setCourses(courses.filter(c => c.id !== courseId));
        alert('✓ Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('❌ Failed to delete course');
      }
    }
  };

  const handleDeleteInstructor = async (instructorId) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        await deleteDoc(doc(db, 'users', instructorId));
        setInstructors(instructors.filter(i => i.id !== instructorId));
        alert('✓ Instructor deleted successfully');
      } catch (error) {
        console.error('Error deleting instructor:', error);
        alert('❌ Failed to delete instructor');
      }
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to remove this enrollment?')) {
      try {
        await deleteDoc(doc(db, 'enrollments', enrollmentId));
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
        alert('✓ Enrollment removed successfully');
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        alert('❌ Failed to remove enrollment');
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/messages/${messageId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setMessages(messages.filter(m => m.id !== messageId));
          alert('✓ Message deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('❌ Failed to delete message');
      }
    }
  };

  if (loading) {
    return <div className="admin-panel-container"><div className="loading">Loading Admin Panel...</div></div>;
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h1>🛡️ Admin Panel</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      {/* Dashboard Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalCourses}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalInstructors}</div>
          <div className="stat-label">Total Instructors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalEnrollments}</div>
          <div className="stat-label">Total Enrollments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalMessages}</div>
          <div className="stat-label">Contact Messages</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students ({students.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📚 Courses ({courses.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructors')}
        >
          👨‍🏫 Instructors ({instructors.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollments')}
        >
          ✏️ Enrollments ({enrollments.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          📧 Messages ({messages.length})
        </button>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="tab-content">
          <h2>Student Management</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Enrolled Courses</th>
                  <th>Completed Courses</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="8" className="no-data">No students found</td></tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.email}</strong></td>
                      <td>{student.fullName || student.name || '—'}</td>
                      <td>{student.phone || '—'}</td>
                      <td className="center">{student.enrolledCourses?.length || 0}</td>
                      <td className="center">{student.completedCourses?.length || 0}</td>
                      <td>
                        <span className={`status-badge ${student.status === 'active' ? 'active' : 'inactive'}`}>
                          {student.status || 'active'}
                        </span>
                      </td>
                      <td>{student.createdAt ? new Date(student.createdAt.toDate ? student.createdAt.toDate() : student.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => navigate(`/student-profile/${student.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="tab-content">
          <h2>Course Management</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr><td colSpan="6" className="no-data">No courses found</td></tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.instructor || '—'}</td>
                      <td>{course.category}</td>
                      <td>₹{course.price || 'Free'}</td>
                      <td>{course.students?.length || 0}</td>
                      <td>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => navigate(`/course/${course.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructors Tab */}
      {activeTab === 'instructors' && (
        <div className="tab-content">
          <h2>Instructor Management</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Courses Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.length === 0 ? (
                  <tr><td colSpan="5" className="no-data">No instructors found</td></tr>
                ) : (
                  instructors.map(instructor => (
                    <tr key={instructor.id}>
                      <td>{instructor.email}</td>
                      <td>{instructor.name || '—'}</td>
                      <td>{instructor.coursesCreated?.length || 0}</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => navigate(`/instructor-profile/${instructor.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteInstructor(instructor.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="tab-content">
          <h2>Student Enrollments</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Course Title</th>
                  <th>Enrollment Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr><td colSpan="7" className="no-data">No enrollments found</td></tr>
                ) : (
                  enrollments.map(enrollment => (
                    <tr key={enrollment.id}>
                      <td><strong>{enrollment.studentName}</strong></td>
                      <td>{enrollment.studentEmail || '—'}</td>
                      <td>{enrollment.courseTitle}</td>
                      <td>{enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${enrollment.progress || 0}%`}}></div>
                        </div>
                        <span className="progress-text">{enrollment.progress || 0}%</span>
                      </td>
                      <td>
                        <span className={`status-badge ${enrollment.status === 'completed' ? 'active' : 'inactive'}`}>
                          {enrollment.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteEnrollment(enrollment.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="tab-content">
          <h2>Contact Messages</h2>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr><td colSpan="7" className="no-data">No messages found</td></tr>
                ) : (
                  messages.map(message => (
                    <tr key={message.id}>
                      <td><strong>{message.full_name}</strong></td>
                      <td>{message.email}</td>
                      <td>{message.phone || '—'}</td>
                      <td>{message.subject}</td>
                      <td className="message-cell">{message.message.substring(0, 50)}...</td>
                      <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="action-btn view-btn"
                          onClick={() => alert(`Full Message:\n\n${message.message}`)}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
