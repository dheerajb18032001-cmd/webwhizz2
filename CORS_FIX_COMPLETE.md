# ✅ CORS & Environment Fix

## Problem Solved

**Error:** `Access to fetch blocked by CORS policy: No 'Access-Control-Allow-Origin' header`

**Root Cause:** 
- Frontend deployed to: `https://whizz-3fcf2.web.app`
- Backend at: `http://localhost:5000`
- Backend CORS didn't allow whizz-3fcf2.web.app domain

---

## ✅ What Was Fixed

### 1. Backend CORS Configuration
**File:** [backend/server.js](backend/server.js)

Added Firebase hosting domains to CORS allowed origins:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://whizz-3fcf2.web.app',           // ✅ Added
    'https://whizz-3fcf2.firebaseapp.com',   // ✅ Added
    // ... other origins
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 2. Backend Environment
**File:** [backend/.env](backend/.env)

Updated to accept Firebase domains:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3002,https://whizz-3fcf2.web.app,https://whizz-3fcf2.firebaseapp.com
FIREBASE_PROJECT_ID=whizz-3fcf2
```

### 3. Frontend Environment
**File:** [.env](.env)

Updated Firebase config to use correct project (whizz-3fcf2):
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_PROJECT_ID=whizz-3fcf2
REACT_APP_FIREBASE_AUTH_DOMAIN=whizz-3fcf2.firebaseapp.com
REACT_APP_FIREBASE_APP_ID=1:1059784565994:web:069d3e8a916f07480ae393
```

---

## 🚀 Next Steps

### Step 1: Restart Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Server running on port 5000
✅ Firebase initialized
```

### Step 2: Clear Browser Cache & Cookies

1. Open Developer Tools (F12)
2. Application → Clear site data
3. Or use Incognito/Private window

### Step 3: Test Deployment Again

**Open:** https://whizz-3fcf2.web.app

Try:
1. Sign up: `test@whizz.com` / `Test@1234`
2. Should see: ✅ Signup successful
3. Should redirect to Student Dashboard

### Step 4: Check Console for Errors

If still getting errors:
1. Open DevTools (F12)
2. Check Console tab
3. Look for CORS or network errors
4. Should now show successful requests to `http://localhost:5000/api`

---

## 🔧 Environment Configuration Guide

### **Local Development** (http://localhost:3002)

Use `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_PROJECT_ID=whizz-3fcf2
```

Backend `.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:3002,http://127.0.0.1:3002
```

This allows:
- Frontend at localhost:3002 → Backend at localhost:5000 ✅

---

### **Production Deployment** (https://whizz-3fcf2.web.app)

**Two Options:**

#### Option A: Backend Also Deployed
If backend is deployed to a public URL (e.g., Cloud Run, Heroku):

`.env` (or create `.env.production`):
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_FIREBASE_PROJECT_ID=whizz-3fcf2
```

#### Option B: Backend Local (Development Only)
If backend stays on localhost:

Build command:
```bash
REACT_APP_API_URL=http://localhost:5000/api npm run build
```

Then deploy to Firebase:
```bash
firebase deploy --only hosting
```

**Note:** This only works if backend is also running on your local machine.

---

## ⚠️ Important: Two Different Firebase Projects

### Old Project (DO NOT USE):
- ID: `computer-250e7`
- Domain: `computer-250e7.firebaseapp.com`

### New Project (USE THIS):
- ID: `whizz-3fcf2` ✅
- Domain: `whizz-3fcf2.firebaseapp.com` ✅
- Hosting: `whizz-3fcf2.web.app` ✅

**All new development should use `whizz-3fcf2`!**

---

## ✅ CORS Configuration Reference

The backend now allows requests from:

| Origin | Type | Status |
|---|---|---|
| http://localhost:3000 | Dev | ✅ Allowed |
| http://localhost:3001 | Dev | ✅ Allowed |
| http://localhost:3002 | Dev | ✅ Allowed |
| http://127.0.0.1:3002 | Dev | ✅ Allowed |
| http://10.100.146.215 | Dev | ✅ Allowed |
| https://whizz-3fcf2.web.app | Prod | ✅ Allowed |
| https://whizz-3fcf2.firebaseapp.com | Prod | ✅ Allowed |

---

## 🧪 Test CORS Fix

### In Browser Console:

```javascript
// Test if CORS headers are present
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ CORS working:', data))
  .catch(err => console.error('❌ CORS error:', err));
