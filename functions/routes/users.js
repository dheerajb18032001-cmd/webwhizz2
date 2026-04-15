// Users Routes
// User profile management

const express = require('express');
const router = express.Router();
const { db } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

// ✅ GET USER PROFILE
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        uid: userDoc.id,
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

// ✅ GET ALL USERS (Admin only)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').limit(100).get();

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ UPDATE USER PROFILE (Protected)
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, phone, profilePicture } = req.body;

    // Can only update own profile
    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own profile',
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (profilePicture) updateData.profilePicture = profilePicture;

    await db.collection('users').doc(userId).update(updateData);

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

// ✅ GET USER STATISTICS
router.get('/:userId/stats', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get enrollments count
    const enrollmentsSnapshot = await db
      .collection('enrollments')
      .where('studentId', '==', userId)
      .get();

    // Get completed courses
    const completedSnapshot = await db
      .collection('enrollments')
      .where('studentId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    // Get courses taught (if instructor)
    const coursesSnapshot = await db
      .collection('courses')
      .where('instructorId', '==', userId)
      .get();

    res.json({
      success: true,
      data: {
        coursesEnrolled: enrollmentsSnapshot.size,
        coursesCompleted: completedSnapshot.size,
        coursesTaught: coursesSnapshot.size,
        averageProgress: () => {
          let total = 0;
          enrollmentsSnapshot.forEach(doc => {
            total += doc.data().progress || 0;
          });
          return enrollmentsSnapshot.size > 0 ? (total / enrollmentsSnapshot.size).toFixed(2) : 0;
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
