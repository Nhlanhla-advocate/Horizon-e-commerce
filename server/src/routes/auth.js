const express = require('express');
const router = express.Router();
// const authController = require('../controllers/authController');
// const { validateSignIn, validateSignUp, validate } = require('../utilities/validation')

router.post('/signup', (req, res) => {
    res.send('Sighup route');
});

router.post('/signin', (req, res) => {
    res.send('Sigin route');
});

router.post('/signout', (req, res) => {
    res.send('Signout route');
});

module.exports = router;