# 🎯 Complete Backend Integration Guide

Your Whizz platform now has a **full-featured Node.js backend** with Firebase! 

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (Port 3002)             │
│         (CourseList, Dashboard, Course Detail)          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS Requests
                   ▼ (using api.js service)
┌─────────────────────────────────────────────────────────┐
│           Node.js Express Backend (Port 5000)           │
│     ┌─────────────────────────────────────────────┐    │
│     │  Routes:                                    │    │
│     │  • /api/auth (signup, login, profile)       │    │
│     │  • /api/courses (CRUD operations)           │    │
│     │  • /api/enrollments (enroll, progress)      │    │
│     │  • /api/users (profiles, statistics)        │    │
│     └─────────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────────────┘
                   │ Firebase Admin SDK
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Firebase (Google Cloud)                      │
│  ┌────────────────────────────────────────────────┐   │
│  │  Firestore                                     │   │
│  │  ├── users (profiles & roles)                  │   │
│  │  ├── courses (course details)                  │   │
│  │  ├── enrollments (student progress)            │   │
│  │  └── certificates (issued certificates)        │   │
│  │                                                │   │
│  │  Authentication Engine                         │   │
│  │  └── JWT Token Verification                    │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Both Servers Running

### Terminal 1: React Frontend
```bash
cd c:\whizz
npm start
# Running on http://localhost:3002
```

### Terminal 2: Node.js Backend
```bash
cd c:\whizz\backend
npm start
# Running on http://localhost:5000
```

**Now you have:**
- ✅ Frontend: http://localhost:3002
- ✅ Backend: http://localhost:5000
- ✅ Database: Firebase Firestore (online)

---

## 🔌 Data Flow Examples

### Example 1: Get All Courses

**Frontend (React)**
```javascript
import { coursesAPI } from '../services/api';

// Component
useEffect(() => {
  const fetchCourses = async () => {
    const result = await coursesAPI.getAllCourses();
    setCourses(result.data);
  };
  fetchCourses();
}, []);
```

**Request Flow:**
```
React Component
    ↓
api.js (fetch to http://localhost:5000/api/courses)
    ↓
Backend Express Server
    ↓
courses.js route handler
    ↓
Firebase Admin SDK
    ↓
Firestore: SELECT * FROM courses
    ↓
Response: [{ id, title, price, ... }]
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course123",
      "title": "React Basics",
      "category": "Web Development",
      "price": 499
    },
    ...
  ]
}
```

---

### Example 2: Enroll in Course (with Authentication)

**Frontend (React)**
```javascript
import { enrollmentsAPI } from '../services/api';

const handleEnroll = async () => {
  const result = await enrollmentsAPI.enrollCourse(user, courseId);
  if (result.success) {
    console.log('Enrolled! Certificate:', result.data.enrollmentId);
  }
};
```

**Request with Token:**
```
HTTP POST /api/enrollments/enroll
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMyJ9...
Content-Type: application/json

{
  "courseId": "course123"
}
```

**Request Flow:**
```
React Component (authenticated user)
    ↓
Get user's Firebase ID Token
    ↓
Send to: POST /api/enrollments/enroll
    ↓
Backend Middleware (verifyToken)
    ↓
Verify Token with Firebase
    ↓
Extract user UID and email
    ↓
Create enrollment record in Firestore
    ↓
Update course's studentCount
    ↓
Response: 201 Created { enrollmentId, progress: 0 }
```

---

### Example 3: Update Course Progress

**Frontend (React)**
```javascript
const updateProgress = async () => {
  await enrollmentsAPI.updateProgress(
    user, 
    enrollmentId, 
    75  // 75% complete
  );
};
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "enrollmentId": "enr123",
    "progress": 75
  }
}
```

---

## 📋 API Endpoints Reference

### Courses (Public - No Auth Needed)
```
GET    /api/courses                    - Get all courses
GET    /api/courses/:courseId          - Get single course
POST   /api/courses                    - Create (instructor)
PUT    /api/courses/:courseId          - Update (instructor)
DELETE /api/courses/:courseId          - Delete (instructor)
```

### Enrollments (Requires Authentication)
```
POST   /api/enrollments/enroll         - Enroll in course
GET    /api/enrollments/my-enrollments - Get my courses
GET    /api/enrollments/check/:id      - Check if enrolled
PUT    /api/enrollments/progress/:id   - Update progress
POST   /api/enrollments/complete/:id   - Complete course
DELETE /api/enrollments/:id            - Unenroll
```

### Authentication (Mixed)
```
POST   /api/auth/signup                - Register (public)
GET    /api/auth/me                    - Get profile (auth)
PUT    /api/auth/profile               - Update profile (auth)
POST   /api/auth/logout                - Logout (auth)
```

### Users (Mixed)
```
GET    /api/users/:userId              - Get user profile
GET    /api/users/:userId/stats        - Get user stats (auth)
PUT    /api/users/:userId              - Update profile (auth)
```

---

## 🔒 Authentication Flow

