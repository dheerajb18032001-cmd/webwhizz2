import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import './Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvedAdmins, setApprovedAdmins] = useState([]);
  const [fetchingAdmins, setFetchingAdmins] = useState(true);
  const navigate = useNavigate();

  // Fetch approved admins from Firestore abc123 collection
  useEffect(() => {
    const fetchApprovedAdmins = async () => {
      try {
        setFetchingAdmins(true);
        // Add small delay to ensure auth is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const abc123Collection = collection(db, 'abc123');
        const querySnapshot = await getDocs(abc123Collection);
        const adminEmails = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            adminEmails.push(data.email.toLowerCase());
          }
        });
        
        if (adminEmails.length > 0) {
          setApprovedAdmins(adminEmails);
          console.log('✅ Approved admins loaded from Firestore:', adminEmails);
        } else {
          console.warn('❌ No admins found in abc123 collection');
          throw new Error('No admins found');
        }
      } catch (err) {
        console.error('Error fetching approved admins:', err);
        // Fallback to default admins if fetch fails
        const defaultAdmins = [
          'admin@whizz.com',
          'admin1@whizz.com',
          'admin2@whizz.com',
        ];
        setApprovedAdmins(defaultAdmins);
        console.log('⚠️ Using default admin list:', defaultAdmins);
      } finally {
        setFetchingAdmins(false);
      }
    };

    fetchApprovedAdmins();
  }, []);

  const verifyAdminAccess = async (user) => {
    try {
      // Verify user role is admin in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role !== 'admin') {
          setError('❌ This account is not an admin account!');
          await auth.signOut();
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('Error verifying admin access:', err);
      setError('❌ Could not verify admin status');
      return false;
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is in approved admins list from Firestore
      if (!approvedAdmins.includes(email.toLowerCase())) {
        setError('❌ Unauthorized! Only approved admins can access this panel.');
        setLoading(false);
        return;
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify admin access
      const isAdmin = await verifyAdminAccess(user);
      if (isAdmin) {
        navigate('/admin-panel');
      }
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, provider);
      } catch (popupErr) {
        // Handle popup-specific errors
        if (popupErr.code === 'auth/popup-closed-by-user') {
          console.log('User closed popup');
          setLoading(false);
          return;
        }
        if (popupErr.code === 'auth/popup-blocked') {
          setError('❌ Popup blocked! Please allow popups for this site.');
          setLoading(false);
          return;
        }
        throw popupErr;
      }

      const user = userCredential.user;
      
      if (!user.email) {
        setError('❌ Could not get email from Google account');
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Check if email is in approved admins list
      if (approvedAdmins.length === 0) {
        setError('❌ Admin list not loaded. Please refresh and try again.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (!approvedAdmins.includes(user.email.toLowerCase())) {
        setError(`❌ Email ${user.email} is not authorized as admin.`);
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Verify admin access
      const isAdmin = await verifyAdminAccess(user);
      if (isAdmin) {
        navigate('/admin-panel');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup - no error message needed
        return;
      }
      setError('❌ Google login failed: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAdmins) {
    return (
      <div className="auth-container">
        <div className="auth-form-container admin-login-container">
          <h2>🛡️ Admin Access Portal</h2>
          <p className="loading-text">Loading admin list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container admin-login-container">
        <h2>🛡️ Admin Access Portal</h2>
        <p className="admin-subtitle">Restricted Access - Authorized Admins Only</p>

        {error && <div className="error-message">{error}</div>}

        {/* Google Sign-In Option */}
        <div className="google-login-section">
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="google-admin-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? '🔐 Signing in...' : '🔓 Sign in with Google'}
          </button>
        </div>

        <div className="divider">OR</div>

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
          <h3>Approved Admins ({approvedAdmins.length}):</h3>
          <ul className="admin-list">
            {approvedAdmins.length > 0 ? (
              approvedAdmins.map((adminEmail, index) => (
                <li key={index}>✓ {adminEmail}</li>
              ))
            ) : (
              <li>No approved admins found in abc123 collection</li>
            )}
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
