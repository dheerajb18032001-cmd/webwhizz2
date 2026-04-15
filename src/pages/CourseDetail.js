import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    fetchCourseDetail();
    checkEnrollmentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

  const checkEnrollmentStatus = async () => {
    if (user && courseId) {
      const enrolled = await isStudentEnrolled(user.uid, courseId);
      setIsEnrolled(enrolled);
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setEnrollMessage('');
    
    try {
      const result = await enrollStudentInCourse(
        user.uid,
        user.email,
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

  if (loading) {
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
      <div className="back-link">
        <button onClick={() => navigate('/courses')} className="back-btn">
          ← Back to Courses
        </button>
      </div>
      <div className="course-hero">
        <img src={course.image || 'https://via.placeholder.com/1200x400'} alt={course.title} />
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
