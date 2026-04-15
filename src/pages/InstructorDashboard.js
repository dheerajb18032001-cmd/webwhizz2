import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    duration: '',
    price: '',
    image: '',
  });

  useEffect(() => {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchInstructorCourses();
  }, [user, userRole, navigate]);

  const fetchInstructorCourses = async () => {
    try {
      if (user) {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('instructorId', '==', user.uid));
        const snapshot = await getDocs(q);

        const coursesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourses(coursesList);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const coursesRef = collection(db, 'courses');
      const newCourse = {
        ...formData,
        instructorId: user.uid,
        instructor: user.email,
        createdAt: Timestamp.now(),
        students: [],
        status: 'draft',
      };

      const docRef = await addDoc(coursesRef, newCourse);
      setCourses((prev) => [...prev, { id: docRef.id, ...newCourse }]);
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        duration: '',
        price: '',
        image: '',
      });
      setShowCreateForm(false);
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <h1>🎓 Instructor Dashboard</h1>
        <p>Manage your courses and students</p>
      </div>

      <div className="dashboard-actions">
        <button
          className="create-course-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '+ Create New Course'}
        </button>
      </div>

      {showCreateForm && (
        <form className="create-course-form" onSubmit={handleCreateCourse}>
          <h2>Create New Course</h2>

          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Course description"
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange}>
                <option>Web Development</option>
                <option>Data Science & Analytics</option>
                <option>Application Development</option>
                <option>Cyber Security</option>
                <option>AI/ML</option>
                <option>Business Management</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Course Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button type="submit" className="submit-btn">
            Create Course
          </button>
        </form>
      )}

      <div className="courses-section">
        <h2>Your Courses ({courses.length})</h2>

        {loading ? (
          <div className="loading">Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any courses yet.</p>
            <button onClick={() => setShowCreateForm(true)} className="create-btn-link">
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="courses-table">
            <table>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <strong>{course.title}</strong>
                    </td>
                    <td>{course.category}</td>
                    <td>
                      <span className={`status-badge ${course.status}`}>{course.status}</span>
                    </td>
                    <td>{course.students?.length || 0}</td>
                    <td>{course.duration} hrs</td>
                    <td>
                      <button className="action-btn edit">Edit</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
