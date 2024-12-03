const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  postReview,
  handleErrors
} = require('../controllers/userController');

// Route to get the user's profile (Protected route)
router.get('/profile', getProfile);

// Route to update user profile (Protected route)
router.put(
  '/profile',
 updateProfile
);

// Route to post a review (Protected route)
router.post('/review', postReview);

// Global error handling middleware
router.use(handleErrors);

module.exports = router;
