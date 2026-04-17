import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { enrollStudentInCourse, isStudentEnrolled } from '../firebase/enrollmentService';
import sampleCourses from '../data/sampleCourses';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loadingUserData, setLoadingUserData] = useState(true);

  useEffect(() => {
    fetchCourseDetail();
    checkEnrollmentStatus();
    trackCourseExplore();
    loadStudentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

  const loadStudentDetails = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setStudentDetails({
            name: data.name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        } else {
          setStudentDetails({
            name: user.displayName || '',
            email: user.email || '',
            phone: '',
            address: '',
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    }
    setLoadingUserData(false);
  };

  const trackCourseExplore = async () => {
    if (user && courseId) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const explored = userDoc.data().exploreredCourses || [];
          if (!explored.includes(courseId)) {
            await updateDoc(userRef, {
              exploreredCourses: [...explored, courseId]
            });
          }
        }
      } catch (err) {
        console.error('Error tracking course explore:', err);
      }
    }
  };

  const checkEnrollmentStatus = async () => {
    if (user && courseId) {
      const enrolled = await isStudentEnrolled(user, courseId);
      setIsEnrolled(enrolled);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!studentDetails.name.trim()) errors.name = 'Name is required';
    if (!studentDetails.email.trim()) errors.email = 'Email is required';
    if (!studentDetails.phone.trim()) errors.phone = 'Phone number is required';
    if (!studentDetails.address.trim()) errors.address = 'Address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails({
      ...studentDetails,
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSaveDetails = async () => {
    if (!validateForm()) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: studentDetails.name,
        email: studentDetails.email,
        phone: studentDetails.phone,
        address: studentDetails.address,
      });
      setShowForm(false);
      setEnrollMessage('');
      handleEnrollment();
    } catch (err) {
      console.error('Error saving details:', err);
      setEnrollMessage('❌ Failed to save details. Please try again.');
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if form needs to be shown
    if (!studentDetails.name || !studentDetails.phone || !studentDetails.address) {
      setShowForm(true);
      return;
    }

    setEnrolling(true);
    setEnrollMessage('');
    
    try {
      const result = await enrollStudentInCourse(
        user,
        courseId,
        course.title
      );
      
      if (result.success) {
        setIsEnrolled(true);
        setEnrollMessage('✅ Successfully enrolled! Check your dashboard.');
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 2000);
      } else {
        setEnrollMessage('❌ Enrollment failed. Please try again.');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrollMessage('❌ Error during enrollment. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const fetchCourseDetail = async () => {
    try {
      if (courseId) {
        // First, try to load from sample courses by index
        const index = parseInt(courseId);
        if (!isNaN(index) && sampleCourses[index]) {
          setCourse({ ...sampleCourses[index], id: courseId });
          setLoading(false);
          return;
        }

        // Otherwise, try Firebase
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() });
        } else {
          setError('Course not found');
        }
      }
    } catch (err) {
      setError('Error loading course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingUserData) {
    return <div className="course-detail-loading">Loading course details...</div>;
  }

  if (error) {
    return <div className="course-detail-error">{error}</div>;
  }

  if (!course) {
    return <div className="course-detail-error">Course not found</div>;
  }

  return (
    <div className="course-detail-container">
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Complete Your Profile</h2>
            <p>Please fill in your details to enroll in this course</p>
            
            <form className="student-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={studentDetails.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={studentDetails.email}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={studentDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={formErrors.phone ? 'input-error' : ''}
                />
                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={studentDetails.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className={formErrors.address ? 'input-error' : ''}
                  rows="3"
                />
                {formErrors.address && <span className="error-text">{formErrors.address}</span>}
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="btn btn-save"
                  onClick={handleSaveDetails}
                >
                  Save & Enroll
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="back-link">
        <button onClick={() => navigate('/courses')} className="back-btn">
          ← Back to Courses
        </button>
      </div>

      <div className="course-hero">
        <img 
          src={course.image || 'https://via.placeholder.com/1200x400?text=' + encodeURIComponent(course.title)} 
          alt={course.title}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f0f0f0" width="1200" height="400"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3E' + encodeURIComponent(course.title) + '%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="course-hero-overlay">
          <h1>{course.title}</h1>
          <p>{course.category}</p>
        </div>
      </div>

      <div className="course-detail-content">
        <div className="course-main">
          <section className="course-section">
            <h2>About This Course</h2>
            <p>{course.description}</p>
          </section>

          <section className="course-section">
            <h2>What You'll Learn</h2>
            <ul className="learning-points">
              <li>Master the fundamentals of {course.category}</li>
              <li>Build real-world projects and portfolios</li>
              <li>Learn best practices from industry experts</li>
              <li>Get hands-on experience with practical assignments</li>
              <li>Join a community of learners and professionals</li>
              <li>Earn a recognized certificate upon completion</li>
            </ul>
          </section>

          <section className="course-section">
            <h2>Course Syllabus</h2>
            <div className="syllabus-list">
              <div className="syllabus-item">
                <div className="syllabus-number">1</div>
                <div className="syllabus-content">
                  <h4>Introduction and Course Overview</h4>
                  <p>Get started with an introduction to {course.category} and what you'll learn in this course.</p>
                </div>
              </div>
              <div className="syllabus-item">
                <div className="syllabus-number">2</div>
                <div className="syllabus-content">
                  <h4>Fundamentals and Core Concepts</h4>
                  <p>Master the essential concepts and foundations of {course.category}.</p>
                </div>
              </div>
              <div className="syllabus-item">
                <div className="syllabus-number">3</div>
                <div className="syllabus-content">
                  <h4>Practical Applications</h4>
                  <p>Apply your knowledge through hands-on projects and real-world scenarios.</p>
                </div>
              </div>
              <div className="syllabus-item">
                <div className="syllabus-number">4</div>
                <div className="syllabus-content">
                  <h4>Advanced Techniques</h4>
                  <p>Learn advanced strategies and professional best practices in the field.</p>
                </div>
              </div>
              <div className="syllabus-item">
                <div className="syllabus-number">5</div>
                <div className="syllabus-content">
                  <h4>Capstone Project</h4>
                  <p>Build a comprehensive project to showcase your skills and knowledge.</p>
                </div>
              </div>
              <div className="syllabus-item">
                <div className="syllabus-number">6</div>
                <div className="syllabus-content">
                  <h4>Final Assessment & Certificate</h4>
                  <p>Complete the final assessment and earn your certificate of completion.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="course-section">
            <h2>Course Includes</h2>
            <ul className="course-includes-list">
              <li>✅ Detailed descriptions and comprehensive content</li>
              <li>✅ Duration: {course.duration} hours of video content</li>
              <li>✅ Price: ₹{course.price} (one-time payment)</li>
              <li>✅ Category: {course.category}</li>
              <li>✅ Instructor: {course.instructor}</li>
              <li>✅ Published & Ready to learn (Status: {course.status || 'Published'})</li>
              <li>✅ Lifetime access to course materials</li>
              <li>✅ Downloadable resources and notes</li>
              <li>✅ Certificate of completion</li>
              <li>✅ 7-day money-back guarantee</li>
            </ul>
          </section>

          <section className="course-section">
            <h2>Requirements</h2>
            <ul className="requirements-list">
              <li>Basic computer literacy required</li>
              <li>Internet connection for streaming videos</li>
              <li>Text editor or IDE (usually free)</li>
              <li>2-3 hours per week for course completion</li>
            </ul>
          </section>

          <section className="course-section">
            <h2>Instructor</h2>
            <div className="instructor-card">
              <div className="instructor-avatar"></div>
              <div className="instructor-info">
                <h3>{course.instructor}</h3>
                <p>Experienced industry professional</p>
                <p>20+ years of expertise in the field</p>
                <p>Passionate about teaching and mentoring</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="course-sidebar">
          <div className="course-card-detail">
            <img src={course.image || 'https://via.placeholder.com/300x200'} alt={course.title} />
            
            <div className="course-fee-label">Course Fee</div>
            <div className="price-section">
              <span className="price">₹{course.price || 'Free'}</span>
              <button 
                className={`enroll-btn-large ${isEnrolled ? 'enrolled' : ''}`}
                onClick={handleEnrollment}
                disabled={enrolling || isEnrolled}
              >
                {isEnrolled ? '✓ Already Enrolled' : enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
              {enrollMessage && <p className="enroll-message">{enrollMessage}</p>}
              <p className="cert-notice">📜 Includes certificate on completion</p>
            </div>

            <div className="course-details-meta">
              <div className="meta-item">
                <span className="meta-label">Duration:</span>
                <span className="meta-value">{course.duration} hours</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Level:</span>
                <span className="meta-value">Beginner to Intermediate</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Students:</span>
                <span className="meta-value">{course.students?.length || 0}+ Enrolled</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Language:</span>
                <span className="meta-value">English</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Certificate:</span>
                <span className="meta-value">✓ Yes</span>
              </div>
            </div>

            <div className="course-highlights">
              <h3>Why Choose This Course?</h3>
              <ul>
                <li>100% Practical Training</li>
                <li>Expert Instructors</li>
                <li>Certificate Included</li>
                <li>Placement Support</li>
                <li>Flexible Learning</li>
                <li>Lifetime Access</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseDetail;
