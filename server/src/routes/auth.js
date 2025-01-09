const express = require('express');
const router = express.Router();
const {
    validateSignUp,
    validateSignIn,
    handleValidationErrors
  } = require('../utilities/validation');
  const {
    signUp,
    signIn,
    signOut
  } = require('../controllers/authController');

  // Route to sign up a new user
router.post('/signup', validateSignUp, signUp);

// Route to log a user in (signin)
router.post('/signin', validateSignIn, handleValidationErrors, signIn);

// User signout
router.post("/signout", signOut);


module.exports = router;