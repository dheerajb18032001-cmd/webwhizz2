import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getStudentEnrollments } from '../firebase/enrollmentService';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (userRole !== 'student') {
      navigate('/');
      return;
    }

    fetchStudentData();
  }, [user, userRole, navigate]);

  const fetchStudentData = async () => {
    try {
      if (user) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserProfile(userData);
          setFormData(userData);
        } else {
          // Create new user document if doesn't exist
          const newUserData = {
            name: user.displayName || '',
            email: user.email,
            phone: '',
            address: '',
            userId: user.uid,
            createdAt: new Date(),
            role: 'student',
          };
          await updateDoc(userDocRef, newUserData);
          setUserProfile(newUserData);
          setFormData(newUserData);
        }

        // Fetch enrolled courses
        const enrollments = await getStudentEnrollments(user);
        const coursesWithDetails = [];
        
        for (const enrollment of enrollments) {
          try {
            const response = await fetch(
              `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/courses/${enrollment.courseId}`
            );
            if (response.ok) {
              const result = await response.json();
              coursesWithDetails.push({
                ...result.data,
                enrollmentId: enrollment.id,
                progress: enrollment.progress || 0,
              });
            }
          } catch (err) {
            console.warn('Could not fetch course details:', err);
            coursesWithDetails.push({
              id: enrollment.courseId,
              title: enrollment.courseTitle || 'Unknown Course',
              enrollmentId: enrollment.id,
              progress: enrollment.progress || 0,
            });
          }
        }
        
        setEnrolledCourses(coursesWithDetails);

        // Fetch cart
        const cartCollectionRef = collection(db, `users/${user.uid}/cart`);
        const cartSnap = await getDocs(cartCollectionRef);
        const cartItems = cartSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCart(cartItems);

        // Fetch recent orders
        const ordersCollectionRef = collection(db, `users/${user.uid}/orders`);
        const ordersQuery = query(ordersCollectionRef);
        const ordersSnap = await getDocs(ordersQuery);
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        setOrders(ordersList);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, formData);
      setUserProfile(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📚 My Learning Dashboard</h1>
        <p>Welcome back, {userProfile?.name || user?.email}!</p>
      </div>

      <div className="dashboard-grid">
        {/* User Profile Section */}
        <div className="profile-section">
          <div className="profile-card">
            <h2>👤 My Information</h2>
            {!editing ? (
              <div className="profile-info">
                <div className="info-row">
                  <label>Name:</label>
                  <p>{userProfile.name}</p>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <p>{userProfile.email}</p>
                </div>
                <div className="info-row">
                  <label>Phone:</label>
                  <p>{userProfile.phone || 'Not provided'}</p>
                </div>
                <div className="info-row">
                  <label>Address:</label>
                  <p>{userProfile.address || 'Not provided'}</p>
                </div>
                <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange}></textarea>
                </div>
                <div className="form-buttons">
                  <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                  <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h3>{enrolledCourses.length}</h3>
              <p>Courses Enrolled</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{cart.length}</h3>
              <p>Items in Cart</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{orders.length}</h3>
              <p>Recent Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="cart-section">
        <h2>🛒 Your Cart</h2>
        {cart.length > 0 ? (
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="checkout-btn">Proceed to Checkout</button>
          </div>
        ) : (
          <p>Your cart is empty</p>
        )}
      </div>

      {/* Orders Section */}
      <div className="orders-section">
        <h2>📦 Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id.substring(0, 8)}</h3>
                  <span className="order-date">{new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="order-details">
                  <p><strong>Amount:</strong> ₹{order.total}</p>
                  <p><strong>Status:</strong> <span className="status">{order.status || 'Processing'}</span></p>
                  <p><strong>Items:</strong> {order.items?.length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No orders yet</p>
        )}
      </div>

      {/* Enrolled Courses Section */}
      <div className="course-section">
        <h2>📚 Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="courses-list">
            {enrolledCourses.map(course => (
              <div key={course.id} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
                <p className="progress-text">{course.progress}% Complete</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No enrolled courses yet</p>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
