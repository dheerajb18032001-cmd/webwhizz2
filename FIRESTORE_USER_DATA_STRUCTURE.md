# Firestore User Data Structure & Connections

## 📊 Complete User Data Model

### Users Collection (`/users/{uid}`)

When a user signs up, a complete user document is created with the following structure:

```json
{
  "uid": "firebase-auth-uid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "student",
  "profilePicture": null,
  "bio": "",
  "phone": "",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "enrolledCourses": [],
  "completedCourses": []
}
```

### Data Relationships Map

```
┌─────────────────────────────────────────────────────────────┐
│                   FIRESTORE DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /users/{uid}                                               │
│  ├─ Stores user identity (email, name, role)               │
│  ├─ LINKS TO: /enrollments via uid (studentId)            │
│  └─ LINKS TO: /courses via uid (instructorId when role=    │
│                                                │             │
│  /courses/{courseId}                           │             │
│  ├─ Stores course details (title, desc, etc)  │             │
│  ├─ instructorId: links to /users/{uid}       │             │
│  └─ LINKS TO: /enrollments  ──────────────────┘             │
│                                                              │
│  /enrollments/{enrollmentId}                                │
│  ├─ studentId: links to /users/{uid}                        │
│  ├─ courseId: links to /courses/{courseId}                  │
│  └─ LINKS TO: /certificates when completed                 │
│                                                              │
│  /certificates/{certId}                                     │
│  ├─ studentId: links to /users/{uid}                        │
│  ├─ courseId: links to /courses/{courseId}                  │
│  └─ enrollmentId: links to /enrollments/{id}                │
│                                                              │
│  /client/{docId}                                            │
│  ├─ Public data accessible by authenticated users           │
│  └─ Limited by Firestore security rules                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Foreign Key Relationships

### Student → Courses (via Enrollment)

```
User (Student)
  uid: "user123"
  email: "student@whizz.com"
         │
         └──> Enrollment
              studentId: "user123"  ← Links back to user
              courseId: "course456"
                       └──> Course
                            courseId: "course456"
                            title: "React Basics"
                            instructorId: "inst789"
```

### Instructor → Courses Created

```
User (Instructor)
  uid: "inst789"
  role: "instructor"
         │
         └──> Courses Collection
              Filter: instructorId == "inst789"
              Documents returned:
                - courseId: "course456"
                - courseId: "course789"
                - courseId: "course999"
```

### Admin → All Data

```
User (Admin)
  uid: "admin111"
  role: "admin"
         │
         ├──> Users (read all)
         ├──> Courses (read/write all)
         ├──> Enrollments (read/write all)
         ├──> Certificates (read/write all)
         └──> Client (read/write all)
