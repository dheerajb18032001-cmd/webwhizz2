import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, name, role = 'student') => {
    try {
      setError(null);
      
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = result.user;
      setUser(newUser);
      
      // Store user data in Firestore (frontend handles this since backend has credential issues)
      const userData = {
        uid: newUser.uid,
        email,
        fullName: name,
        role: role || 'student',
        sign_up_as: role || 'student',
        profilePicture: null,
        bio: '',
        phone: '',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        enrolledCourses: [],
        completedCourses: [],
      };
      
      try {
        await setDoc(doc(db, 'users', newUser.uid), userData);
        console.log(`✅ User document created in Firestore: ${newUser.uid} with role: ${role}`);
      } catch (firestoreError) {
        console.warn('⚠️ Could not save to Firestore:', firestoreError.message);
        // Continue anyway - user was created in Auth
      }
      
      // Also notify backend for any additional setup
      try {
        const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        await fetch(`${backendUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role: role || 'student' }),
        });
      } catch (backendError) {
        console.warn('Backend notification failed:', backendError.message);
      }
      
      setUserRole(role);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = result.user;
      setUser(loggedInUser);

      // Fetch user role from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Support both field names: new backend format (role) and old format (sign_up_as)
          const role = userData.role || userData.sign_up_as || 'student';
          setUserRole(role);
        } else {
          // User doc doesn't exist, set default role as student
          setUserRole('student');
        }
      } catch (firestoreError) {
        console.warn('Could not fetch user role from Firestore:', firestoreError);
        setUserRole('student');
      }

      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      setUser(googleUser);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', googleUser.uid));
      
      if (userDoc.exists()) {
        // User already exists
        setUserRole(userDoc.data().sign_up_as || userDoc.data().role);
      } else {
        // Create new user document for Google sign-in users
        const role = 'student'; // Default role for Google sign-in
        await setDoc(doc(db, 'users', googleUser.uid), {
          uid: googleUser.uid,
          email: googleUser.email,
          full_name: googleUser.displayName || googleUser.email,
          sign_up_as: role,
          authProvider: 'google',
          createdAt: new Date(),
          updatedAt: new Date(),
          enrolledCourses: [],
          certificates: [],
          profilePicture: googleUser.photoURL,
        });
        setUserRole(role);
      }

      return googleUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Support both field names: role (new) and sign_up_as (old)
            const role = userData.role || userData.sign_up_as || 'student';
            setUserRole(role);
            console.log('User role set to:', role);
          } else {
            console.log('User document not found, defaulting to student');
            setUserRole('student');
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        setError(err.message);
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userRole,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
