const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All category routes require authentication
router.get('/', authMiddleware, getAllCategories);
router.get('/:id', authMiddleware, getCategory);
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

module.exports = router;
