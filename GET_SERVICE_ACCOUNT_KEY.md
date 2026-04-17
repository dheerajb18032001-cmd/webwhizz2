# 🔐 How to Get Firebase Service Account Key

## 📍 Quick Link
**Direct link:** https://console.firebase.google.com/project/whizz-3fcf2/settings/serviceaccounts/adminsdk

## 📖 Step-by-Step Instructions

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com
2. Select project: **whizz-3fcf2**
3. Click ⚙️ **Settings** (gear icon) in sidebar
4. Click **Service Accounts** tab

### Step 2: Generate Private Key
1. Click blue button: **"Generate New Private Key"**
2. A popup appears: "Are you sure?"
3. Click **"Generate Key"** to confirm
4. Your browser downloads: `whizz-3fcf2-xxxxx.json`

### Step 3: Place the File
Rename and move the file to:
```
c:\whizz\src\firebase\serviceAccountKey.json
```

### Step 4: Verify It's Valid JSON
1. Open the file in VS Code
2. Should look like this (truncated):
```json
{
  "type": "service_account",
  "project_id": "whizz-3fcf2",
  "private_key_id": "abcd1234...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...",
  "client_email": "firebase-adminsdk-xxxxx@whizz-3fcf2.iam.gserviceaccount.com",
  ...
}
```

### Step 5: Restart Backend
```bash
cd c:\whizz\backend
npm start
```

### Step 6: Check Logs
You should see:
```
✅ Firebase Admin: Loaded service account from serviceAccountKey.json
✅ Firebase Admin SDK initialized with credentials
✅ Firestore connection verified
```

---

## ✅ Verify It Works

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"Backend is running! ✅","timestamp":"..."}`

### Test 2: Get Courses
```bash
curl http://localhost:5000/api/courses
```
Expected: Returns course list from Firestore

### Test 3: Enroll (with auth token)
In browser:
1. Sign up or login
2. Click "Enroll" on a course
3. Should work now! ✅

---

## 🔒 Security Checklist

- [ ] File is at `src/firebase/serviceAccountKey.json`
- [ ] File is in `.gitignore` (already configured)
- [ ] File is NOT committed to git
- [ ] Backend logs show "✅ Loaded service account"
- [ ] Firestore rules are updated (see [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md))

---

## 🚨 If Something Goes Wrong

### Issue: "Could not load Firebase service account"
**Solution:** 
- Verify file exists: `c:\whizz\src\firebase\serviceAccountKey.json`
- Verify it's valid JSON (no trailing commas)
- Restart backend

### Issue: "permission denied" on Firestore
**Solution:**
- Update Firestore Security Rules: [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md)
- Service account should have full access

### Issue: Still getting 500 errors on enrollment
**Solution:**
1. Check backend logs for specific error message
2. Verify Firestore is accessible:
   ```bash
   curl -X GET http://localhost:5000/api/courses
   ```
3. Make sure security rules allow enrollments collection

---

## 📝 Alternative: Use Environment Variable

Instead of a file, you can set an environment variable:

**In `backend/.env`:**
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"whizz-3fcf2","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@whizz-3fcf2.iam.gserviceaccount.com"}
```

This is better for production/deployment to cloud servers.

---

## 🔄 Regenerate Key (if compromised)

If you accidentally commit this file or share it:

1. Go to Firebase Console → Service Accounts
2. Find the key and click ⋯ (three dots)
3. Click **"Delete"**
4. Generate a **new key** with same steps above
5. Update your code with new key
6. Old key will no longer work ✅
