# 👥 User Roles & Collection Structures

## 📋 User Roles

### 1. **Student Role**
- Can view courses
- Can enroll in courses
- Can track progress
- Can view certificates (when completed)
- **Permissions:**
  - Read: `courses`, `enrollments` (own only)
  - Write: `enrollments` (own only)
  - Read: `certificates` (own only)

### 2. **Instructor Role**
- Can create courses
- Can edit own courses
- Can view student enrollments in own courses
- Can grade assignments
- **Permissions:**
  - Read/Write: `courses` (own only)
  - Read: `enrollments` (filter by courseId)
  - Read: `users` (enrolled students only)

### 3. **Admin Role**
- Full access to all data
- Can manage users
- Can manage courses
- Can view all statistics
- **Permissions:**
  - Read/Write/Delete: All collections

### 4. **Guest Role** (Unauthenticated)
- Can view courses only
- Cannot enroll or access private data
- **Permissions:**
  - Read: `courses` only

---

## 📁 Firestore Collections & Structure

### 1. **users** Collection

```json
{
  "userId": {
    "email": "student@example.com",
    "fullName": "John Doe",
    "role": "student",          // "student" | "instructor" | "admin"
    "profilePicture": "url",
    "bio": "Software developer",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "enrolledCourses": ["courseId1", "courseId2"],
    "completedCourses": ["courseId3"],
    "status": "active"          // "active" | "suspended" | "deleted"
  }
}
```

**Indexes:**
- `role` (for filtering by role)
- `status` (for filtering active users)
- `createdAt` (for sorting)

---

### 2. **courses** Collection

```json
{
  "courseId": {
    "title": "React Fundamentals",
    "description": "Learn React from basics to advanced",
    "category": "Web Development",
    "instructorId": "instructorUserId",
    "instructorName": "Jane Smith",
    "price": 99.99,
    "duration": 40,             // hours
    "level": "beginner",        // "beginner" | "intermediate" | "advanced"
    "image": "thumbnail-url",
    "students": ["studentId1", "studentId2"],
    "studentCount": 150,
    "rating": 4.8,
    "reviews": 45,
    "status": "published",      // "draft" | "published" | "archived"
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-02-15T10:30:00Z",
    "tags": ["react", "javascript", "web"]
  }
}
```

**Indexes:**
- `category` (for filtering)
- `level` (for filtering by difficulty)
- `status` (published only)
- `instructorId` (for instructor's courses)

---

### 3. **enrollments** Collection

```json
{
  "enrollmentId": {
    "studentId": "userIdOfStudent",
    "studentEmail": "student@example.com",
    "courseId": "courseIdOfCourse",
    "courseName": "React Fundamentals",
    "progress": 45,             // 0-100 percentage
    "status": "active",         // "active" | "completed" | "dropped"
    "enrolledAt": "2024-01-15T10:30:00Z",
    "completedAt": null,
    "certificateIssued": false,
    "certificateId": null,
    "lastAccessedAt": "2024-02-15T15:45:00Z",
    "completionDate": null
  }
}
```

**Indexes:**
- `studentId` (for user's enrollments)
- `courseId` (for course's students)
- `status` (for filtering active/completed)

---

### 4. **certificates** Collection

```json
{
  "certificateId": {
    "studentId": "userIdOfStudent",
    "studentName": "John Doe",
    "courseId": "courseIdOfCourse",
    "courseName": "React Fundamentals",
    "issuedAt": "2024-02-15T10:30:00Z",
    "certificateUrl": "pdf-or-image-url",
    "status": "issued"          // "issued" | "revoked"
  }
}
```

---

### 5. **client** Collection

```json
{
  "clientId": {
    "full_name": "dheeraj",
    "course": "AI Fundamentals",
    "email": "test@example.com",
    "status": "enrolled",       // "inquiry" | "enrolled" | "completed"
    "message": "Client inquiry message",
    "submittedAt": "2024-02-15T10:30:00Z"
  }
}
```

**Use Case:** Collect inquiries/feedback from website visitors

---

## 🔐 Firestore Security Rules

### For Development (Testing)
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### For Production
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Students can read/write own user document
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Anyone can read published courses
    match /courses/{courseId} {
      allow read: if resource.data.status == "published";
      allow write: if request.auth.token.role in ["admin", "instructor"];
    }
    
    // Students can enroll
    match /enrollments/{enrollmentId} {
      allow read: if request.auth.uid == resource.data.studentId || 
                     request.auth.token.role in ["admin", "instructor"];
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.studentId || 
                               request.auth.token.role == "admin";
    }
    
    // Certificates
    match /certificates/{certificateId} {
      allow read: if request.auth.uid == resource.data.studentId || 
                     request.auth.token.role == "admin";
      allow write: if request.auth.token.role in ["admin", "instructor"];
    }
    
    // Client inquiries
    match /client/{clientId} {
      allow create: if true;
      allow read, write: if request.auth.token.role == "admin";
    }
  }
}
```

---

## 🔄 User Role Assignment

### During Sign Up
1. **Student** (default) - Anyone who signs up
2. **Instructor** - Request form or admin assignment
3. **Admin** - Manual assignment only by existing admin

### Custom Claims (Firebase Auth)
Backend can set custom claims:
```javascript
admin.auth().setCustomUserClaims(uid, { role: 'instructor' })
  .then(() => {
    console.log('✅ Instructor role assigned');
  });
```

---

## 📊 Sample Data Structure

### Student User
```json
{
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "student",
  "profilePicture": "https://...",
  "enrolledCourses": ["react-101", "nodejs-201"],
  "status": "active"
}
```

### Instructor User
```json
{
  "email": "jane@example.com",
  "fullName": "Jane Smith",
  "role": "instructor",
  "bio": "Senior React Developer",
  "courses": ["react-101", "react-advanced"],
  "status": "active"
}
```

### Admin User
```json
{
  "email": "admin@example.com",
  "fullName": "Admin User",
  "role": "admin",
  "status": "active"
}
```

---

## ✅ Quick Reference: Who Can Do What?

| Action | Student | Instructor | Admin | Guest |
|--------|---------|-----------|-------|-------|
| View Courses | ✅ | ✅ | ✅ | ✅ |
| Enroll | ✅ | ✅ | ✅ | ❌ |
| Create Course | ❌ | ✅ | ✅ | ❌ |
| Edit Own Course | ❌ | ✅ | ✅ | ❌ |
| Delete Course | ❌ | ❌ | ✅ | ❌ |
| View Progress | ✅ Own | ✅ Their Students | ✅ All | ❌ |
| Manage Users | ❌ | ❌ | ✅ | ❌ |
| Issue Certificate | ❌ | ✅ | ✅ | ❌ |
