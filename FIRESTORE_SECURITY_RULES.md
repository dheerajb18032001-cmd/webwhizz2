# Fix Firebase Firestore Permission Errors

## Problem
Getting "Missing or insufficient permissions" error when accessing Firestore or backend API.

## Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console  
1. Visit: https://console.firebase.google.com/project/whizz-3fcf2/firestore/rules
2. Or: Firebase Console → Firestore Database → Rules

### Step 2: Copy These Rules

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - own data or admins
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.admin == true;
    }
    
    // Courses - Public read, admin/instructor write
    match /courses/{courseId} {
      allow read: if true;  // Anyone can read courses
      allow write: if request.auth.token.admin == true || request.auth.token.instructor == true;
    }
    
    // Enrollments - Users can manage their own
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.studentId || request.auth.token.admin == true;
    }
    
    // Client messages
    match /client/{clientId} {
      allow create: if true;
      allow read: if request.auth.token.admin == true;
      allow delete: if request.auth.token.admin == true;
    }
    
    // Certificates
    match /certificates/{certificateId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.token.admin == true;
    }
    
    // Fallback - Authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Click "Publish"
The rules will update immediately. Refresh your app and test.

### Step 4: Enable Required APIs

Make sure these are enabled in Google Cloud Console:
1. **Identity Toolkit API** - For authentication
2. **Firestore API** - For database access

To enable:
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Identity Toolkit"
3. Click **Enable**
4. Do the same for "Firestore API"

## Backend Requirements

The backend needs a service account key file. Currently using:
- Approach 1: Service account JSON file in `src/firebase/serviceAccountKey.json`  
- Approach 2: Environment variable `FIREBASE_SERVICE_ACCOUNT` with JSON string
- Approach 3: Google Cloud default credentials

## If Issues Persist

Try the **temporary test mode** (development only):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ⚠️ INSECURE - Development only!
    }
  }
}
```

Then test your app and debug the specific permission issues. Once working, update to the production rules above.
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
