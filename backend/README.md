# 🚀 Whizz Backend - Node.js + Firebase

Your complete Node.js backend for the Whizz Course Platform!

## 📁 Project Structure

```
whizz/
├── backend/                      # Node.js Backend
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── courses.js           # Courses CRUD endpoints
│   │   ├── enrollments.js       # Enrollments & progress
│   │   └── users.js             # User profiles
│   ├── middleware/
│   │   └── auth.js              # Token verification & roles
│   ├── firebase-config.js       # Firebase Admin setup
│   ├── server.js                # Express server
│   ├── package.json
│   ├── .env.example
│   └── API_DOCUMENTATION.md     # Complete API docs
├── src/                         # React Frontend
│   ├── services/
│   │   └── api.js              # Backend API client
│   └── ...
└── README.md
```

---

## ✅ Quick Start

### 1️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Setup Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and set your values
# NODE_ENV=development
# PORT=5000
# FRONTEND_URL=http://localhost:3002
```

### 3️⃣ Setup Firebase
```bash
# Copy service account key
cp ../src/firebase/serviceAccountKey.json .

# Or set environment variable (for production)
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### 4️⃣ Start Backend Server
```bash
# Development (with auto-reload)
npm run dev

# Or production
npm start
```

**Output:**
```
╔════════════════════════════════════════════════════════╗
║   🚀 Whizz Backend Server Running                      ║
║   📍 Port: 5000                                          ║
║   🌐 URL: http://localhost:5000                         ║
║   💾 Database: Firebase Firestore                      ║
║   🔐 Auth: Firebase Authentication                     ║
╚════════════════════════════════════════════════════════╝
```

---

## 🔌 Connect Frontend to Backend

### In React (.env):
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Using Backend API in React:
```javascript
import { coursesAPI, enrollmentsAPI, authAPI } from '../services/api';

// Get all courses
const courses = await coursesAPI.getAllCourses();

// Enroll in course
await enrollmentsAPI.enrollCourse(user, courseId);

// Update progress
await enrollmentsAPI.updateProgress(user, enrollmentId, 75);
```

---

## 📚 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Courses
```bash
# Get all courses
GET /api/courses

# Get single course
GET /api/courses/:courseId

# Create course (need token)
POST /api/courses

# Update course
PUT /api/courses/:courseId

# Delete course
DELETE /api/courses/:courseId
```

### Enrollments
```bash
# Enroll in course
POST /api/enrollments/enroll

# Get my enrollments
GET /api/enrollments/my-enrollments

# Check if enrolled
GET /api/enrollments/check/:courseId

# Update progress
PUT /api/enrollments/progress/:enrollmentId

# Complete course
POST /api/enrollments/complete/:enrollmentId

# Unenroll
DELETE /api/enrollments/:enrollmentId
```

### Authentication
```bash
# Signup
POST /api/auth/signup

# Get current user
GET /api/auth/me

# Update profile
PUT /api/auth/profile

# Logout
POST /api/auth/logout
```

**📖 [Full API Documentation](./API_DOCUMENTATION.md)**

---

## 🔒 Authentication Flow

### How It Works:

1. **User Signup** (React Frontend):
   ```javascript
   const { email, password, name } = formData;
   await createUserWithEmailAndPassword(auth, email, password);
   ```

2. **Get ID Token**:
   ```javascript
   const idToken = await user.getIdToken();
   ```

3. **Send Authenticated Request** to Backend:
   ```javascript
   fetch('http://localhost:5000/api/auth/me', {
     headers: { 'Authorization': `Bearer ${idToken}` }
   });
   ```

4. **Backend Verifies Token**:
   - Middleware verifies Firebase ID token
   - Extracts user info and role
   - Processes request or returns 401 Unauthorized

### Required Headers:
```
Authentication: Bearer <idToken>
Content-Type: application/json
```

---

## 🗄️ Database Structure (Firestore)

### Collections:

