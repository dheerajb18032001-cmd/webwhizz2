# Whizz - Online Course Platform

A comprehensive online course platform built with React and Firebase, offering courses in Web Development, Data Science, AI/ML, Cybersecurity, and more.

## 🎯 Features

### For Students
- ✅ Browse and search courses by category
- ✅ User account with email/password authentication
- ✅ Enroll in courses
- ✅ Track learning progress
- ✅ Earn certificates upon completion
- ✅ Personal learning dashboard

### For Instructors
- ✅ Create and publish courses
- ✅ Add course content, description, duration, and pricing
- ✅ View enrolled students
- ✅ Manage course details
- ✅ Track course performance

### For Admins
- ✅ Manage all users (instructors, students, admins)
- ✅ Oversee all courses on the platform
- ✅ Analytics and statistics dashboard
- ✅ Course approval system
- ✅ User management and deletion

## 📚 Course Categories

1. **Web Development** - Frontend, Backend, Full Stack
2. **Data Science & Analytics** - Data analysis, visualization
3. **Application Development** - Mobile, Desktop, Cross-platform
4. **Cyber Security** - Network security, ethical hacking
5. **AI/ML** - Machine Learning, Deep Learning, NLP
6. **Business Management** - HR, Finance, Marketing, Digital Marketing
7. **Other Courses**

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Routing**: React Router v6
- **Backend**: Firebase
- **Authentication**: Firebase Auth (Email/Password)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting / Vercel

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Setup Steps

1. **Clone the repository**
```bash
cd whizz
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** with Firebase configuration:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Start the development server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔐 Test Credentials

```
Admin Account:
Email: admin@whizz.com
Password: Admin@123

Student Account:
Email: student@whizz.com
Password: Student@123
```

## 📁 Project Structure

```
whizz/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── CourseList.js
│   │   ├── CourseList.css
│   │   ├── ProtectedRoute.js
│   │   └── ProtectedRoute.css
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Auth.css
│   │   ├── StudentDashboard.js
│   │   ├── StudentDashboard.css
│   │   ├── InstructorDashboard.js
│   │   ├── InstructorDashboard.css
│   │   ├── AdminDashboard.js
│   │   └── AdminDashboard.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── .env
└── README.md
```

## 🚀 Deployment

### Deploy to Firebase
```bash
npm run build
firebase deploy
```

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

## 📖 User Roles & Permissions

| Action | Student | Instructor | Admin |
|--------|---------|-----------|-------|
| Browse Courses | ✅ | ✅ | ✅ |
| Enroll in Course | ✅ | ❌ | ❌ |
| Create Course | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ |
| Delete Courses | ❌ | ✅ | ✅ |

## 🎨 Design Highlights

- **Modern UI**: Gradient backgrounds and smooth transitions
- **Responsive Design**: Mobile-friendly interface
- **User-Friendly**: Intuitive navigation and clear CTAs
- **Accessibility**: Semantic HTML and proper contrast ratios

## 📝 Firebase Database Schema

### Users Collection
```javascript
{
  uid: "user_id",
  email: "user@example.com",
  name: "User Name",
  role: "student|instructor|admin",
  createdAt: Timestamp,
  enrolledCourses: [],
  certificates: []
}
```

### Courses Collection
```javascript
{
  title: "Course Title",
  description: "Course Description",
  category: "Web Development",
  instructorId: "instructor_uid",
  instructor: "Instructor Email",
  duration: 40,
  price: 999,
  image: "image_url",
  status: "draft|published",
  students: [],
  createdAt: Timestamp
}
```

### Enrollments Collection
```javascript
{
  studentId: "student_uid",
  courseId: "course_id",
  progress: 45,
  enrolledAt: Timestamp,
  completedAt: null
}
```

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the MIT License.

## 📧 support

For support or questions, please contact: support@whizz.com

---

**Happy Learning! 🚀**
