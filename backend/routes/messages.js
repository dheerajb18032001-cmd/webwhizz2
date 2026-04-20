// Messages Routes
// Handle contact form submissions

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const messagesFile = path.join(__dirname, '../messages.json');

// Helper function to save messages to local file
const saveMessageToFile = (messageData) => {
  try {
    let messages = [];
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf8');
      messages = JSON.parse(data);
    }
    
    const newMessage = {
      id: Date.now().toString(),
      ...messageData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      read: false,
    };
    
    messages.push(newMessage);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    return newMessage;
  } catch (error) {
    console.error('Error saving to file:', error);
    throw error;
  }
};

// ✅ SAVE CONTACT MESSAGE (Public endpoint)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Subject, and Message are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Save message to local file (workaround for Firestore credentials issue)
    const savedMessage = saveMessageToFile({
      full_name: name,
      email: email,
      phone: phone || '',
      subject: subject,
      message: message,
    });

    console.log(`✅ Contact message saved: ${savedMessage.id}`);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      messageId: savedMessage.id,
    });
  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
});

// ✅ GET ALL MESSAGES (Admin only - optional)
router.get('/all', async (req, res) => {
  try {
    let messages = [];
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf8');
      messages = JSON.parse(data);
    }

    res.json({
      success: true,
      data: messages.reverse(), // Show newest first
      total: messages.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ✅ DELETE MESSAGE (Admin only)
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    let messages = [];
    if (fs.existsSync(messagesFile)) {
      const data = fs.readFileSync(messagesFile, 'utf8');
      messages = JSON.parse(data);
    }

    messages = messages.filter(msg => msg.id !== messageId);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    
    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
