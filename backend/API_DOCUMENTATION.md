# Whizz Backend API Documentation

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` folder:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3002
FIREBASE_PROJECT_ID=computer-250e7
```

### 3. Firebase Setup
- Place your `serviceAccountKey.json` in `../src/firebase/serviceAccountKey.json`
- Or set `FIREBASE_SERVICE_ACCOUNT` environment variable with JSON string

### 4. Run Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

---

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

---

## 🔐 Authentication Routes

### Signup/Register
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "name": "John Doe",
  "role": "student"  // or "instructor"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "uid": "abc123...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <idToken>

Response:
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "...",
    "name": "...",
    "role": "..."
  }
}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Passionate learner",
  "phone": "+919876543210",
  "profilePicture": "https://..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <idToken>
```

---

## 📖 Courses Routes

### Get All Courses
```http
GET /api/courses?category=Web%20Development&search=React&limit=50&offset=0

Response:
{
  "success": true,
  "data": [
    {
      "id": "course123",
      "title": "React Basics",
      "description": "...",
      "category": "Web Development",
      "price": 499,
      "duration": 20,
      "studentCount": 45,
      ...
    }
  ],
  "total": 2
}
```

### Get Single Course
```http
GET /api/courses/:courseId

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    ...
  }
}
```

### Create Course (Instructor/Admin)
```http
POST /api/courses
Authorization: Bearer <instructorToken>
Content-Type: application/json

{
  "title": "Advanced Python",
  "description": "Master Python programming",
  "category": "Application Development",
  "duration": 30,
  "price": 999,
  "image": "https://...",
  "level": "advanced",
  "tags": ["python", "advanced"]
}

Response:
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "newCourseId",
    ...
  }
}
```

### Update Course (Instructor/Admin)
```http
PUT /api/courses/:courseId
Authorization: Bearer <instructorToken>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 1099
}
```

### Delete Course (Instructor/Admin)
```http
DELETE /api/courses/:courseId
Authorization: Bearer <instructorToken>
```

### Get My Courses (Instructor)
```http
GET /api/courses/instructor/my-courses
Authorization: Bearer <instructorToken>
```

---

## 📚 Enrollments Routes

### Enroll in Course
```http
POST /api/enrollments/enroll
Authorization: Bearer <studentToken>
Content-Type: application/json

{
  "courseId": "course123"
}

Response:
{
  "success": true,
  "message": "Enrolled successfully",
  "data": {
    "enrollmentId": "enr123",
    "studentId": "...",
    "courseId": "...",
    "progress": 0,
    "status": "active"
  }
}
```

### Get My Enrollments
```http
GET /api/enrollments/my-enrollments
Authorization: Bearer <studentToken>

Response:
{
  "success": true,
  "data": [
    {
      "id": "enr123",
      "courseId": "...",
      "courseName": "React Basics",
      "progress": 45,
      "status": "active"
    }
  ],
  "total": 5
}
```

### Check If Enrolled
```http
GET /api/enrollments/check/:courseId
Authorization: Bearer <studentToken>

Response:
{
  "success": true,
  "isEnrolled": true,
  "enrollment": { ... }
}
```

### Update Progress
```http
PUT /api/enrollments/progress/:enrollmentId
Authorization: Bearer <studentToken>
Content-Type: application/json

{
  "progress": 75
}
```

### Complete Course
```http
POST /api/enrollments/complete/:enrollmentId
Authorization: Bearer <studentToken>

Response:
{
  "success": true,
  "message": "Course completed successfully",
  "data": {
    "certificateId": "CERT-123456"
  }
}
```

### Unenroll from Course
```http
DELETE /api/enrollments/:enrollmentId
Authorization: Bearer <studentToken>
```

### Get Course Enrollments (Instructor)
```http
GET /api/enrollments/course/:courseId/enrollments
Authorization: Bearer <instructorToken>
```

---

## 👤 Users Routes

### Get User Profile
```http
GET /api/users/:userId

Response:
{
  "success": true,
  "data": {
    "uid": "...",
    "name": "...",
    "email": "...",
    "role": "student"
  }
}
```

### Get All Users
```http
GET /api/users

Response:
{
  "success": true,
  "data": [...],
  "total": 150
}
```

### Update User Profile
```http
PUT /api/users/:userId
Authorization: Bearer <userToken>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "My bio",
  "phone": "+9198765"
}
```

### Get User Statistics
```http
GET /api/users/:userId/stats
Authorization: Bearer <userToken>

Response:
{
  "success": true,
  "data": {
    "coursesEnrolled": 5,
    "coursesCompleted": 2,
    "coursesTaught": 0,
    "averageProgress": "60.50"
  }
}
```

---

## 🔒 Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <idToken>
```

Get `idToken` from Firebase:
```javascript
// On Frontend (React)
const idToken = await user.getIdToken();

// Send in requests
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
})
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional details (development only)"
}
```

Common error codes:
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 🚀 Deployment

### Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set PORT=5000
heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Deploy
git push heroku main
```

### Deploy to Firebase Cloud Functions
```bash
firebase deploy --only functions
```

---

## 📝 Notes

- All timestamps are in UTC
- Prices are in INR (₹)
- Courses must have instructorId set to the creating user's uid
- Students array on courses tracks enrolled student IDs
- Progress values must be 0-100

