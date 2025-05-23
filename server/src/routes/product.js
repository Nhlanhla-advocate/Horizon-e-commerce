const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/search', productController.searchProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

// Admin only routes
router.post('/', authMiddleware, isAdmin, productController.createProduct);
router.put('/:id', authMiddleware, isAdmin, productController.updateProduct);
router.delete('/:id', authMiddleware, isAdmin, productController.deleteProduct);
// router.post('/products/bulk', authMiddleware, isAdmin, productController.bulkCreateProducts);

module.exports = router;
