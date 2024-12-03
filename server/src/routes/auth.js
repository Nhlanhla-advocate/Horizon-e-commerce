const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// const { validateSignIn, validateSignUp, validate } = require('../utilities/validation')

router.post('/signup', authController.signUp);

router.post('/signin', authController.signIn);


router.post('/signout', authController.signOut);

module.exports = router;