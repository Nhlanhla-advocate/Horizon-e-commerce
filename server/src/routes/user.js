const express = require('express');
const router = express.Router();
const {
  handleErrors,
  validate,
  validateUpdateProfile,
  validateChangePassword,
  validateAddAddress,
  validateUpdateAddress,
  validateAddressId
} = require('../utilities/validation');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getUser,
  updateUser,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/userController');

// Route to get the user's profile (Protected route)
router.get('/profile', authMiddleware, getUser);

// Route to update user profile (Protected route)
router.put('/profile', authMiddleware, validateUpdateProfile, validate, updateUser);

// Route to change password from profile settings (Protected route)
router.put('/profile/password', authMiddleware, validateChangePassword, validate, changePassword);

// Address management (Protected routes)
router.post('/profile/addresses', authMiddleware, validateAddAddress, validate, addAddress);
router.put('/profile/addresses/:addressId', authMiddleware, validateUpdateAddress, validate, updateAddress);
router.delete('/profile/addresses/:addressId', authMiddleware, validateAddressId, validate, deleteAddress);

// Global error handling middleware
router.use(handleErrors);

module.exports = router;
