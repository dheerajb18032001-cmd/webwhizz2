# 🔐 Firestore Security Rules - Complete Setup

## 📋 Current Rules Status

Your current rules allow:
- ✅ Anyone to create client inquiries
- ✅ Only authenticated users to read/write own data
- ⚠️ Missing: User data rules, course rules, enrollment rules

---

## 🎯 Complete Firestore Security Rules

Add these rules to Firebase Console → Firestore Database → Rules

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // USERS COLLECTION - User Profiles & Data
    // ============================================
    match /users/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth.uid == userId;
      
      // Admins can read all user profiles
      allow read: if request.auth.token.role == 'admin';
      
      // Admins can write to any user profile
      allow write: if request.auth.token.role == 'admin';
    }
    
    // ============================================
    // COURSES COLLECTION - Course Listings
    // ============================================
    match /courses/{courseId} {
      // Anyone can read published courses
      allow read: if resource.data.status == 'published';
      
      // Only instructors can read draft courses they created
      allow read: if request.auth.token.role == 'instructor' && 
                     resource.data.instructorId == request.auth.uid;
      
      // Only instructors can create courses
      allow create: if request.auth.token.role in ['instructor', 'admin'];
      
      // Instructors can edit their own courses, admins can edit any
      allow update, delete: if request.auth.token.role == 'admin' || 
                              (request.auth.token.role == 'instructor' && 
                               resource.data.instructorId == request.auth.uid);
    }
    
    // ============================================
    // ENROLLMENTS COLLECTION - Student Enrollments
    // ============================================
    match /enrollments/{enrollmentId} {
      // Students can read their own enrollments
      allow read: if request.auth.uid == resource.data.studentId;
      
      // Instructors can read enrollments for their courses
      allow read: if request.auth.token.role == 'instructor' &&
                     exists(/databases/$(database)/documents/courses/$(resource.data.courseId)) &&
                     get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId == request.auth.uid;
      
      // Admins can read all enrollments
      allow read: if request.auth.token.role == 'admin';
      
      // Authenticated users can create enrollments
      allow create: if request.auth != null &&
                      request.resource.data.studentId == request.auth.uid;
      
      // Students can update their own enrollments
      allow update: if request.auth.uid == resource.data.studentId;
      
      // Only admins can delete enrollments
      allow delete: if request.auth.token.role == 'admin';
    }
    
    // ============================================
    // CERTIFICATES COLLECTION - Course Certificates
    // ============================================
    match /certificates/{certificateId} {
      // Students can read their own certificates
      allow read: if request.auth.uid == resource.data.studentId;
      
      // Instructors can read certificates for their courses
      allow read: if request.auth.token.role == 'instructor' &&
                     exists(/databases/$(database)/documents/courses/$(resource.data.courseId)) &&
                     get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId == request.auth.uid;
      
      // Admins can read all certificates
      allow read: if request.auth.token.role == 'admin';
      
      // Only instructors and admins can create certificates
      allow create: if request.auth.token.role in ['instructor', 'admin'];
      
      // Only instructors (for their courses) and admins can update
      allow update: if request.auth.token.role == 'admin' ||
                      (request.auth.token.role == 'instructor' &&
                       exists(/databases/$(database)/documents/courses/$(resource.data.courseId)) &&
                       get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId == request.auth.uid);
      
      // Only admins can delete
      allow delete: if request.auth.token.role == 'admin';
    }
    
    // ============================================
    // CLIENT COLLECTION - Contact Inquiries
    // ============================================
    match /client/{docId} {
      // Anyone can create client inquiries
      allow create: if true;
      
      // Only authenticated admins can read
      allow read: if request.auth != null && 
                     request.auth.token.role == 'admin';
      
      // Only admins can update/delete
      allow write: if request.auth != null && 
                      request.auth.token.role == 'admin';
    }
    
    // ============================================
    // Fallback - Deny everything else
    // ============================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 📝 How to Apply These Rules

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/project/whizz-3fcf2/firestore/rules
2. Or: Firebase Console → Firestore Database → Rules tab

### Step 2: Replace Current Rules
1. **Delete** all current rules in the editor
2. **Copy** the complete rules above
3. **Paste** into the editor

### Step 3: Publish
1. Click **"Publish"** button (blue button at bottom right)
2. Wait for confirmation: **"Rules updated successfully"**

---

## 🔐 Permission Matrix

### What Each Role Can Do

#### **Student (Unauthenticated User)**
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| users | ❌ | Own only | Own only | ❌ |
| courses | ❌ | Published | ❌ | ❌ |
| enrollments | ✅ Own | Own only | Own only | ❌ |
| certificates | ❌ | Own only | ❌ | ❌ |
| client | ✅ Any | ❌ | ❌ | ❌ |

#### **Instructor (Authenticated)**
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| users | ❌ | Own only | Own only | ❌ |
| courses | ✅ | Own + Published | Own only | Own only |
| enrollments | ❌ | Their Students | ❌ | ❌ |
| certificates | ✅ | Their Courses | Their Courses | ❌ |
| client | ❌ | ❌ | ❌ | ❌ |

