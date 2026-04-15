import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Save to Firebase 'client' collection
      await addDoc(collection(db, 'client'), {
        full_name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error saving message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <section className="contact-hero">
        <h1>Get In Touch</h1>
        <p>Have questions? We'd love to hear from you. Send us a message!</p>
      </section>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h3>Address</h3>
            <p>123 Learning Street</p>
            <p>Tech City, TC 12345</p>
            <p>India</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <h3>Phone</h3>
            <p>+1 (555) 123-4567</p>
            <p>+91 98765-43210</p>
            <p>Monday - Friday, 9AM - 6PM IST</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📧</div>
            <h3>Email</h3>
            <p>support@whizz.com</p>
            <p>careers@whizz.com</p>
            <p>partnerships@whizz.com</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🌐</div>
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">Instagram</a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a Message</h2>

          {submitted && (
            <div className="success-message">
              ✅ Thanks for your message! We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="How can we help?"
              required
            />
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              rows="6"
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How do I enroll in a course?</h3>
            <p>Simply browse our course catalog, select a course, and click "Enroll Now". You'll need to be logged in to your Whizz account.</p>
          </div>

          <div className="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards, debit cards, and digital payment methods like UPI and Wallet.</p>
          </div>

          <div className="faq-item">
            <h3>Can I get a refund?</h3>
            <p>Yes, we offer a 7-day money-back guarantee if you're not satisfied with your course.</p>
          </div>

          <div className="faq-item">
            <h3>How long do I have access to the course?</h3>
            <p>You have lifetime access to all course materials once enrolled. Learn at your own pace!</p>
          </div>

          <div className="faq-item">
            <h3>Do you offer certificates?</h3>
            <p>Yes! Upon completing a course, you'll receive a downloadable certificate that you can share on your professional profiles.</p>
          </div>

          <div className="faq-item">
            <h3>How do I become an instructor?</h3>
            <p>Interested in teaching? Email us at careers@whizz.com with your credentials and course ideas.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
