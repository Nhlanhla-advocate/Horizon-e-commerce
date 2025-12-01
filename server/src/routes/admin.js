const express = require('express');
const router = express.Router();

const {
  validateAdminSignIn,
  handleValidationErrors
} = require('../utilities/validation');

const {
  adminSignIn,
  adminSignOut,
  getAdminProfile
} = require('../controllers/adminController');

const { authMiddleware } = require('../middleware/authMiddleware');

// Admin login (public route)
router.post('/signin', validateAdminSignIn, handleValidationErrors, adminSignIn);

// Admin logout (protected route)
router.post('/signout', authMiddleware, adminSignOut);

// Get admin profile (protected route)
router.get('/profile', authMiddleware, getAdminProfile);

module.exports = router;
