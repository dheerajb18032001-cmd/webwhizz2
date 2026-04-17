# 🔐 Role-Based Access Control (RBAC) Implementation

## 📝 Backend Implementation

### 1. Verify Role Middleware

**File:** `backend/middleware/auth.js`

```javascript
const { admin, auth: firebaseAuth } = require('../firebase-config');

// Verify Firebase Token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Verify Admin Role
const verifyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Permission denied' });
  }
};

// Verify Instructor Role
const verifyInstructor = async (req, res, next) => {
  try {
    if (!['instructor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Instructor access required' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Permission denied' });
  }
};

// Verify Student Role  
const verifyStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Student access required' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Permission denied' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyInstructor,
  verifyStudent,
};
```

### 2. Route Protection Example

**File:** `backend/routes/courses.js`

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken, verifyInstructor, verifyAdmin } = require('../middleware/auth');
const { admin, db } = require('../firebase-config');

// Public: Anyone can view published courses
router.get('/', async (req, res) => {
  try {
    const snapshot = await db
      .collection('courses')
      .where('status', '==', 'published')
      .get();
    
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: Only instructors can create courses
router.post('/', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    
    const courseData = {
      title,
      description,
      price: parseFloat(price),
      category,
      instructorId: req.user.uid,        // Set to current user
      instructorName: req.user.email,
      status: 'draft',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      students: [],
      studentCount: 0,
    };
    
    const docRef = await db.collection('courses').add(courseData);
    
    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...courseData },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: Instructors can edit own courses only
router.put('/:courseId', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseRef = await db.collection('courses').doc(courseId).get();
    
    if (!courseRef.exists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user owns the course
    if (courseRef.data().instructorId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit your own courses' 
      });
    }
    
    // Update course
    await db.collection('courses').doc(courseId).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ success: true, message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected: Only admins can delete courses
router.delete('/:courseId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { courseId } = req.params;
    await db.collection('courses').doc(courseId).delete();
    
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

---

## 🎨 Frontend Implementation

### AuthContext with Role Management

**File:** `src/context/AuthContext.js`

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { 
  signOut, 
  onAuthStateChanged, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Get custom claims from token
        const idTokenResult = await currentUser.getIdTokenResult();
        const role = idTokenResult.claims.role || 'student'; // default to student
        
        setUser(currentUser);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => userRole === 'admin';
  const isInstructor = () => ['instructor', 'admin'].includes(userRole);
  const isStudent = () => userRole === 'student';

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout, isAdmin, isInstructor, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Protected Route Component

**File:** `src/components/ProtectedRoute.js`

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    if (typeof requiredRole === 'string' && userRole !== requiredRole) {
      return <Navigate to="/" />;
    }
    if (Array.isArray(requiredRole) && !requiredRole.includes(userRole)) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
```

### Usage in App Routes

**File:** `src/App.js`

```javascript
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected: Students only */}
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected: Instructors and Admins */}
        <Route 
          path="/instructor-dashboard" 
          element={
            <ProtectedRoute requiredRole={['instructor', 'admin']}>
              <InstructorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected: Admins only */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
```

---

## 🛠️ Setting Up Roles

### Backend: Assign Role After Sign Up

**File:** `backend/routes/auth.js`

```javascript
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      fullName: name,
      role,              // Store role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
    });

    // Set custom claims for quick verification
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { uid: userRecord.uid, email, role },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
```

### Frontend: Display Based on Role

```javascript
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { userRole, isAdmin, isInstructor, isStudent } = useAuth();

  return (
    <div>
      {isStudent && (
        <div>
          <h1>Student Dashboard</h1>
          {/* Student content */}
        </div>
      )}
      
      {isInstructor && (
        <div>
          <h1>Instructor Dashboard</h1>
          {/* Instructor content */}
        </div>
      )}
      
      {isAdmin && (
        <div>
          <h1>Admin Dashboard</h1>
          {/* Admin content */}
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Complete Role Checklist

- [ ] Backend middleware set up (`verifyAdmin`, `verifyInstructor`, `verifyStudent`)
- [ ] AuthContext includes role information
- [ ] Custom claims set during sign up
- [ ] ProtectedRoute component checks roles
- [ ] Routes protected based on role
- [ ] Firestore security rules match role structure
- [ ] Backend endpoints check roles
- [ ] Frontend displays role-specific content
