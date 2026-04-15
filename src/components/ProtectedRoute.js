import React from 'react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requiredRole, userRole, user, loading }) => {
  if (loading) {
    return (
      <div className="protected-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="protected-error">
        <h2>Access Denied</h2>
        <p>You must be logged in to access this page.</p>
        <a href="/login">Go to Login</a>
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return (
      <div className="protected-error">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <a href="/">Go Home</a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