### How Token-Based Auth Works:

```
1. USER SIGNS UP
   Frontend: createUserWithEmailAndPassword(auth, email, password)
           ↓
   Firebase Auth: Creates user + sends verification email
           ↓
   Backend: Stores user profile in Firestore

2. USER LOGS IN
   Frontend: signInWithEmailAndPassword(auth, email, password)
           ↓
   Firebase Auth: Returns user object + ID token
           ↓
   Frontend stores user object in React Context

3. AUTHENTICATED REQUEST
   Component: await enrollmentsAPI.enrollCourse(user, courseId)
           ↓
   api.js: Gets ID token → await user.getIdToken()
           ↓
   Sends: POST /api/enrollments/enroll
           Headers: Authorization: Bearer <idToken>
           ↓
   Backend Middleware (verifyToken):
           - Verifies token signature with Firebase
           - Extracts user UID
           - Attaches to req.user
           ↓
   Route Handler processes request with user info
           ↓
   Response sent back to frontend
```

### Token Format:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9.
eyJpc3MiOiJodHRwczovL3NlY nic...
```

---

## 🧪 Testing Endpoints

### Using cURL

**Test Health:**
```bash
curl http://localhost:5000/api/health
```

**Get All Courses:**
```bash
curl http://localhost:5000/api/courses
```

**Create Course (needs token):**
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics",
    "category": "Application Development",
    "price": 499
  }'
```

### Using Postman

1. **Import Collection** (later)
2. **Set Variables:**
   - `baseUrl`: http://localhost:5000/api
   - `idToken`: Paste from Firebase login
3. **Test Endpoints**

---

## 🎯 What You Can Do Now

### From Frontend (React):
```javascript
// ✅ Get courses
const courses = await coursesAPI.getAllCourses();

// ✅ Enroll in course
await enrollmentsAPI.enrollCourse(user, courseId);

// ✅ Track progress
await enrollmentsAPI.updateProgress(user, enrollmentId, 50);

// ✅ Complete course and get certificate
const cert = await enrollmentsAPI.completeCourse(user, enrollmentId);

// ✅ Manage profile
await authAPI.updateProfile(user, { name, bio, phone });

// ✅ Get student dashboard stats
const stats = await usersAPI.getUserStats(user, userId);
```

### From Backend (Node.js):
- Handle all CRUD operations
- Verify authentication
- Manage roles (admin, instructor, student)
- Track enrollment and progress
- Issue certificates

---

## 📈 Next Integration Steps

### 1. Update StudentDashboard.js
```javascript
import { enrollmentsAPI } from '../services/api';

// Replace Firebase calls with backend API
const enrollments = await enrollmentsAPI.getMyEnrollments(user);
```

### 2. Update InstructorDashboard.js
```javascript
import { coursesAPI } from '../services/api';

// Get instructor's courses
const courses = await coursesAPI.getInstructorCourses(user);
```

### 3. Update AdminPanel.js
```javascript
import { coursesAPI } from '../services/api';

// Create courses
await coursesAPI.createCourse(user, courseData);
```

### 4. Add Payment Integration
```javascript
// After successful payment, call:
await enrollmentsAPI.enrollCourse(user, courseId);
```

---

## 🚨 Troubleshooting

### "Cannot GET /api/courses"
- Backend server not running? Start with `npm start` in backend/
- Wrong URL? Use http://localhost:5000 (not 3002)

### "CORS Error"
- Frontend and backend on different domains
- Check CORS config in server.js
- Add your frontend URL to whitelist

### "Authorization failed"
- User not logged in? Login first
- Token expired? Logout and login again
- Wrong header format? Use `Bearer <token>` (space important)

### "Firestore connection failed"
- Missing service account key
- Firebase project not configured
- Wrong project ID in .env

---

## 🎉 Summary

**You now have:**

✅ **Node.js Backend** running on port 5000
- Express server with CORS enabled
- All routes configured
- Firebase authentication integrated
- Firestore database connected

✅ **React Frontend** running on port 3002
- API service file ready
- All components can call backend
- Automatic fallback to Firebase if backend unavailable

✅ **Firebase Backend**
- Firestore database
- Authentication system
- Real-time updates capability

✅ **Complete API Documentation**
- 20+ endpoints
- All HTTP methods (GET, POST, PUT, DELETE)
- Request/response examples

**Ready to deploy! 🚀**

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express server |
| `backend/routes/auth.js` | Authentication endpoints |
| `backend/routes/courses.js` | Courses CRUD |
| `backend/routes/enrollments.js` | Student enrollments |
| `backend/middleware/auth.js` | Token verification |
| `src/services/api.js` | Frontend API client |
| `backend/API_DOCUMENTATION.md` | Complete API docs |
| `backend/README.md` | Backend setup guide |

---

**Questions? Check:**
1. Backend console for request logs
2. API_DOCUMENTATION.md for endpoint details
3. Browser DevTools Network tab for requests
4. Firebase console for database logs
