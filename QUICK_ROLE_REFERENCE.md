# 🚀 Quick Start: Roles & Collections

## 📝 Current Status of Your App

✅ **Already Implemented:**
- Backend role verification middleware (`verifyAdmin`, `verifyInstructor`)
- Auth signup with role parameter
- Firestore user collection with roles
- Custom claims on Firebase Auth tokens
- Enrollment tracking

✅ **Collections Setup:**
- `users` - User profiles with roles
- `courses` - Course listings
- `enrollments` - Student enrollments
- `client` - Client inquiries

---

## 🎯 Three User Roles

### 1️⃣ **Student** (Default)
- Browse all courses
- Enroll in courses
- Track progress
- View certificates

**Sign Up:** 
```bash
POST /api/auth/signup
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
  // role defaults to "student"
}
```

**Dashboard:** `/student-dashboard`

---

### 2️⃣ **Instructor** 
- Create/edit own courses
- View student enrollments
- Track course progress
- Issue certificates

**Admin assigns role:**
```javascript
// Backend admin command
admin.auth().setCustomUserClaims(userId, { role: 'instructor' })
```

Or sign up with role:
```bash
POST /api/auth/signup
{
  "email": "instructor@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "instructor"
}
```

**Dashboard:** `/instructor-dashboard`

---

### 3️⃣ **Admin**
- Manage all users
- Manage all courses
- View all statistics
- System configuration

**Assignment (careful!):**
```javascript
admin.auth().setCustomUserClaims(userId, { role: 'admin' })
```

**Dashboard:** `/admin-dashboard`

---

## 📊 Current Collections

### `users` Collection
**Fields:**
- `uid` - User ID
- `email` - User email
- `name` - Full name
- `role` - "student" | "instructor" | "admin"
- `profilePicture` - Avatar URL
- `bio` - User bio
- `createdAt` - Signup timestamp

**Example Query (Firebase):**
```javascript
db.collection('users')
  .where('role', '==', 'instructor')
  .get()
```

---

### `courses` Collection
**Fields:**
- `title` - Course name
- `description` - Course details
- `price` - Course fee
- `category` - Web Dev, AI/ML, etc.
- `instructorId` - Who created it
- `students` - Array of student IDs
- `studentCount` - Number enrolled
- `status` - "draft" | "published" | "archived"

---

### `enrollments` Collection
**Fields:**
- `studentId` - Who enrolled
- `courseId` - Which course
- `progress` - 0-100%
- `status` - "active" | "completed" | "dropped"
- `enrolledAt` - Timestamp
- `completedAt` - When finished

---

### `client` Collection
**Fields:**
- `full_name` - Contact name
- `email` - Contact email
- `course` - Interest
- `status` - "inquiry" | "enrolled"
- `message` - Their message

---

## 🔐 API Endpoints by Role

### Public (No Login Required)
```
GET  /api/health              - Check backend status
GET  /api/courses             - List published courses
GET  /api/courses/:courseId   - Get course details
POST /api/auth/signup         - Create account
```

### Student (Login Required)
```
POST /api/auth/login                    - Login
POST /api/enrollments/enroll             - Enroll in course
GET  /api/enrollments/my-enrollments    - My courses
PUT  /api/enrollments/progress/:id      - Update progress
```

### Instructor (Login Required)
```
POST   /api/courses                  - Create course
PUT    /api/courses/:courseId        - Edit course
GET    /api/enrollments/course/:id   - See enrollments
```

### Admin (Login Required)
```
DELETE /api/courses/:courseId        - Delete course
DELETE /api/users/:userId            - Remove user
GET    /api/users                    - List all users
```

---

## 🎮 How to Test Roles

### Step 1: Sign Up as Student
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Test@123",
    "name": "Test Student"
  }'
```

### Step 2: Sign Up as Instructor
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@test.com",
    "password": "Test@123",
    "name": "Test Instructor",
    "role": "instructor"
  }'
```

### Step 3: Try Creating a Course (Instructor Only)
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Course",
    "description": "Course details",
    "price": 99.99,
    "category": "Web Development"
  }'
```

---

## 🎨 Frontend: Show Based on Role

### Using AuthContext
```javascript
import { useAuth } from '../context/AuthContext';

function App() {
  const { userRole, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {userRole === 'student' && <StudentNav />}
      {userRole === 'instructor' && <InstructorNav />}
      {userRole === 'admin' && <AdminNav />}
    </div>
  );
}
```

---

## ✨ Next Steps

1. **Test Roles:**
   - Sign up as student
   - Sign up as instructor
   - Try creating courses

2. **Update Security Rules:**
   - Set Firestore rules based on roles
   - See [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md)

3. **Create Role Selectors:**
   - Add role dropdown to signup
   - Add role assignment UI for admins

4. **Protect Routes:**
   - Implement ProtectedRoute component
   - See [ROLE_IMPLEMENTATION_GUIDE.md](ROLE_IMPLEMENTATION_GUIDE.md)

---

## 📖 Full Documentation

- **[ROLES_AND_COLLECTIONS.md](ROLES_AND_COLLECTIONS.md)** - Complete role reference
- **[ROLE_IMPLEMENTATION_GUIDE.md](ROLE_IMPLEMENTATION_GUIDE.md)** - Code examples
- **[FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md)** - Security setup
