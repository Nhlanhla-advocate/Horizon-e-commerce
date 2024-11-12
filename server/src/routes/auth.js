const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateSignUp, validateSignIn } = require('../validators/authValidators');

router.post('/signup', validateSignUp, authController.signUp);

router.post('/signin', validateSignIn, authController.signIn);

router.post('/signout', authController.signOut);

module.exports = router;