const express = require('express');
const router = express.Router();

const {
  validateAdminSignUp,
  validateAdminSignIn,
  handleValidationErrors
} = require('../utilities/validation');

const {
  adminSignUp,
  adminSignIn,
  adminSignOut,
  getAdminProfile
} = require('../controllers/adminController');

const { getAllOrders } = require('../controllers/orderController');
const categoryRoutes = require('./category');

const { authMiddleware } = require('../middleware/authMiddleware');

// Admin signup (public route)
router.post('/signup', ...validateAdminSignUp, handleValidationErrors, adminSignUp);

// Admin login (public route)
router.post('/signin', ...validateAdminSignIn, handleValidationErrors, adminSignIn);

// Admin logout (protected route)
router.post('/signout', authMiddleware, adminSignOut);

// Get admin profile (protected route)
router.get('/profile', authMiddleware, getAdminProfile);

// Get all orders with filters (protected route - admin only)
router.get('/orders', authMiddleware, getAllOrders);

// Category management routes (protected route - admin only)
router.use('/categories', categoryRoutes);

module.exports = router;
