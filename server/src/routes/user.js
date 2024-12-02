const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  validateSignUp,
  validateSignIn
} = require('../utilities/validation');
const {
  signUp,
  signIn,
  signOut
} = require('../controllers/authController');
const {
  getProfile,
  updateProfile,
  postReview,
  handleErrors
} = require('../controllers/userController');

// Route to sign up a new user
router.post('/signup', validateSignUp, signUp);

// Route to log a user in (signin)
router.post('/signin', validateSignIn, signIn);

// User signout
router.post("/signout", signOut);

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
