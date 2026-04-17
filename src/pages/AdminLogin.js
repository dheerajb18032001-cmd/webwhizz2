import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import './Auth.css';

// List of approved admin emails
const APPROVED_ADMINS = [
  'admin@whizz.com',
  'admin1@whizz.com',
  'admin2@whizz.com',
];

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is in approved admins list
      if (!APPROVED_ADMINS.includes(email.toLowerCase())) {
        setError('❌ Unauthorized! Only approved admins can access this panel.');
        setLoading(false);
        return;
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user role is admin in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role !== 'admin') {
          setError('❌ This account is not an admin account!');
          // Sign out the user
          await auth.signOut();
          setLoading(false);
          return;
        }
      }

      // Admin login successful
      navigate('/admin-panel');
    } catch (err) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('❌ User not found');
      } else if (err.code === 'auth/wrong-password') {
        setError('❌ Invalid password');
      } else if (err.code === 'auth/invalid-email') {
        setError('❌ Invalid email format');
      } else {
        setError('❌ Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container admin-login-container">
        <h2>🛡️ Admin Access Portal</h2>
        <p className="admin-subtitle">Restricted Access - Authorized Admins Only</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAdminLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '🔐 Verifying...' : '🔓 Admin Login'}
          </button>
        </form>

        <div className="admin-info">
          <h3>Approved Admins Only:</h3>
          <ul className="admin-list">
            {APPROVED_ADMINS.map((adminEmail, index) => (
              <li key={index}>✓ {adminEmail}</li>
            ))}
          </ul>
        </div>

        <p className="back-link">
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
