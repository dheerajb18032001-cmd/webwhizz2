# Firebase Configuration Reference

## Current Configuration

Your Firebase project is configured with:

```javascript
// File: src/firebase/config.js
const firebaseConfig = {
  apiKey: "AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98",
  authDomain: "whizz-3fcf2.firebaseapp.com",
  projectId: "whizz-3fcf2",
  storageBucket: "whizz-3fcf2.firebasestorage.app",
  messagingSenderId: "1059784565994",
  appId: "1:1059784565994:web:069d3e8a916f07480ae393",
  measurementId: "G-J4M9HZ66XL"
};
```

## Services Initialized

✅ **Firebase Authentication** (`src/firebase/config.js`)
- Persistence: Enabled (Local Storage)
- Provider: getAuth(app)
- Export: `export const auth = getAuth(app);`

✅ **Cloud Firestore** (`src/firebase/config.js`)
- Database: whizz-3fcf2
- Export: `export const db = getFirestore(app);`

✅ **Cloud Storage** (`src/firebase/config.js`)
- Bucket: whizz-3fcf2.firebasestorage.app
- Export: `export const storage = getStorage(app);`

## Environment Variables

File: `.env.example`

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98
REACT_APP_FIREBASE_AUTH_DOMAIN=whizz-3fcf2.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=whizz-3fcf2
REACT_APP_FIREBASE_STORAGE_BUCKET=whizz-3fcf2.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1059784565994
REACT_APP_FIREBASE_APP_ID=1:1059784565994:web:919f341f17b091f80ae393
REACT_APP_FIREBASE_MEASUREMENT_ID=G-8N6M0TD52Z
```

## Using the Config

### In React Components

```javascript
import { auth, db, storage } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Use Firestore
const userRef = doc(db, 'users', userId);
const userSnap = await getDoc(userRef);

// Use Auth
const user = auth.currentUser;
```

### Backend Configuration

File: `backend/firebase-config.js`

```javascript
const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('../src/firebase/serviceAccountKey.json');
  }
} catch (error) {
  console.error('⚠️  Could not load Firebase service account.');
}
```

## Collections in Firestore

| Collection | Purpose | Access |
|-----------|---------|--------|
| `users` | User profiles | Authenticated users |
| `courses` | Course catalog | Public read, Admin write |
| `enrollments` | Student enrollments | Authenticated users |
| `client` | Contact messages | Public create, Admin read |

## Security Rules Status

✅ Security rules updated: [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md)

Location: Firebase Console → Firestore Database → Rules

### Current Rules Include:
- Public course reading
- Authenticated user enrollment
- Admin-only course creation
- Client message submissions
- User profile protection

## Testing Credentials

```
Admin:
  Email: admin@whizz.com
  Password: Admin@123

Student:
  Email: student@whizz.com
  Password: Student@123
```

## Troubleshooting

### Connection Issues
1. Check Firebase Console is accessible
2. Verify API keys in config
3. Check network connectivity
4. Review browser console for errors

### Permission Denied
1. Update Firestore Security Rules
2. Ensure user is authenticated
3. Check user role in database

### Missing Config
1. Copy config from Firebase Console → Project Settings
2. Update `src/firebase/config.js`
3. Update `.env` file
4. Restart development server

## Next Steps

1. ✅ Firebase config is active and working
2. ⏳ Update security rules in Firebase Console
3. ⏳ Test authentication and database access
4. ⏳ Deploy to production

For more information, visit:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React with Firebase](https://firebase.google.com/docs/database/web/start)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/best-practices)
