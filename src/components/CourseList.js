import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { ensureCoursesSeeded } from '../firebase/autoSeed';
import sampleCourses from '../data/sampleCourses';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState(sampleCourses);
  const [filteredCourses, setFilteredCourses] = useState(sampleCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'all',
    'Web Development',
    'Data Science & Analytics',
    'Application Development',
    'Cyber Security',
    'AI/ML',
    'Business Management',
    'Other',
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // First, ensure courses are seeded to Firebase
      await ensureCoursesSeeded();
      
      // Try to fetch from backend API
      try {
        const result = await coursesAPI.getAllCourses(null, null, 100, 0);
        if (result.success && result.data.length > 0) {
          setCourses(result.data);
          setFilteredCourses(result.data);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Backend API not available, using sample data:', apiErr.message);
      }
      
      // Fallback to sample courses if database is empty
      const coursesList = sampleCourses.map((course, index) => ({
        ...course,
        id: index.toString(),
      }));
      
      setCourses(coursesList);
      setFilteredCourses(coursesList);
    } catch (err) {
      console.error('Error loading courses:', err);
      // Use sample courses as final fallback
      const coursesList = sampleCourses.map((course, index) => ({
        ...course,
        id: index.toString(),
      }));
      setCourses(coursesList);
      setFilteredCourses(coursesList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = courses;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, courses]);

  return (
    <div className="course-list-container">
      <div className="course-header">
        <h1>Explore Our Courses</h1>
        <p>Learn from industry experts and advance your skills</p>
      </div>

      <div className="course-controls">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="no-courses">No courses found. Try different filters.</div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((course, index) => (
            <div 
              key={course.id || `course-${index}-${course.title}`}
              className="course-card"
              onClick={() => navigate(`/course/${course.id || index}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="course-image">
                <img
                  src={course.image || 'https://via.placeholder.com/300x200?text=' + course.title}
                  alt={course.title}
                />
                <span className="course-category">{course.category}</span>
                <span className="course-badge">★ 4.8</span>
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-details-row">
                  <div className="detail-item">
                    <span className="detail-icon">👨‍🏫</span>
                    <span className="detail-text">{course.instructor}</span>
                  </div>
                </div>
                
                <div className="course-info-grid">
                  <div className="info-badge">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{course.duration}h</span>
                  </div>
                  <div className="info-badge">
                    <span className="info-label">Students</span>
                    <span className="info-value">{course.students?.length || 0}+</span>
                  </div>
                  <div className="info-badge">
                    <span className="info-label">Level</span>
                    <span className="info-value">All</span>
                  </div>
                </div>
                
                <div className="course-footer">
                  <div className="price-section">
                    <span className="price">₹{course.price || 'Free'}</span>
                    <span className="price-label">per course</span>
                  </div>
                  <button 
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.id}`);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
