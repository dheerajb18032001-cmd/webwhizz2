import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, userRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
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
          
          {user && (
            <li className="dropdown" onMouseEnter={toggleDropdown} onMouseLeave={() => setDropdownOpen(false)}>
              <button className="dashboard-link" onClick={(e) => { e.preventDefault(); toggleDropdown(); }}>📊 Dashboard</button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  {userRole === 'student' && (
                    <>
                      <a href="/student-dashboard" className="dropdown-item">📚 My Learning</a>
                    </>
                  )}
                  {userRole === 'instructor' && (
                    <>
                      <a href="/instructor-dashboard" className="dropdown-item">🎓 My Courses</a>
                    </>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <a href="/admin-dashboard" className="dropdown-item">🛡️ Admin Dashboard</a>
                      <a href="/admin-panel" className="dropdown-item">🛠️ Admin Utilities</a>
                    </>
                  )}
                </div>
              )}
            </li>
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
