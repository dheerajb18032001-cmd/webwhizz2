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

    // Create user in Firebase Auth
    const userRecord = await firebaseAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Store user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: role || 'student',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profilePicture: null,
      bio: '',
      phone: '',
    });

    // Generate custom claims
    await firebaseAuth.setCustomUserClaims(userRecord.uid, {
      role: role || 'student',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        role: role || 'student',
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET CUSTOM TOKEN FOR FRONTEND LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Note: Firebase Admin SDK cannot directly verify passwords
    // Frontend should handle login via Firebase SDK and send ID token
    res.status(200).json({
      success: true,
      message: 'Use Firebase SDK on frontend for authentication',
      instruction: 'Send idToken from Firebase Client SDK to backend',
    });
  } catch (error) {
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

module.exports = router;