```

Should show:
```
✅ CORS working: {status: "Backend is running! ✅", ...}
```

### From Deployed Frontend:

If frontend is at https://whizz-3fcf2.web.app:
1. Open DevTools → Network tab
2. Try signing up
3. Look for `POST /api/auth/signup`
4. Check Response Headers:
   - Should have: `Access-Control-Allow-Origin: https://whizz-3fcf2.web.app`
   - If not showing, backend not restarted

---

## 🚨 If Still Getting CORS Errors

### Checklist:

- [ ] Backend restarted after .env update
- [ ] Backend showing in console: Port 5000 running
- [ ] Frontend cleared browser cache
- [ ] Browser DevTools showing preflight OPTIONS request
- [ ] Response headers include Access-Control-Allow-Origin
- [ ] Correct Firebase project ID in frontend

### Debug Steps:

```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check CORS headers
curl -i -X OPTIONS http://localhost:5000/api/auth/signup \
  -H "Origin: https://whizz-3fcf2.web.app" \
  -H "Access-Control-Request-Method: POST"

# Should show:
# Access-Control-Allow-Origin: https://whizz-3fcf2.web.app
```

### Common Issues:

| Issue | Solution |
|---|---|
| 404 on /api/health | Backend not running - run `npm start` |
| No CORS headers | Backend not restarted - restart `npm start` |
| Wrong Firebase project | Update .env to use whizz-3fcf2 |
| Enrolled to wrong project | Clear Firebase Auth and Firestore, re-signup |

---

## 📊 Architecture After Fix

```
DEPLOYED FRONTEND
(https://whizz-3fcf2.web.app)
    ↓
    ├→ CORS Request Headers:
    │  Origin: https://whizz-3fcf2.web.app
    │
    ↓
BACKEND (Port 5000)
    ├→ Checks CORS origin against allow list
    │  ✅ https://whizz-3fcf2.web.app is allowed!
    │
    ├→ Response Headers:
    │  Access-Control-Allow-Origin: https://whizz-3fcf2.web.app
    │
    ↓
✅ CORS Check Passes
    ↓
Browser processes response
```

---

## 🎯 Final Verification

When everything works:

1. **Open:** https://whizz-3fcf2.web.app
2. **Sign up** → No CORS errors
3. **Check Console** → No blocked requests
4. **Enroll in course** → 200 OK responses
5. **Dashboard** → Shows enrolled courses

---

## 📝 Files Modified

| File | Change | Reason |
|---|---|---|
| [backend/server.js](backend/server.js) | Added Firebase domains to CORS | Allow deployed frontend |
| [backend/.env](backend/.env) | Updated FRONTEND_URL & PROJECT_ID | Accept Firebase projects |
| [.env](.env) | Updated Firebase config | Use correct project whizz-3fcf2 |

---

## ✨ Summary

✅ **CORS is now configured to allow:**
- Local development (localhost:3002 → localhost:5000)
- Deployed frontend (whizz-3fcf2.web.app → localhost:5000)
- All required HTTP methods and headers

✅ **Environment variables now point to:**
- Correct Firebase project: whizz-3fcf2
- Correct backend: http://localhost:5000/api (local) or deployed URL

✅ **Next step:** Restart backend and test!

---

**Ready to test?** Run `npm start` in backend folder and revisit https://whizz-3fcf2.web.app
