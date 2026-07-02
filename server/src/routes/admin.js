const express = require('express');
const router = express.Router();

const {
  validateAdminSignUp,
  validateAdminSignIn,
  validateAdminTwoFactorSignIn,
  validateChangePassword,
  validateUpdateAdminProfile,
  validateAdminNotificationPreferences,
  validateTotpToken,
  validateDisableTwoFactor,
  handleValidationErrors,
  validate
} = require('../utilities/validation');

const {
  adminSignUp,
  adminSignIn,
  adminVerifyTwoFactorSignIn,
  adminSignOut,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminAvatar,
  getAdminLoginHistory,
  updateAdminNotificationPreferences,
  setupAdminTwoFactor,
  verifyAdminTwoFactor,
  disableAdminTwoFactor
} = require('../controllers/adminController');

const { getAllOrders } = require('../controllers/orderController');
const categoryRoutes = require('./category');
const { parseAvatarUpload } = require('../middleware/profileUpload');

const { authMiddleware } = require('../middleware/authMiddleware');

// Admin signup (public route)
router.post('/signup', ...validateAdminSignUp, handleValidationErrors, adminSignUp);

// Admin login (public route)
router.post('/signin', ...validateAdminSignIn, handleValidationErrors, adminSignIn);
router.post('/signin/2fa', ...validateAdminTwoFactorSignIn, handleValidationErrors, adminVerifyTwoFactorSignIn);

// Admin logout (protected route)
router.post('/signout', authMiddleware, adminSignOut);

// Admin account / profile (protected)
router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, ...validateUpdateAdminProfile, validate, updateAdminProfile);
router.put('/profile/password', authMiddleware, ...validateChangePassword, validate, changeAdminPassword);
router.post('/profile/upload/avatar', authMiddleware, parseAvatarUpload, uploadAdminAvatar);
router.get('/profile/login-history', authMiddleware, getAdminLoginHistory);
router.put('/profile/notifications', authMiddleware, ...validateAdminNotificationPreferences, validate, updateAdminNotificationPreferences);
router.post('/profile/2fa/setup', authMiddleware, setupAdminTwoFactor);
router.post('/profile/2fa/verify', authMiddleware, ...validateTotpToken, validate, verifyAdminTwoFactor);
router.delete('/profile/2fa', authMiddleware, ...validateDisableTwoFactor, validate, disableAdminTwoFactor);

// Get all orders with filters (protected route - admin only)
router.get('/orders', authMiddleware, getAllOrders);

// Category management routes (protected route - admin only)
router.use('/categories', categoryRoutes);

module.exports = router;
