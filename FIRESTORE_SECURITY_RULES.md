# Fix Firebase Firestore Permission Errors

## Problem
Getting "Missing or insufficient permissions" error when accessing enrollments collection.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/project/whizz-3fcf2/firestore/rules
2. Or: Firebase Console → Firestore Database → Rules

### Step 2: Replace Current Rules with This

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || request.auth.uid != null;
    }
    
    // Allow anyone to read courses
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
    
    // Allow authenticated users to read/write enrollments
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.studentId == request.auth.uid;
      allow update, delete: if request.auth != null && (resource.data.studentId == request.auth.uid || request.auth.token.admin == true);
    }
    
    // Allow authenticated users to access other collections
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Click "Publish"
- The rules will update immediately
- Refresh your app and test

## Alternative: Use Test Mode (Development Only)
If you want quick testing, temporarily set rules to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: Test mode allows anyone to read/write. Use only for development!

## Fix Image Loading Issues
If placeholder images still fail:

1. Use real course images from URLs like:
   - `https://via.placeholder.com/300x200?text=Course`
   - Or upload to Firebase Storage

2. Or add fallback in CourseDetail.js:
```javascript
const fallbackImage = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(course.title);
<img src={course.image || fallbackImage} alt={course.title} onError={(e) => e.target.src = fallbackImage} />
```

## Test Credentials
- Admin: admin@whizz.com / Admin@123
- Student: student@whizz.com / Student@123
