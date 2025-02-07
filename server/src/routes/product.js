const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin } = require('../middleware/authMiddleware');  
// Create a new product (Admin only)
router.post('/products', authenticateUser, isAdmin, ProductController.createProduct);

// List products with filtering, sorting, and pagination
router.get('/products', ProductController.listProducts);

// Get single product details
router.get('/products/:id', ProductController.getProduct);

// Get related products
router.get('/products/:id/related', ProductController.getRelatedProducts);

// Get featured products
router.get('/products/featured', ProductController.getFeaturedProducts);

// Update a product (Admin only)
router.put('/products/:id', authenticateUser, isAdmin, ProductController.updateProduct);

// Bulk update products (Admin only)
router.put('/products/bulk-update', authenticateUser, isAdmin, ProductController.bulkUpdateProducts);

// Delete a product (soft delete, Admin only)
router.delete('/products/:id', authenticateUser, isAdmin, ProductController.deleteProduct);

module.exports = router;
