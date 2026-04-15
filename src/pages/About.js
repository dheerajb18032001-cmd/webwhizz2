import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Whizz</h1>
        <p>Empowering learners worldwide with industry-leading online courses</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            At Whizz, we believe that quality education should be accessible to everyone, everywhere. 
            Our mission is to revolutionize learning by providing world-class courses from expert instructors 
            in technology, business, data science, and more.
          </p>
        </div>

        <div className="about-section">
          <h2>Why Choose Whizz?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎓</div>
              <h3>Expert Instructors</h3>
              <p>Learn from industry professionals with years of real-world experience</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⏱️</div>
              <h3>Learn at Your Pace</h3>
              <p>Access course materials anytime, anywhere at your own convenience</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📜</div>
              <h3>Gain Certifications</h3>
              <p>Earn recognized certificates to boost your career prospects</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🌍</div>
              <h3>Global Community</h3>
              <p>Join thousands of learners from around the world</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💡</div>
              <h3>Practical Skills</h3>
              <p>Master in-demand skills with hands-on projects and exercises</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <h3>Career Growth</h3>
              <p>Advance your career with skills that matter in today's market</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Journey</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker">2020</div>
              <div className="timeline-content">
                <h3>Founded</h3>
                <p>Whizz was founded with a vision to make quality education accessible</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">2021</div>
              <div className="timeline-content">
                <h3>1000+ Students</h3>
                <p>Reached 1000+ students from 25+ countries</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">2022</div>
              <div className="timeline-content">
                <h3>50+ Courses</h3>
                <p>Expanded catalog to 50+ courses across multiple domains</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">2023</div>
              <div className="timeline-content">
                <h3>Certified Success</h3>
                <p>10,000+ certificates issued to graduates worldwide</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>Our Team</h2>
          <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#666' }}>
            Built by passionate educators and engineers dedicated to transforming online learning
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍💼</div>
              <h3>Rajesh Kumar</h3>
              <p>Founder & CEO</p>
              <small>20+ years in EdTech</small>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <h3>Priya Singh</h3>
              <p>Head of Curriculum</p>
              <small>Expert in Course Design</small>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍🔧</div>
              <h3>Amar Patel</h3>
              <p>CTO</p>
              <small>Full Stack Developer</small>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍🏫</div>
              <h3>Neha Sharma</h3>
              <p>Lead Instructor</p>
              <small>Data Science Expert</small>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>By The Numbers</h2>
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-number">10,000+</div>
              <p>Active Students</p>
            </div>
            <div className="stat">
              <div className="stat-number">50+</div>
              <p>Expert Courses</p>
            </div>
            <div className="stat">
              <div className="stat-number">25+</div>
              <p>Countries Reached</p>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of successful learners who have transformed their careers with Whizz</p>
        <a href="/courses" className="cta-btn">Explore Courses</a>
      </section>
    </div>
  );
};

export default About;
