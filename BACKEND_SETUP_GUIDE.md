# 🚀 Whizz Backend Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Update `.env` file with:
```env
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=whizz-3fcf2
FIREBASE_API_KEY=AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98
FRONTEND_URL=http://localhost:3002
```

### 3. Run Backend (Local)
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Backend runs on: `http://localhost:5000`

---

## 📍 API Endpoints Structure

```
/api/health              ✅ Server health check
/api/auth/...            🔐 Authentication routes
/api/courses/...         📚 Course management
/api/enrollments/...     ✏️  Enrollment management
/api/users/...           👥 User management
/api/admin/...           🛡️ Admin operations
```

---

## 🛡️ NEW: Admin API Endpoints

### 1. Verify Admin Access
**GET** `/api/admin/verify`
```bash
curl -H "Authorization: Bearer <idToken>" \
  http://localhost:5000/api/admin/verify
```
**Response:**
```json
{
  "success": true,
  "message": "✅ Admin verified",
  "admin": {
    "uid": "user123",
    "email": "admin@whizz.com",
    "role": "admin",
    "verifiedAt": "2026-04-17T10:30:00Z"
  }
}
```

### 2. Get Approved Admins List
**GET** `/api/admin/list`
```bash
curl -H "Authorization: Bearer <idToken>" \
  http://localhost:5000/api/admin/list
```
**Response:**
```json
{
  "success": true,
  "count": 3,
  "admins": [
    {
      "id": "admin@whizz.com",
      "email": "admin@whizz.com",
      "name": "Admin User"
    }
  ]
}
```

### 3. Add New Admin (Admin Only)
**POST** `/api/admin/add`
```bash
curl -X POST \
  -H "Authorization: Bearer <idToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newidmin@whizz.com",
    "name": "New Admin"
  }' \
  http://localhost:5000/api/admin/add
```

### 4. Remove Admin (Admin Only)
**DELETE** `/api/admin/remove/:email`
```bash
curl -X DELETE \
  -H "Authorization: Bearer <idToken>" \
  http://localhost:5000/api/admin/remove/admin1@whizz.com
```

### 5. Get Dashboard Stats
**GET** `/api/admin/stats`
```bash
curl -H "Authorization: Bearer <idToken>" \
  http://localhost:5000/api/admin/stats
```
**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalCourses": 25,
    "totalEnrollments": 450,
    "studentsCount": 140,
    "instructorsCount": 8,
    "adminsCount": 2
  }
}
```

### 6. Get All Users
**GET** `/api/admin/users?role=student&limit=50&offset=0`
```bash
curl -H "Authorization: Bearer <idToken>" \
  'http://localhost:5000/api/admin/users?role=student&limit=50'
```

### 7. Delete User
**DELETE** `/api/admin/users/:userId`
```bash
curl -X DELETE \
  -H "Authorization: Bearer <idToken>" \
  http://localhost:5000/api/admin/users/abc123xyz
```

---

## 🔗 Frontend Integration

Update your React frontend to call backend APIs:

### Example: Fetch Admin List
```javascript
// services/api.js
import { getAuth } from 'firebase/auth';

export const getAdminList = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error('Not authenticated');
  
  const idToken = await user.getIdToken();
  
  const response = await fetch(
    'http://localhost:5000/api/admin/list',
    {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch admin list');
  }
  
  return response.json();
};
```

### Example: Add Admin
```javascript
export const addAdmin = async (email, name) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) throw new Error('Not authenticated');
  
  const idToken = await user.getIdToken();
  
  const response = await fetch(
    'http://localhost:5000/api/admin/add',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to add admin');
  }
  
  return response.json();
};
```

---

## 🚀 Production Deployment

### Option 1: Deploy to Cloud Run (Recommended)
```bash
# 1. Build Docker image (if using Docker)
docker build -t whizz-backend .

# 2. Deploy to Cloud Run
gcloud run deploy whizz-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars FIREBASE_PROJECT_ID=whizz-3fcf2
```

### Option 2: Deploy to Firebase Cloud Functions
Already configured in `functions/` folder. Deploy with:
```bash
firebase deploy --only functions
```

### Option 3: Deploy to Heroku
```bash
# 1. Create Procfile
echo "web: npm start" > Procfile

# 2. Deploy
heroku create whizz-backend
git push heroku main
```

---

## 🔐 Security Rules Summary

Your Firestore rules now allow:

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| `abc123` (admins) | ✅ Public | ❌ Admin | ❌ Admin | ❌ Admin |
| `users` | 👤 Own/Admin | 👤 Self | 👤 Own/Admin | ❌ Admin |
| `courses` | ✅ Public | 🛡️ Instructor/Admin | 🛡️ Instructor/Admin | ❌ Admin |
| `enrollments` | 👤 Users | 👤 Users | 👤 Self/Admin | ❌ Admin |
| `client` | ✅ Public | ✅ Public | ❌ Admin | ❌ Admin |

---

## 🧪 Testing with cURL

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Admin Verify (with token)
```bash
# First, get your ID token from browser console:
# firebase.auth().currentUser.getIdToken()

curl -H "Authorization: Bearer YOUR_ID_TOKEN" \
  http://localhost:5000/api/admin/verify
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### CORS Errors
- Ensure frontend URL is in CORS whitelist in `server.js`
- Update `.env` FRONTEND_URL if needed

### Firebase Connection Issues
- Verify `.env` has correct `FIREBASE_PROJECT_ID`
- Check service account key permissions
- Ensure Firestore API is enabled

### Admin Verification Failing
- Verify email exists in `abc123` collection
- Check user has `role: 'admin'` in `users` collection
- Ensure ID token is valid and current

---

## 📚 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000

# Frontend URLs (CORS)
FRONTEND_URL=http://localhost:3002

# Firebase
FIREBASE_PROJECT_ID=whizz-3fcf2
FIREBASE_API_KEY=AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98
FIREBASE_AUTH_DOMAIN=whizz-3fcf2.firebaseapp.com

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=7d

# Collections
ADMIN_COLLECTION=abc123
USERS_COLLECTION=users
COURSES_COLLECTION=courses
ENROLLMENTS_COLLECTION=enrollments
CLIENT_COLLECTION=client
```

---

## ✅ Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Verify Firestore security rules are deployed
- [ ] Set up CORS for production domain
- [ ] Configure Firebase service account (if deployingto serverless)
- [ ] Test all admin endpoints
- [ ] Monitor logs and errors
- [ ] Set up backup and recovery

---

**Backend Ready for Production! 🚀**

