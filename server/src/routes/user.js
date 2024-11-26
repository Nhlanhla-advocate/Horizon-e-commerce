const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Get User Profile
router.get('/profile', userController.getProfile);

// Update User Profile
router.put(
  '/profile',
  // userController.validateInput([
  //   body('username')
  //   .optional()
  //   .isString()
  //   .withMessage('Username must be a string'),
  //   body('email')
  //   .optional()
  //   .isEmail()
  //   .withMessage('Please enter a valid email'),
  //   body('address')
  //   .optional()
  //   .isString()
  //   .withMessage('Address must be a string')
  // ]),
  userController.updateProfile
);

// Post a Review (placeholder route)
router.post('/review', userController.postReview);

module.exports = router;
