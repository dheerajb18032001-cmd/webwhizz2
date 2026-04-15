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
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = result.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email,
        full_name: name,
        password: password, // Note: In production, never store plain passwords
        sign_up_as: role,
        enrolledCourses: [],
        certificates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setUser(newUser);
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
      const userDoc = await getDoc(doc(db, 'users', loggedInUser.uid));
      if (userDoc.exists()) {
        // Support both field names for backward compatibility
        const role = userDoc.data().sign_up_as || userDoc.data().role || 'student';
        setUserRole(role);
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
            setUserRole(userDoc.data().role);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        setError(err.message);
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
