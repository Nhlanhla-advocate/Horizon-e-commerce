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

const { authMiddleware } = require('../middleware/authMiddleware');

// Admin signup (public route)
router.post('/signup', validateAdminSignUp, handleValidationErrors, adminSignUp);

// Admin login (public route)
router.post('/signin', validateAdminSignIn, handleValidationErrors, adminSignIn);

// Admin logout (protected route)
router.post('/signout', authMiddleware, adminSignOut);

// Get admin profile (protected route)
router.get('/profile', authMiddleware, getAdminProfile);

module.exports = router;
