// Courses Routes
// CRUD operations for courses

const express = require('express');
const router = express.Router();
const { admin, db } = require('../firebase-config');
const { verifyToken, verifyInstructor, verifyAdmin } = require('../middleware/auth');

// ✅ GET ALL COURSES (Public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    let query = db.collection('courses');

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(parseInt(limit)).offset(parseInt(offset)).get();

    let courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Client-side search filter
    if (search) {
      const searchLower = search.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: courses,
      total: courses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET SINGLE COURSE
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const courseDoc = await db.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: courseDoc.id,
        ...courseDoc.data(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ CREATE COURSE (Instructor/Admin only)
router.post('/', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      duration,
      price,
      image,
      instructorId,
      level,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and price are required',
      });
    }

    const courseData = {
      title,
      description: description || '',
      category,
      duration: duration || 0,
      price: parseFloat(price),
      image: image || null,
      instructorId: req.user.uid,
      level: level || 'beginner',
      tags: tags || [],
      status: 'published',
      students: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      studentCount: 0,
      rating: 0,
      reviews: [],
    };

    const docRef = await db.collection('courses').add(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        id: docRef.id,
        ...courseData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ UPDATE COURSE (Instructor/Admin only)
router.put('/:courseId', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, image, level, status } = req.body;

    // Check if user owns the course
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const course = courseDoc.data();
    if (course.instructorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses',
      });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (image) updateData.image = image;
    if (level) updateData.level = level;
    if (status) updateData.status = status;

    await db.collection('courses').doc(courseId).update(updateData);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updateData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ DELETE COURSE (Instructor/Admin only)
router.delete('/:courseId', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user owns the course
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const course = courseDoc.data();
    if (course.instructorId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses',
      });
    }

    await db.collection('courses').doc(courseId).delete();

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ GET INSTRUCTOR'S COURSES
router.get('/instructor/my-courses', verifyToken, verifyInstructor, async (req, res) => {
  try {
    const snapshot = await db
      .collection('courses')
      .where('instructorId', '==', req.user.uid)
      .get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: courses,
      total: courses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