#### **Admin (Authenticated)**
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| users | ❌ | All | All | ❌ |
| courses | ✅ | All | All | ✅ |
| enrollments | ❌ | All | ❌ | ✅ |
| certificates | ✅ | All | All | ✅ |
| client | ❌ | All | ✅ | ✅ |

---

## ✅ User Data Connection in Firestore

### User Collection Structure

When a user signs up, this data is automatically created:

```json
{
  "uid": "userId123",
  "email": "student@example.com",
  "fullName": "John Doe",
  "role": "student",                    // "student" | "instructor" | "admin"
  "profilePicture": "https://...",
  "bio": "My bio here",
  "phone": "+1234567890",
  "createdAt": "2024-02-15T10:30:00Z",
  "updatedAt": "2024-02-15T10:30:00Z",
  "status": "active"                    // "active" | "suspended"
}
```

### How User Data Connects to Other Collections

**1. User → Courses (via instructorId)**
```json
// In courses collection:
{
  "title": "React Basics",
  "instructorId": "userId123",          // Links to users/{userId}
  "instructorName": "John Doe"
}
```

**2. User → Enrollments (via studentId)**
```json
// In enrollments collection:
{
  "studentId": "userId123",             // Links to users/{userId}
  "studentEmail": "student@example.com",
  "courseId": "courseId456"
}
```

**3. User → Certificates (via studentId)**
```json
// In certificates collection:
{
  "studentId": "userId123",             // Links to users/{userId}
  "studentName": "John Doe",
  "courseId": "courseId456"
}
```

---

## 🎯 Testing the Rules

### Test 1: Student Reading Own Profile
**Expected:** ✅ Success
```
Document: users/{studentUserId}
User: Logged in as that student
```

### Test 2: Student Reading Another User's Profile
**Expected:** ❌ Permission Denied
```
Document: users/{otherStudentId}
User: Logged in as different student
```

### Test 3: Anyone Viewing Published Courses
**Expected:** ✅ Success (No auth needed)
```
Document: courses/{courseId}
Condition: course.status == "published"
```

### Test 4: Creating Client Inquiry
**Expected:** ✅ Success (No auth needed)
```
Collection: client
Action: create
```

### Test 5: Instructor Creating Course
**Expected:** ✅ Success (with instructor role)
```
Collection: courses
Action: create
User: Logged in with instructor role
```

### Test 6: Admin Deleting Course
**Expected:** ✅ Success (with admin role)
```
Collection: courses
Action: delete
User: Logged in with admin role
```

---

## 🚨 Common Issues & Fixes

### Issue: "Permission denied" when reading own user profile
**Solution:**
1. Make sure you're logged in (authenticated)
2. Make sure you're reading your own document: `/users/{yourUserId}`
3. Check that token has correct `uid`

### Issue: "Permission denied" when creating course as instructor
**Solution:**
1. Make sure your token has `role: 'instructor'`
2. Make sure you're authenticated (token is valid)
3. Backend must set custom claims during signup

### Issue: Students can't see published courses
**Solution:**
1. Make sure course document has `status: "published"`
2. Check capitalization and exact value
3. Republish rules after fixing

### Issue: Enrollments not working
**Solution:**
1. Make sure `studentId` matches authenticated user's `uid`
2. Make sure course exists before enrolling
3. Check that enrollment document has all required fields

---

## 📊 Firestore Collection Dependency Map

```
users (Root)
├── uid (Primary Key)
└── Connected to:
    ├── courses (via instructorId)
    ├── enrollments (via studentId)
    └── certificates (via studentId)

courses
├── courseId (Primary Key)
├── instructorId → users
└── Connected to:
    ├── enrollments (via courseId)
    └── certificates (via courseId)

enrollments
├── enrollmentId (Primary Key)
├── studentId → users
├── courseId → courses
└── Connected to:
    └── certificates (one per completion)

certificates
├── certificateId (Primary Key)
├── studentId → users
└── courseId → courses

client
├── docId (Primary Key)
└── Independent (lead tracking)
```

---

## ✨ Best Practices

1. **User Authentication:**
   - Always authenticate users before accessing personal data
   - Use `request.auth.uid` for user verification

2. **Role-Based Access:**
   - Use `request.auth.token.role` for role checking
   - Set custom claims during signup

3. **Data Validation:**
   - Validate all user inputs server-side
   - Check document exists before referencing

4. **Audit Trail:**
   - Track updates with timestamps
   - Use `request.time` for server timestamps

5. **Least Privilege:**
   - Only grant necessary permissions
   - Deny by default at the end

---

## 🔍 Verify Rules Are Applied

After publishing, test each collection in Firestore:

1. ✅ Create test client document (no auth needed)
2. ✅ Read your own user document (auth needed, your uid)
3. ✅ Read published course (no auth needed)
4. ✅ Try to read another user's document (should fail)
5. ✅ Create enrollment (auth needed)

All tests should match expectations above!
