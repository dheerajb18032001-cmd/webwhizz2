# Whizz Platform - Getting Started Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Firebase
1. Update `.env` file with your Firebase credentials (already filled with demo credentials)
2. Current credentials use project: `computer-250e7`

### Step 3: Run the Development Server
```bash
npm start
```
App opens at: http://localhost:3000

### Step 4: Test Login
Use these credentials:
- **Admin**: admin@whizz.com / Admin@123
- **Student**: student@whizz.com / Student@123

---

## 📋 Features Checklist

### ✅ Completed Features
- [x] User Authentication (Email/Password)
- [x] Role-Based Access Control (Admin, Instructor, Student)
- [x] Course Listing & Search
- [x] Course Categories (7 categories)
- [x] Student Dashboard
- [x] Instructor Dashboard
- [x] Admin Dashboard
- [x] Protected Routes
- [x] Firebase Integration
- [x] Responsive Design
- [x] Modern UI with Gradients

### 🔧 Setup & Configuration
- [x] React Router Setup
- [x] Firebase Configuration
- [x] Environment Variables
- [x] Package Dependencies

### 📦 Project Structure
- [x] Organized Components
- [x] Separate Pages
- [x] Context API for Auth
- [x] CSS Modules for Each Component
- [x] Firebase Services

---

## 🚀 Next Steps (Features to Implement)

### Phase 1: Core Functionality
1. **Course Enrollment**
   - Add enrollment logic
   - Save enrollments to Firestore
   - Track student progress

2. **Course Content Management**
   - Add lessons/modules
   - Upload course videos/materials
   - Create course content editor

3. **Progress Tracking**
   - Update progress bars
   - Mark lessons as complete
   - Track completion timestamps

### Phase 2: Advanced Features
1. **Certificates**
   - Generate certificates on completion
   - Download PDF certificates
   - Display certificate gallery

2. **Payments**
   - Integrate Razorpay/Stripe
   - Handle course pricing
   - Payment verification

3. **Notifications**
   - Course enrollment confirmations
   - Progress reminders
   - Course updates

### Phase 3: Enhancement
1. **Reviews & Ratings**
   - Allow course reviews
   - Display ratings
   - Recommendation system

2. **Discussion Forum**
   - Q&A for each course
   - Instructor support
   - Student interaction

3. **Analytics**
   - Student progress analytics
   - Course performance metrics
   - Revenue reports

---

## 📱 Role-Based Navigation

### Student Dashboard
```
Home → Browse Courses → Enroll → My Learning → Track Progress
```

### Instructor Dashboard
```
Create Course → Add Content → View Students → Monitor Ratings
```

### Admin Dashboard
```
Manage Users → Oversee Courses → View Analytics → Approve Content
```

---

## 🔒 Firebase Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.uid != null && 
                      (request.auth.token.role == 'instructor' || 
                       request.auth.token.role == 'admin');
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
  }
}
```

---

## 🎨 Customization

### Colors
Primary: `#667eea` (Purple)
Secondary: `#764ba2` (Dark Purple)

Edit colors in:
- CSS files (all `.css` files)
- `App.css` for global styling

### Fonts
Current: Segoe UI, Tahoma, Geneva

To change, edit in `public/index.html` and `App.css`

### Course Categories
Located in: `src/components/CourseList.js` (line 14-21)

---

## 🐛 Troubleshooting

### "Firebase Config Error"
✅ Verify `.env` file has all required variables

### "Login not working"
✅ Ensure Email/Password auth is enabled in Firebase Console
✅ Check Identity Toolkit API is enabled

### "Can't upload files"
✅ Add Firebase Storage rules
✅ Check bucket permissions

---

## 📚 Database Collections Setup

Run these in Firebase Console to populate test data:

### Create test instructor
```
Collection: users
Document: instructor_id
{
  email: "instructor@whizz.com",
  name: "John Instructor",
  role: "instructor"
}
```

### Create test course
```
Collection: courses
{
  title: "Web Development Fundamentals",
  category: "Web Development",
  instructor: "instructor@whizz.com",
  duration: 40,
  price: 999,
  students: [],
  status: "published"
}
```

---

## 📞 Support & Resources

- Firebase Docs: https://firebase.google.com/docs
- React Docs: https://react.dev
- React Router: https://reactrouter.com

---

## 🎯 Performance Tips

1. **Lazy load components** for better load times
2. **Cache course data** in localStorage
3. **Optimize images** before upload
4. **Use pagination** for large course lists
5. **Enable offline mode** with Firebase offline persistence

---

**Ready to Build? Start with Phase 1 features! 🚀**