**users** - User profiles
```javascript
{
  uid: "user123",
  email: "user@example.com",
  name: "John Doe",
  role: "student", // or "instructor", "admin"
  createdAt: timestamp
}
```

**courses** - Course details
```javascript
{
  title: "React Basics",
  description: "...",
  category: "Web Development",
  price: 499,
  instructorId: "instructor123",
  studentCount: 45,
  students: ["uid1", "uid2"],
  createdAt: timestamp
}
```

**enrollments** - Student enrollments
```javascript
{
  studentId: "student123",
  courseId: "course123",
  courseName: "React Basics",
  progress: 75,
  status: "active", // or "completed"
  enrolledAt: timestamp,
  completedAt: null
}
```

---

## 🛠️ Development

### Debugging

1. **See API logs**:
   ```bash
   # All API calls are logged to console
   📨 GET /api/courses
   📨 POST /api/enrollments/enroll
   ```

2. **Check backend health**:
   ```bash
   curl http://localhost:5000/api/health
   # Response: { status: "Backend is running! ✅", timestamp: "..." }
   ```

3. **Browser DevTools Network tab**:
   - Monitor all API requests
   - Check response status and data
   - Verify authorization headers

### Troubleshooting

#### "Connection refused" Error
- Backend not running? Run `npm run dev`
- Wrong port? Check `.env` PORT value
- Frontend pointing to wrong URL? Check `REACT_APP_API_URL`

#### "CORS Error"
- Add your frontend URL to CORS whitelist in `server.js`
- Example: `http://localhost:3002`

#### "Authorization failed"
- User not logged in? Check Firebase login first
- Token expired? Re-login to get fresh token
- Wrong API endpoint? Check bearer token format: `Bearer <idToken>`

---

## 📦 Deployment

### Deploy to Heroku
```bash
cd backend

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set PORT=5000
heroku config:set FIREBASE_PROJECT_ID=computer-250e7
heroku config:set FIREBASE_SERVICE_ACCOUNT='{"type":"..."}'

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to Railway
```bash
# Link Railway to your repo
railway init

# Add backend directory
railway add backend

# Deploy
railway up
```

### Deploy to Vercel/Netlify (Serverless)
Convert `server.js` to serverless functions:
```bash
# Create api/ folder with individual function files
# Each route becomes a separate function
```

---

## 📊 Monitoring

### Monitor API Usage
```javascript
// Add to server.js for tracking
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Check Firestore Usage
- Firebase Console → Firestore Database → Usage tab
- Monitor reads, writes, deletes
- Set up alerts for quota

### Performance Tips
- Cache frequently accessed data
- Use pagination for large datasets
- Index commonly filtered fields in Firestore

---

## 🚀 What's Included

✅ **Authentication**
- Signup/Login with Firebase
- Token verification
- Role-based access control (RBAC)

✅ **Courses Management**
- Create/Read/Update/Delete courses
- Filter by category
- Search functionality
- Instructor-specific operations

✅ **Enrollments System**
- Student enrollment in courses
- Progress tracking (0-100%)
- Course completion
- Certificate issuance
- Unenrollment support

✅ **User Profiles**
- Profile management
- User statistics
- Role management

✅ **Error Handling**
- Comprehensive error messages
- Proper HTTP status codes
- Middleware for auth & validation

---

## 🔄 Next Steps

1. **Frontend Integration**
   - Update React components to use API
   - Replace direct Firebase calls with API calls
   - Add loading/error states

2. **Payment Integration**
   - Add Razorpay webhook
   - Verify payment before enrollment
   - Track transactions

3. **Advanced Features**
   - Email notifications (SendGrid)
   - Video streaming (AWS S3)
   - Analytics dashboard
   - Discussion forums

4. **Security**
   - Add rate limiting
   - Input validation
   - SQL injection prevention
   - DDoS protection

---

## 📞 Support

For API issues, check:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Full endpoint documentation
- Backend console logs - Error messages
- Firebase console - Database & auth issues
- Network tab - Request/response details

---

**Backend is ready! 🎉 Start building! 🚀**
