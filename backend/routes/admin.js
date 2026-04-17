// Admin Management Routes
// Handles admin verification, admin list, and admin operations

const express = require('express');
const router = express.Router();
const { admin, db } = require('../firebase-config');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * 🔐 VERIFY ADMIN AND GET APPROVED ADMINS
 * GET /api/admin/verify
 * Checks if user is authorized admin from abc123 collection
 */
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email;

    // Check if user is in approved admins (abc123 collection)
    const adminCollection = process.env.ADMIN_COLLECTION || 'abc123';
    const snapshot = await db.collection(adminCollection).get();
    
    let isApprovedAdmin = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email && data.email.toLowerCase() === userEmail.toLowerCase()) {
        isApprovedAdmin = true;
      }
    });

    if (!isApprovedAdmin) {
      return res.status(403).json({
        success: false,
        message: '❌ Email not in approved admins list',
        email: userEmail,
      });
    }

    // Check Firestore user role
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: '❌ User document not found',
      });
    }

    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '❌ User role is not admin',
        currentRole: userData.role,
      });
    }

    res.json({
      success: true,
      message: '✅ Admin verified',
      admin: {
        uid: userId,
        email: userEmail,
        role: userData.role,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying admin',
      error: error.message,
    });
  }
});

/**
 * 📋 GET APPROVED ADMINS LIST (Admin only)
 * GET /api/admin/list
 */
router.get('/list', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const adminCollection = process.env.ADMIN_COLLECTION || 'abc123';
    const snapshot = await db.collection(adminCollection).get();
    
    const admins = [];
    snapshot.forEach(doc => {
      admins.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error('❌ Error fetching admins list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins list',
      error: error.message,
    });
  }
});

/**
 * ➕ ADD NEW ADMIN TO APPROVED LIST (Admin only)
 * POST /api/admin/add
 */
router.post('/add', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const adminCollection = process.env.ADMIN_COLLECTION || 'abc123';
    const docRef = db.collection(adminCollection).doc(email.toLowerCase());
    
    await docRef.set({
      email: email.toLowerCase(),
      name: name || '',
      addedBy: req.user.email,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: `✅ Admin ${email} added successfully`,
      admin: {
        email: email.toLowerCase(),
        name,
      },
    });
  } catch (error) {
    console.error('❌ Error adding admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding admin',
      error: error.message,
    });
  }
});

/**
 * 🗑️ REMOVE ADMIN FROM APPROVED LIST (Admin only)
 * DELETE /api/admin/remove/:email
 */
router.delete('/remove/:email', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    const adminCollection = process.env.ADMIN_COLLECTION || 'abc123';
    
    if (email.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: '❌ Cannot remove your own admin access',
      });
    }

    await db.collection(adminCollection).doc(email.toLowerCase()).delete();

    res.json({
      success: true,
      message: `✅ Admin ${email} removed successfully`,
    });
  } catch (error) {
    console.error('❌ Error removing admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing admin',
      error: error.message,
    });
  }
});

/**
 * 📊 GET ADMIN DASHBOARD STATS
 * GET /api/admin/stats
 */
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const coursesSnapshot = await db.collection('courses').get();
    const enrollmentsSnapshot = await db.collection('enrollments').get();

    const stats = {
      totalUsers: usersSnapshot.size,
      totalCourses: coursesSnapshot.size,
      totalEnrollments: enrollmentsSnapshot.size,
      
      // Count by role
      studentsCount: 0,
      instructorsCount: 0,
      adminsCount: 0,
    };

    usersSnapshot.forEach(doc => {
      const role = doc.data().role;
      if (role === 'student') stats.studentsCount++;
      else if (role === 'instructor') stats.instructorsCount++;
      else if (role === 'admin') stats.adminsCount++;
    });

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
});

/**
 * 👥 GET ALL USERS (Admin only)
 * GET /api/admin/users?role=student&limit=50&offset=0
 */
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;
    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        email: userData.email,
        name: userData.fullName || userData.name,
        role: userData.role,
        status: userData.status,
        createdAt: userData.createdAt,
      });
    });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

/**
 * 🗑️ DELETE USER (Admin only)
 * DELETE /api/admin/users/:userId
 */
router.delete('/users/:userId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user from Firestore
    await db.collection('users').doc(userId).delete();

    // Try to delete from Firebase Auth (if service account is available)
    try {
      const { auth } = require('../firebase-config');
      await auth.deleteUser(userId);
      console.log(`✅ User ${userId} deleted from Auth`);
    } catch (authError) {
      console.warn(`⚠️ Could not delete user from Auth: ${authError.message}`);
    }

    res.json({
      success: true,
      message: `✅ User ${userId} deleted successfully`,
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

module.exports = router;
