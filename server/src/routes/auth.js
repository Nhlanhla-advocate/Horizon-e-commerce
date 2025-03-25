const express = require('express');
const router = express.Router();
const {
    validateSignUp,
    validateSignIn,
    handleValidationErrors,
    validateForgotPassword,
    validateResetPassword
  } = require('../utilities/validation');
  const {
    signUp,
    signIn,
    signOut,
    resetPassword,
    forgotPassword,
    refreshToken
  } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

  // Route to sign up a new user
router.post('/signup', validateSignUp, signUp);

// Route to log a user in (signin)
router.post('/signin', validateSignIn, handleValidationErrors, signIn);

// User signout
router.post("/signout", authMiddleware, signOut);

// Route for forgot password
router.post("/forgot-password", validateForgotPassword, forgotPassword)

// Route for resetting the password
router.post("/reset-password/:resetToken", validateResetPassword, resetPassword)

// Add refresh token route
router.post('/refresh-token', refreshToken);

module.exports = router;