import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { seedSampleCourses } from '../firebase/seedData';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  if (userRole !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSeedCourses = async () => {
    setLoading(true);
    setMessage('');

    try {
      const result = await seedSampleCourses(user.uid);
      setMessageType(result.success ? 'success' : 'error');
      setMessage(result.message);
    } catch (error) {
      setMessageType('error');
      setMessage('Error seeding courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-header">
        <h1>🛠️ Admin Utilities</h1>
        <p>Manage and setup your course platform</p>
      </div>

      <div className="admin-panel-content">
        <section className="admin-section">
          <h2>Quick Setup</h2>
          <p>Add sample courses to get started quickly</p>

          <div className="setup-card">
            <div className="setup-icon">📚</div>
            <div className="setup-details">
              <h3>Add Sample Courses</h3>
              <p>Populate your platform with 12+ basic courses including:</p>
              <ul>
                <li>Microsoft Office (Word, Excel, PowerPoint)</li>
                <li>Google Sheets & Analytics</li>
                <li>Adobe Photoshop</li>
                <li>Canva for Social Media</li>
                <li>And many more...</li>
              </ul>
            </div>
            <button
              className="setup-btn"
              onClick={handleSeedCourses}
              disabled={loading}
            >
              {loading ? 'Adding Courses...' : '+ Add Sample Courses'}
            </button>
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {messageType === 'success' ? '✅' : '❌'} {message}
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">Coming soon</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Courses</div>
              <div className="stat-value">Coming soon</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Active Students</div>
              <div className="stat-value">Coming soon</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Revenue</div>
              <div className="stat-value">Coming soon</div>
            </div>
          </div>
        </section>

        <section className="admin-section">
          <h2>Quick Links</h2>
          <div className="links-grid">
            <a href="/admin-dashboard" className="link-card">
              <div>📊 Admin Dashboard</div>
              <p>View all courses and users</p>
            </a>
            <a href="/instructor-dashboard" className="link-card">
              <div>🎓 Instructor Dashboard</div>
              <p>Create and manage courses</p>
            </a>
            <a href="/courses" className="link-card">
              <div>📚 View All Courses</div>
              <p>Browse course catalog</p>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
