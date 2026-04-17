// Enrollments Routes
// Handle student enrollments, progress, and certificates

const express = require('express');
const router = express.Router();
const { admin, db } = require('../firebase-config');
const { verifyToken } = require('../middleware/auth');

// ✅ ENROLL IN COURSE
router.post('/enroll', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const { uid: studentId, email: studentEmail } = req.user;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    // Check if course exists
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already enrolled
    const enrollmentQuery = await db
      .collection('enrollments')
      .where('studentId', '==', studentId)
      .where('courseId', '==', courseId)
      .get();

    if (!enrollmentQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    // Create enrollment
    const enrollmentData = {
      studentId,
      studentEmail,
      courseId,
      courseName: courseDoc.data().title,
      progress: 0,
      status: 'active',
      certificateIssued: false,
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const enrollmentRef = await db.collection('enrollments').add(enrollmentData);

    // Update course student count
    const courseData = courseDoc.data();
    await db.collection('courses').doc(courseId).update({
      studentCount: (courseData.studentCount || 0) + 1,
      students: admin.firestore.FieldValue.arrayUnion(studentId),
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: {
        enrollmentId: enrollmentRef.id,
        ...enrollmentData,
      },
    });
  } catch (error) {
    console.error('❌ Enrollment Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.code,
    });
  }
});

// ✅ GET STUDENT ENROLLMENTS
router.get('/my-enrollments', verifyToken, async (req, res) => {
  try {
    const snapshot = await db
      .collection('enrollments')
      .where('studentId', '==', req.user.uid)
      .get();

    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ CHECK IF ENROLLED
router.get('/check/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const snapshot = await db
      .collection('enrollments')
      .where('studentId', '==', req.user.uid)
      .where('courseId', '==', courseId)
      .get();

    res.json({
      success: true,
      isEnrolled: !snapshot.empty,
      enrollment: snapshot.empty ? null : {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ UPDATE PROGRESS
router.put('/progress/:enrollmentId', verifyToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100',
      });
    }

    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Verify ownership
    if (enrollmentDoc.data().studentId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await db.collection('enrollments').doc(enrollmentId).update({
      progress: parseFloat(progress),
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Progress updated',
      data: {
        enrollmentId,
        progress,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ COMPLETE COURSE & ISSUE CERTIFICATE
router.post('/complete/:enrollmentId', verifyToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    // Verify ownership
    if (enrollmentDoc.data().studentId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.collection('enrollments').doc(enrollmentId).update({
      progress: 100,
      status: 'completed',
      certificateIssued: true,
      certificateId,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Course completed successfully',
      data: {
        certificateId,
        issuedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ UNENROLL FROM COURSE
router.delete('/:enrollmentId', verifyToken, async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    const enrollment = enrollmentDoc.data();

    // Verify ownership
    if (enrollment.studentId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Delete enrollment
    await db.collection('enrollments').doc(enrollmentId).delete();

    // Update course student count
    const courseDoc = await db.collection('courses').doc(enrollment.courseId).get();
    if (courseDoc.exists) {
      await db.collection('courses').doc(enrollment.courseId).update({
        studentCount: Math.max(0, (courseDoc.data().studentCount || 1) - 1),
        students: admin.firestore.FieldValue.arrayRemove(enrollment.studentId),
      });
    }

    res.json({
      success: true,
      message: 'Unenrolled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET COURSE ENROLLMENTS (Instructor/Admin)
router.get('/course/:courseId/enrollments', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify instructor owns course
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (courseDoc.data().instructorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const snapshot = await db
      .collection('enrollments')
      .where('courseId', '==', courseId)
      .get();

    const enrollments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
