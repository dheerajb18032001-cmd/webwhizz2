import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    dateOfBirth: '',
    qualification: '',
    schoolCollege: '',
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
    interests: '',
    enrolledCourses: [],
  });

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!user) return;

        // Get student profile from Firestore
        const studentDocRef = doc(db, 'users', user.uid);
        const studentDocSnap = await getDoc(studentDocRef);

        if (studentDocSnap.exists()) {
          const data = studentDocSnap.data();
          setStudentData({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
            dateOfBirth: data.dateOfBirth || '',
            qualification: data.qualification || '',
            schoolCollege: data.schoolCollege || '',
            parentName: data.parentName || '',
            parentPhone: data.parentPhone || '',
            emergencyContact: data.emergencyContact || '',
            interests: data.interests || '',
            enrolledCourses: data.enrolledCourses || [],
          });
          setEditData({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            pincode: data.pincode || '',
            dateOfBirth: data.dateOfBirth || '',
            qualification: data.qualification || '',
            schoolCollege: data.schoolCollege || '',
            parentName: data.parentName || '',
            parentPhone: data.parentPhone || '',
            emergencyContact: data.emergencyContact || '',
            interests: data.interests || '',
          });
        } else {
          // Create initial profile if doesn't exist
          const initialData = {
            name: user.displayName || '',
            email: user.email,
            phone: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            dateOfBirth: '',
            qualification: '',
            schoolCollege: '',
            parentName: '',
            parentPhone: '',
            emergencyContact: '',
            interests: '',
            enrolledCourses: [],
            role: 'student',
            uid: user.uid,
            createdAt: new Date(),
          };
          await setDoc(studentDocRef, initialData);
          setStudentData(initialData);
          setEditData(initialData);
        }

        // Fetch enrolled courses
        const enrollmentsRef = collection(db, 'enrollments');
        const q = query(enrollmentsRef, where('studentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const courses = [];
        for (const doc of querySnapshot.docs) {
          const enrollmentData = doc.data();
          const courseRef = doc(db, 'courses', enrollmentData.courseId);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            courses.push({
              ...courseSnap.data(),
              courseId: enrollmentData.courseId,
              enrollmentStatus: enrollmentData.status || 'enrolled',
            });
          }
        }
        setEnrolledCourses(courses);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setError('');
      if (!user) return;

      const studentDocRef = doc(db, 'users', user.uid);
      await updateDoc(studentDocRef, editData);

      setStudentData(editData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleCancel = () => {
    setEditData(studentData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="student-avatar">
            <div className="avatar-circle">
              {studentData.name ? studentData.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <h3>{studentData.name || 'Student'}</h3>
            <p className="student-email">{studentData.email || 'user@whizz.com'}</p>
          </div>

          <nav className="sidebar-menu">
            <ul>
              <li className="menu-item active">
                <span>📋 My Profile</span>
              </li>
              <li className="menu-item">
                <span>📚 My Courses ({enrolledCourses.length})</span>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          {/* Profile Section */}
          <section className="profile-section">
            <div className="section-header">
              <h2>My Profile</h2>
              {!isEditing ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="button-group">
                  <button 
                    className="btn btn-success"
                    onClick={handleSaveProfile}
                  >
                    ✓ Save
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              // Edit Form
              <form className="profile-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={editData.name || ''}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={editData.email || ''}
                        disabled
                        className="disabled"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={editData.phone || ''}
                        onChange={handleEditChange}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={editData.dateOfBirth || ''}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Address Information</h3>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={editData.address || ''}
                        onChange={handleEditChange}
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={editData.city || ''}
                        onChange={handleEditChange}
                        placeholder="City"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={editData.state || ''}
                        onChange={handleEditChange}
                        placeholder="State"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pincode">Pincode</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={editData.pincode || ''}
                        onChange={handleEditChange}
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Education Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="qualification">Current Qualification</label>
                      <input
                        type="text"
                        id="qualification"
                        name="qualification"
                        value={editData.qualification || ''}
                        onChange={handleEditChange}
                        placeholder="e.g., 10th, 12th, BA, BCA"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="schoolCollege">School/College Name</label>
                      <input
                        type="text"
                        id="schoolCollege"
                        name="schoolCollege"
                        value={editData.schoolCollege || ''}
                        onChange={handleEditChange}
                        placeholder="Name of school/college"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Parent/Guardian Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="parentName">Parent/Guardian Name</label>
                      <input
                        type="text"
                        id="parentName"
                        name="parentName"
                        value={editData.parentName || ''}
                        onChange={handleEditChange}
                        placeholder="Parent/Guardian name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="parentPhone">Parent/Guardian Phone</label>
                      <input
                        type="tel"
                        id="parentPhone"
                        name="parentPhone"
                        value={editData.parentPhone || ''}
                        onChange={handleEditChange}
                        placeholder="Parent contact number"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergencyContact">Emergency Contact</label>
                      <input
                        type="tel"
                        id="emergencyContact"
                        name="emergencyContact"
                        value={editData.emergencyContact || ''}
                        onChange={handleEditChange}
                        placeholder="Emergency contact number"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Interests</h3>
                  <div className="form-group full-width">
                    <label htmlFor="interests">Fields of Interest</label>
                    <textarea
                      id="interests"
                      name="interests"
                      value={editData.interests || ''}
                      onChange={handleEditChange}
                      placeholder="Tell us about your learning interests..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </form>
            ) : (
              // View Profile
              <div className="profile-view">
                <div className="info-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{studentData.name || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{studentData.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <p>{studentData.phone || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>Date of Birth</label>
                      <p>{studentData.dateOfBirth || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Address Information</h3>
                  <div className="info-grid">
                    <div className="info-item full-width">
                      <label>Address</label>
                      <p>{studentData.address || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      <p>{studentData.city || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>State</label>
                      <p>{studentData.state || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>Pincode</label>
                      <p>{studentData.pincode || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Education Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Current Qualification</label>
                      <p>{studentData.qualification || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>School/College</label>
                      <p>{studentData.schoolCollege || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Parent/Guardian Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Parent/Guardian Name</label>
                      <p>{studentData.parentName || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>Parent/Guardian Phone</label>
                      <p>{studentData.parentPhone || '—'}</p>
                    </div>
                    <div className="info-item">
                      <label>Emergency Contact</label>
                      <p>{studentData.emergencyContact || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Learning Interests</h3>
                  <div className="info-grid full-width">
                    <p>{studentData.interests || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Enrolled Courses Section */}
          <section className="courses-section">
            <h2>My Enrolled Courses</h2>
            {enrolledCourses.length === 0 ? (
              <div className="empty-state">
                <p>You haven't enrolled in any courses yet.</p>
                <a href="/courses" className="btn btn-primary">Browse Courses</a>
              </div>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map((course) => (
                  <div key={course.courseId} className="course-card">
                    <div className="course-image">
                      {course.image ? (
                        <img src={course.image} alt={course.title} />
                      ) : (
                        <div className="image-placeholder">📚</div>
                      )}
                    </div>
                    <div className="course-content">
                      <h4>{course.title}</h4>
                      <p className="course-category">{course.category}</p>
                      <p className="course-description">{course.description}</p>
                      <div className="course-meta">
                        <span className="instructor">👨‍🏫 {course.instructor}</span>
                        <span className={`status ${course.enrollmentStatus}`}>
                          {course.enrollmentStatus}
                        </span>
                      </div>
                      <a 
                        href={`/course/${course.courseId}`}
                        className="btn btn-outline"
                      >
                        View Course
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
 