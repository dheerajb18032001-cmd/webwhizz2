import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🎓 Whizz</h1>
          <p>Online Course Platform</p>
        </div>

        <ul className="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/courses">Courses</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
          {user && userRole === 'student' && (
            <li><a href="/student-dashboard">My Learning</a></li>
          )}
          {user && userRole === 'instructor' && (
            <li><a href="/instructor-dashboard">My Courses</a></li>
          )}
          {user && userRole === 'admin' && (
            <>
              <li><a href="/admin-panel">Admin Utilities</a></li>
              <li><a href="/admin-dashboard">Admin Dashboard</a></li>
            </>
          )}
          {user && <li><a href="/profile">Profile</a></li>}
        </ul>

        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <span className="user-role">{userRole}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="login-link">Login</a>
              <a href="/signup" className="signup-link">Sign Up</a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
