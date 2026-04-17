# Firebase Service Account Setup for Backend

## 📋 Step 1: Generate Service Account Key

1. Go to Firebase Console: https://console.firebase.google.com/project/whizz-3fcf2/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"** button
3. A JSON file will download - this is your `serviceAccountKey.json`

## 📁 Step 2: Place the Key File

**Option A: Local Development (Recommended for now)**
```
c:\whizz\src\firebase\serviceAccountKey.json
```

Place the downloaded JSON file here.

**Option B: Environment Variable (Production)**
Set in `backend/.env`:
```
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"whizz-3fcf2",...}'
```

## 🔧 Step 3: Verify Configuration

The backend will automatically:
1. ✅ Look for `/src/firebase/serviceAccountKey.json` 
2. ✅ Fall back to `FIREBASE_SERVICE_ACCOUNT` env var
3. ✅ Use default credentials if neither exists (development mode)

## 🚀 Step 4: Restart Backend

```bash
cd c:\whizz\backend
npm start
```

You should see:
- ✅ `✅ Firebase Admin initialized with credentials` (if key found)
- ⚠️ `Using default credentials` (if no key found - still works!)

## 📝 What the Service Account Key Contains

```json
{
  "type": "service_account",
  "project_id": "whizz-3fcf2",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----...",
  "client_email": "firebase-adminsdk-xxxxx@whizz-3fcf2.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## ⚠️ Security Notes

- 🔐 **NEVER commit** `serviceAccountKey.json` to git
- 🔐 **NEVER share** this file publicly
- 🔐 Keep it in `.gitignore` (already configured)
- ✅ Use environment variables in production

## 🔍 Troubleshooting

### Backend still shows "Using default credentials..."
- Verify the file is at: `c:\whizz\src\firebase\serviceAccountKey.json`
- Restart the backend: `npm start`
- Check file is valid JSON: open in VS Code

### Permission denied errors
- Update Firestore Security Rules: [FIRESTORE_SECURITY_RULES.md](FIRESTORE_SECURITY_RULES.md)
- Service account has superuser access by default

### Still getting 500 errors on enrollment
1. Verify backend can read Firestore (health check works)
2. Check browser console for specific errors
3. Review backend logs for error details
