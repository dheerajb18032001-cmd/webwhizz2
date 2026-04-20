import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || userRole !== 'admin') { navigate('/'); return; }
    fetchAdminData();
  }, [user, userRole, navigate]);

  const fetchAdminData = async () => {
    try {
      const usersList = (await getDocs(collection(db, 'users'))).docs.map(d => ({ id: d.id, ...d.data() }));
      const coursesList = (await getDocs(collection(db, 'courses'))).docs.map(d => ({ id: d.id, ...d.data() }));
      const enrollmentsList = (await getDocs(collection(db, 'enrollments'))).docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(usersList);
      setCourses(coursesList);
      setEnrollments(enrollmentsList);
      setStats({
        totalUsers: usersList.length,
        totalCourses: coursesList.length,
        totalEnrollments: enrollmentsList.length,
        totalStudents: usersList.filter(u => u.role === 'student').length
      });
    } catch (e) { console.error('Error:', e); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async u => {
    if (window.confirm('Delete user?')) {
      try {
        await deleteDoc(doc(db, 'users', u));
        setUsers(p => p.filter(x => x.id !== u));
        alert('User deleted');
      } catch (e) { console.error(e); alert('Failed'); }
    }
  };

  const handleDeleteCourse = async c => {
    if (window.confirm('Delete course?')) {
      try {
        await deleteDoc(doc(db, 'courses', c));
        setCourses(p => p.filter(x => x.id !== c));
        alert('Course deleted');
      } catch (e) { console.error(e); alert('Failed'); }
    }
  };

  const filtered = users.filter(u => !searchTerm || u.name?.toLowerCase().includes(searchTerm) || u.email?.toLowerCase().includes(searchTerm));

  if (loading) return <div className="admin-dashboard"><p>Loading...</p></div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Platform Management</p>
      </div>

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
        <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>📚 Courses</button>
        <button className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`} onClick={() => setActiveTab('enrollments')}>📝 Enrollments</button>
      </div>

      {activeTab === 'dashboard' && <div className="dashboard-content"><div className="stats-grid">
        <div className="stat-box"><div className="stat-icon">👥</div><div className="stat-label">Total Users</div><div className="stat-value">{stats.totalUsers}</div></div>
        <div className="stat-box"><div className="stat-icon">🎓</div><div className="stat-label">Active Students</div><div className="stat-value">{stats.totalStudents}</div></div>
        <div className="stat-box"><div className="stat-icon">📚</div><div className="stat-label">Total Courses</div><div className="stat-value">{stats.totalCourses}</div></div>
        <div className="stat-box"><div className="stat-icon">📝</div><div className="stat-label">Total Enrollments</div><div className="stat-value">{stats.totalEnrollments}</div></div>
      </div></div>}

      {activeTab === 'users' && <div className="users-content">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value.toLowerCase())} className="search-input" />
        <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Role</th><th>Action</th></tr></thead><tbody>
          {filtered.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.address}</td><td>{u.role}</td><td><button className="delete-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button></td></tr>)}
        </tbody></table>
      </div>}

      {activeTab === 'courses' && <div className="courses-content"><div className="courses-grid">
        {courses.map(c => <div key={c.id} className="course-admin-card"><h3>{c.title}</h3><p>{c.description?.substring(0, 100)}</p><span>₹{c.price}</span><button className="delete-btn" onClick={() => handleDeleteCourse(c.id)}>Delete</button></div>)}
      </div></div>}

      {activeTab === 'enrollments' && <div className="enrollments-content"><table><thead><tr><th>Student</th><th>Course</th><th>Date</th><th>Progress</th></tr></thead><tbody>
        {enrollments.map(e => <tr key={e.id}><td>{users.find(u => u.id === e.studentId)?.email}</td><td>{courses.find(c => c.id === e.courseId)?.title}</td><td>{new Date(e.enrollmentDate?.toDate?.() || e.enrollmentDate).toLocaleDateString()}</td><td>{e.progress || 0}%</td></tr>)}
      </tbody></table></div>}
    </div>
  );
};

export default AdminDashboard;
