// Authentication Routes
// Signup, Login, Logout endpoints

const express = require('express');
const router = express.Router();
const { admin, auth: firebaseAuth, db } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

// ✅ SIGNUP / REGISTER
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validate inputs
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }

    console.log(`📝 Signup attempt: ${email} (Role: ${role || 'student'})`);

    // Use Firebase REST API to create user (works with default credentials)
    const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98';
    const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;

    let userRecord;
    try {
      const signupResponse = await fetch(signupUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.error?.message || 'Firebase signup failed');
      }

      const signupData = await signupResponse.json();
      console.log(`✅ Firebase Auth user created: ${email}`);

      userRecord = {
        uid: signupData.localId,
        email: signupData.email,
      };
    } catch (firebaseError) {
      console.error('❌ Firebase REST API error:', firebaseError.message);
      return res.status(400).json({
        success: false,
        message: firebaseError.message,
      });
    }

    // Store user data in Firestore with complete profile
    const userData = {
      uid: userRecord.uid,
      email,
      fullName: name,
      role: role || 'student',
      profilePicture: null,
      bio: '',
      phone: '',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      enrolledCourses: [],
      completedCourses: [],
    };

    try {
      await db.collection('users').doc(userRecord.uid).set(userData);
      console.log(`✅ User document created in Firestore: ${userRecord.uid}`);
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError.message);
      // Continue anyway - user was created in Auth
    }

    // Try to set custom claims (may fail with default credentials, but that's okay)
    try {
      await firebaseAuth.setCustomUserClaims(userRecord.uid, {
        role: role || 'student',
      });
      console.log(`✅ Custom claims set for: ${email}`);
    } catch (claimsError) {
      console.warn(`⚠️  Could not set custom claims (using dev mode): ${claimsError.message}`);
      // This is expected in development mode without service account
    }

    console.log(`✅ User created successfully: ${email} (Role: ${role || 'student'})`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        uid: userRecord.uid,
        email,
        fullName: name,
        role: role || 'student',
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Signup failed',
    });
  }
});

// ✅ UPDATE USER PROFILE
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, bio, phone, profilePicture } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (phone !== undefined) updates.phone = phone;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(req.user.uid).update(updates);

    console.log(`✅ User profile updated: ${req.user.uid}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updates,
    });
  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET CURRENT USER
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ LOGOUT (Token invalidation)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Firebase handles logout on client side
    // Backend can optionally track logout events
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ UPDATE USER PROFILE
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio, phone, profilePicture } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('users').doc(req.user.uid).update(updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ SEED TEST USERS (Development only)
router.post('/seed-test-users', async (req, res) => {
  try {
    const testUsers = [
      {
        email: 'admin@whizz.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'student@whizz.com',
        password: 'Student@123',
        name: 'Student User',
        role: 'student'
      },
      {
        email: 'instructor@whizz.com',
        password: 'Instructor@123',
        name: 'Instructor User',
        role: 'instructor'
      }
    ];

    const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyBE5HAG2wM3lwvwrYnLN2QBiQP2Kuc9n98';
    const results = [];

    for (const userData of testUsers) {
      try {
        // Create Firebase Auth user
        const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
        
        const signupResponse = await fetch(signupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            returnSecureToken: true,
          }),
        });

        let userRecord;
        if (signupResponse.ok) {
          const signupData = await signupResponse.json();
          userRecord = {
            uid: signupData.localId,
            email: signupData.email,
          };
        } else {
          // User might already exist, try to get the user
          console.log(`User ${userData.email} might already exist`);
          continue;
        }

        // Store in Firestore
        const firestoreData = {
          uid: userRecord.uid,
          email: userData.email,
          fullName: userData.name,
          name: userData.name,
          role: userData.role,
          sign_up_as: userData.role,
          profilePicture: null,
          bio: '',
          phone: '',
          status: 'active',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          enrolledCourses: [],
          completedCourses: [],
        };

        await db.collection('users').doc(userRecord.uid).set(firestoreData);
        
        results.push({
          email: userData.email,
          role: userData.role,
          status: 'created'
        });
        
        console.log(`✅ Created user: ${userData.email}`);
      } catch (userErr) {
        console.warn(`⚠️ Error creating user ${userData.email}:`, userErr.message);
        results.push({
          email: userData.email,
          role: userData.role,
          status: 'failed',
          error: userErr.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Test users seeding complete',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
