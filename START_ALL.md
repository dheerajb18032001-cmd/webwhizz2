#!/bin/bash
# Whizz Platform - Complete Startup Script

echo "
╔════════════════════════════════════════════════════════╗
║    🚀 Whizz Course Platform - Complete Setup          ║
║    Node.js Backend + React Frontend + Firebase        ║
╚════════════════════════════════════════════════════════╝
"

echo "
📋 QUICK START - Run in 2 Terminals:

═══════════════════════════════════════════════════════════

🖥️  TERMINAL 1: React Frontend

cd c:\\whizz
npm start

Expected Output:
  ✅ Compiled successfully!
  📍 Running on http://localhost:3002

═══════════════════════════════════════════════════════════

🖥️  TERMINAL 2: Node.js Backend

cd c:\\whizz\\backend
npm start

Expected Output:
  ✅ Whizz Backend Server Running
  📍 Port: 5000
  🌐 URL: http://localhost:5000

═══════════════════════════════════════════════════════════

✅ When Both Are Running:
   Frontend:  http://localhost:3002 ✅
   Backend:   http://localhost:5000 ✅
   Database:  Firebase Firestore   ✅

═══════════════════════════════════════════════════════════
"

echo "
🧪 TEST THE BACKEND:

# Health Check (Backend must be running)
curl http://localhost:5000/api/health

Expected Response:
{
  \"status\": \"Backend is running! ✅\",
  \"timestamp\": \"2026-04-14T12:37:58.476Z\"
}

═══════════════════════════════════════════════════════════

# Get All Courses
curl http://localhost:5000/api/courses

Expected Response:
{
  \"success\": true,
  \"data\": [
    {
      \"id\": \"course123\",
      \"title\": \"React Basics\",
      \"category\": \"Web Development\",
      \"price\": 499
    }
  ]
}

═══════════════════════════════════════════════════════════
"

echo "
📚 DOCUMENTATION:

Read these files for complete information:
  📖 backend/README.md               - Backend setup guide
  📖 backend/API_DOCUMENTATION.md    - All 22 endpoints
  📖 BACKEND_INTEGRATION_GUIDE.md    - How frontend & backend work
  📖 BACKEND_READY.md                - Summary & features

═══════════════════════════════════════════════════════════
"

echo "
🎯 USE BACKEND IN REACT:

import { coursesAPI, enrollmentsAPI } from '../services/api';

// Get courses
const courses = await coursesAPI.getAllCourses();

// Enroll in course
await enrollmentsAPI.enrollCourse(user, courseId);

// Update progress
await enrollmentsAPI.updateProgress(user, enrollmentId, 75);

═══════════════════════════════════════════════════════════
"

echo "
🚀 DEPLOYMENT:

To deploy backend to production:

# Create .env file with production values
# Deploy to Heroku, Railway, or AWS

heroku create your-app-name
heroku config:set PORT=5000
git push heroku main

═══════════════════════════════════════════════════════════

✨ Your Whizz platform is production-ready! ✨

Happy coding! 💻
"
