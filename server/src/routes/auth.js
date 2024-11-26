const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignIn, validateSignUp, validate } = require('../utilities/validation')

router.post('/signup', validate, validateSignUp, authController.signUp);

router.post('/signin', validate, validateSignIn, authController.signIn);

router.post('/signout', authController.signOut);

module.exports = router;