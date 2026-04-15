import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureCoursesSeeded } from '../firebase/autoSeed';
import sampleCourses from '../data/sampleCourses';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Auto-seed courses on home page load
  useEffect(() => {
    ensureCoursesSeeded().catch(err => console.warn('Auto-seed skipped:', err));
  }, []);

  const categories = [
    { 
      name: 'Web Development', 
      icon: '🌐',
      color: '#667eea',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop'
    },
    { 
      name: 'Data Science & Analytics', 
      icon: '📊',
      color: '#764ba2',
      image: 'https://miro.medium.com/v2/resize:fit:1358/1*hDilZZSL-GIQFDFyf_Nb9g.png'
    },
    { 
      name: 'AI/ML', 
      icon: '🤖',
      color: '#f093fb',
      image: 'https://tse2.mm.bing.net/th/id/OIP.xYktp7hnECrRP_lmBn_95QHaE8?w=900&h=600&rs=1&pid=ImgDetMain&o=7&rm=3'
    },
    { 
      name: 'Cyber Security', 
      icon: '🔒',
      color: '#4facfe',
      image: 'https://www.theforage.com/blog/wp-content/uploads/2022/12/what-is-cybersecurity.jpg'
    },
    { 
      name: 'Application Development', 
      icon: '📱',
      color: '#43e97b',
      image: 'https://www.rishabhsoft.com/wp-content/uploads/2018/07/Android-App-Development-Process-1.jpg'
    },
    { 
      name: 'Business Management', 
      icon: '💼',
      color: '#fa709a',
      image: 'https://thumbs.dreamstime.com/z/business-management-concept-chart-blackboard-88008693.jpg'
    },
  ];

  const getCategoryCount = (categoryName) => {
    return sampleCourses.filter(course => course.category === categoryName).length;
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handleExploreCategory = (categoryName) => {
    navigate(`/courses?category=${categoryName}`);
  };

  const closeCategoryDetail = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Whizz</h1>
          <p>Master In-Demand Skills with Expert-Led Online Courses</p>
          <a href="/courses" className="cta-btn">Explore Courses</a>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-image" style={{ backgroundImage: "url('https://miro.medium.com/v2/resize:fit:1024/1*6r4WKubgQJgI06Gm78VBaA.jpeg')" }}></div>
          <h3>Diverse Courses</h3>
          <p>Web Development, Data Science, AI/ML, Cybersecurity, and more</p>
        </div>
        <div className="feature-card">
          <div className="feature-image" style={{ backgroundImage: "url(' https://www.shutterstock.com/image-photo/double-exposure-work-table-computer-260nw-1589033032.jpg')" }}></div>
          <h3>Expert Instructors</h3>
          <p>Learn from industry professionals with years of experience</p>
        </div>
        <div className="feature-card">
          <div className="feature-image" style={{ backgroundImage: "url(' https://t3.ftcdn.net/jpg/06/15/74/08/360_F_615740862_oQ1kuwx7DMwKSWI2OPrH6Y6lrPN6XlFy.jpg')" }}></div>
          <h3>Certifications</h3>
          <p>Earn recognized certificates upon course completion</p>
        </div>
        <div className="feature-card">
          <div className="feature-image" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop')" }}></div>
          <h3>Learn at Your Pace</h3>
          <p>Access course materials anytime, anywhere</p>
        </div>
      </section>

      <section className="categories">
        <h2>Popular Course Categories</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <div 
              key={cat.name}
              className="category-card"
              onClick={() => handleCategoryClick(cat.name)}
              style={{ borderColor: cat.color }}
            >
              <div 
                className="category-image" 
                style={{ backgroundImage: `url(${cat.image})` }}
              >
                <div className="category-overlay"></div>
              </div>
              <div className="category-content">
                <h3>{cat.name}</h3>
                <p>{getCategoryCount(cat.name)} Courses</p>
                <button className="explore-btn">Explore →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="category-modal-overlay" onClick={closeCategoryDetail}>
          <div className="category-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeCategoryDetail}>×</button>
            
            <h2>{selectedCategory}</h2>
            <p className="modal-subtitle">{getCategoryCount(selectedCategory)} Courses Available</p>

            <div className="category-courses-list">
              {sampleCourses
                .filter(course => course.category === selectedCategory)
                .slice(0, 4)
                .map((course) => (
                  <div key={course.title} className="modal-course-item">
                    <img 
                      src={course.image || 'https://via.placeholder.com/80x80'} 
                      alt={course.title}
                      className="modal-course-image"
                    />
                    <div className="modal-course-info">
                      <h4>{course.title}</h4>
                      <p className="modal-course-desc">{course.description.substring(0, 60)}...</p>
                      <div className="modal-course-meta">
                        <span>⏱️ {course.duration}h</span>
                        <span>₹{course.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="modal-footer">
              <button 
                className="view-all-btn"
                onClick={() => handleExploreCategory(selectedCategory)}
              >
                View All {getCategoryCount(selectedCategory)} Courses
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="cta-section">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of students already learning on Whizz</p>
        <a href="/signup" className="cta-btn large">Sign Up Now</a>
      </section>
    </div>
  );
};

export default Home;