```

## 📝 Field Documentation

### Users Collection Fields

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `uid` | string | Firebase Auth ID (primary key) | `"RkQv2mN3pQr..."` |
| `email` | string | User email address | `"student@whizz.com"` |
| `fullName` | string | User's full name | `"John Doe"` |
| `role` | string | User role (student/instructor/admin) | `"student"` |
| `profilePicture` | string or null | URL to profile image | `"https://..."` or `null` |
| `bio` | string | User biography | `"Passionate learner..."` |
| `phone` | string | Contact phone number | `"+1-555-1234"` |
| `status` | string | Account status (active/inactive/suspended) | `"active"` |
| `createdAt` | timestamp | Account creation date | `Timestamp` |
| `updatedAt` | timestamp | Last profile update | `Timestamp` |
| `enrolledCourses` | array | Array of courseIds (cached) | `["course1", "course2"]` |
| `completedCourses` | array | Array of completed courseIds | `["course1"]` |

### Courses Collection Fields (with user connection)

| Field | Type | Links To | Purpose |
|-------|------|----------|---------|
| `courseId` | string | (primary key) | Unique course identifier |
| `title` | string | | Course name |
| `description` | string | | Course description |
| `instructorId` | string | `/users/{uid}` | **USER LINK** - Who created course |
| `category` | string | | Course category |
| `level` | string | | Difficulty (beginner/intermediate/advanced) |
| `thumbnail` | string | | Course image URL |
| `createdAt` | timestamp | | Course creation date |
| `updatedAt` | timestamp | | Last update date |

### Enrollments Collection Fields (with user connections)

| Field | Type | Links To | Purpose |
|-------|------|----------|---------|
| `enrollmentId` | string | (primary key) | Unique enrollment identifier |
| `studentId` | string | `/users/{uid}` | **USER LINK** - Which student |
| `courseId` | string | `/courses/{id}` | **COURSE LINK** - Which course |
| `enrolledDate` | timestamp | | When student enrolled |
| `completedDate` | timestamp | | When student completed (or null) |
| `status` | string | | Status (active/completed/dropped) |
| `progress` | number | | Completion percentage (0-100) |
| `lastAccessedAt` | timestamp | | Last login date |

### Certificates Collection Fields (with user connections)

| Field | Type | Links To | Purpose |
|-------|------|----------|---------|
| `certId` | string | (primary key) | Unique certificate ID |
| `studentId` | string | `/users/{uid}` | **USER LINK** - Who earned it |
| `courseId` | string | `/courses/{id}` | **COURSE LINK** - For which course |
| `enrollmentId` | string | `/enrollments/{id}` | **ENROLLMENT LINK** - Associated enrollment |
| `issuedDate` | timestamp | | When certificate issued |
| `expiryDate` | timestamp | | When certificate expires (or null) |
| `certificateUrl` | string | | PDF or image URL |

## 🔐 Security Rules with User Data Connections

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ✅ USERS - User data connections
    match /users/{userId} {
      allow read: if 
        request.auth != null && (
          request.auth.uid == userId ||  // User reads own profile
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
      
      allow write: if 
        request.auth != null &&
        request.auth.uid == userId;  // Users edit own profile
      
      allow create: if request.auth != null;
    }
    
    // ✅ COURSES - Links to instructor via instructorId
    match /courses/{courseId} {
      allow read: if 
        resource.data.published == true || 
        (request.auth != null && request.auth.uid == resource.data.instructorId);
      
      allow write: if 
        request.auth != null && (
          request.auth.uid == resource.data.instructorId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
      
      allow delete: if 
        request.auth != null && (
          request.auth.uid == resource.data.instructorId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
    }
    
    // ✅ ENROLLMENTS - Links students and courses
    match /enrollments/{enrollmentId} {
      allow read: if 
        request.auth != null && (
          request.auth.uid == resource.data.studentId ||  // Student reads own enrollment
          request.auth.uid == get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId ||  // Instructor reads their course enrollments
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
      
      allow write: if 
        request.auth != null && (
          request.auth.uid == resource.data.studentId ||
          request.auth.uid == get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
      
      allow create: if 
        request.auth != null &&
        request.auth.uid == request.resource.data.studentId;
    }
    
    // ✅ CERTIFICATES - Links to student and course
    match /certificates/{certId} {
      allow read: if 
        request.auth != null && (
          request.auth.uid == resource.data.studentId ||
          request.auth.uid == get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId ||
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
      
      allow write: if 
        request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // ✅ CLIENT - For future use
    match /client/{docId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth != null;
    }
    
    // ❌ DENY EVERYTHING ELSE
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔄 Query Examples Using User Data Connections

### Frontend: Get Current User's Data

```javascript
// enrollmentService.js
export const getCurrentUser = async (uid) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};
```

### Frontend: Get Student's Enrollments (via studentId link)

```javascript
// enrollmentService.js
export const getStudentEnrollments = async (studentId) => {
  try {
    const enrollments = await db
      .collection('enrollments')
      .where('studentId', '==', studentId)  // ← USER CONNECTION
      .where('status', '==', 'active')
      .get();
    
    return enrollments.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return [];
  }
};
```

### Frontend: Get Instructor's Courses (via instructorId link)

```javascript
// Backend should do this for better security
export const getInstructorCourses = async (instructorId) => {
  try {
    const courses = await db
      .collection('courses')
      .where('instructorId', '==', instructorId)  // ← USER CONNECTION
      .get();
    
    return courses.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};
```

### Backend: Get Student's Complete Profile with Enrollments (via uid)

```javascript
// backend/routes/users.js
router.get('/:uid', verifyToken, async (req, res) => {
  try {
    const { uid } = req.params;
    
    // ✅ Get user from /users/{uid}
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = { uid: userDoc.id, ...userDoc.data() };
    
    // ✅ Get all enrollments where studentId == uid
    const enrollmentsSnapshot = await db
      .collection('enrollments')
      .where('studentId', '==', uid)  // ← CONNECTION THROUGH USER ID
      .get();
    
    userData.enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Backend: Get Students Enrolled in a Course (instructor context)

```javascript
// backend/routes/enrollments.js
router.get('/course/:courseId', verifyInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // ✅ Get course to verify instructor
    const course = await db.collection('courses').doc(courseId).get();
    if (course.data().instructorId !== req.user.uid) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // ✅ Get all enrollments for this course
    const enrollments = await db
      .collection('enrollments')
      .where('courseId', '==', courseId)
      .get();
    
    // ✅ Fetch student data for each enrollment
    const enrollmentData = [];
    for (const enrollmentDoc of enrollments.docs) {
      const enrollment = enrollmentDoc.data();
      const student = await db.collection('users').doc(enrollment.studentId).get();
      
      enrollmentData.push({
        enrollmentId: enrollmentDoc.id,
        ...enrollment,
        studentName: student.data().fullName,
        studentEmail: student.data().email
      });
    }
    
    res.json({ success: true, data: enrollmentData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## ✅ Verification Checklist

After implementing user data connections, verify:

- [ ] User document created with all fields on signup
- [ ] `uid` field matches Firebase Auth UID
- [ ] Enrollments have correct `studentId` linking to user
- [ ] Courses have correct `instructorId` linking to user
- [ ] Certificates have `studentId` linking to user
- [ ] Firestore security rules applied and rules validate connections
- [ ] Backend routes check user role via `/users/{uid}.role` field
- [ ] Student dashboard queries enrollments with `studentId` filter
- [ ] Instructor dashboard queries courses with `instructorId` filter
- [ ] Admin dashboard can read all collections

## 🚀 Key Highlights

✅ **User Data Connections:**
- All users stored in `/users/{uid}` with uid as primary key
- Enrollments link to students via `studentId` field
- Courses link to instructors via `instructorId` field
- Certificates link to students via `studentId` field

✅ **Role-Based Queries:**
- Students: Read enrollments where `studentId == uid`
- Instructors: Read courses where `instructorId == uid` and "Read enrollments for their courses
- Admins: Read everything

✅ **Security:**
- Firestore rules validate all user data connections
- Users can only access their own data unless admin
- Cross-collection references enforced at database level
