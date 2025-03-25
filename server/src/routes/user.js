const express = require('express');
const router = express.Router();
const { handleErrors } = require('../utilities/validation'); 
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getUser,
  updateUser
} = require('../controllers/userController');

// Route to get the user's profile (Protected route)
router.get('/profile', authMiddleware, getUser);

// Route to update user profile (Protected route)
router.put('/profile',authMiddleware, updateUser);

// Global error handling middleware
router.use(handleErrors);


module.exports = router;
