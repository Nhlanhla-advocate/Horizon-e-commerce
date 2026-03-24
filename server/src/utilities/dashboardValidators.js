const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to handle errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// Validation schema for adding a new product
const validateAddProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be one of: active, inactive, deleted'),
];

// Validation schema for updating a product
const validateUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be one of: active, inactive, deleted'),
];

// Validation schema for product ID parameter
const validateProductId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// Validation schema for review ID parameter
const validateReviewId = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),
];

// Validation schema for bulk update operations
const validateBulkUpdate = [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('Product IDs must be a non-empty array'),
  
  body('productIds.*')
    .isMongoId()
    .withMessage('Each product ID must be valid'),
  
  body('updateData')
    .isObject()
    .withMessage('Update data must be an object'),
  
  body('updateData.status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be one of: active, inactive, deleted'),
  
  body('updateData.featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('updateData.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('updateData.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
];

// Validation schema for query parameters
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'price', 'stock', 'rating'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid category'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Invalid status'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

// Validation schema for low stock query
const validateLowStockQuery = [
  query('threshold')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Threshold must be between 1 and 1000'),
];

// Validation schema for review queries
const validateReviewQuery = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'rating'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
];

// ============================================
// Admin Product Controller Validation Schemas
// ============================================

// Validation schema for creating product (productController.createProduct)
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

// Validation schema for updating product (productController.updateProduct)
const validateAdminUpdateProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be one of: active, inactive, deleted'),
];

// Validation schema for deleting product (productController.deleteProduct)
const validateDeleteProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// Validation schema for restoring product (productController.restoreProduct)
const validateRestoreProduct = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// Validation schema for getting related products (productController.getRelatedProducts)
const validateRelatedProducts = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// Validation schema for getting products by category (productController.getProductsByCategory)
const validateCategoryParam = [
  param('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Category must be between 1 and 200 characters'),
];

// Validation schema for bulk updating products (productController.bulkUpdateProducts)
const validateAdminBulkUpdate = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('Products must be a non-empty array'),
  
  body('products.*.id')
    .optional()
    .isMongoId()
    .withMessage('Each product must have a valid ID'),
  
  body('products.*._id')
    .optional()
    .isMongoId()
    .withMessage('Each product must have a valid _id'),
  
  body('products.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Product name must be between 3 and 200 characters'),
  
  body('products.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('products.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('products.*.status')
    .optional()
    .isIn(['active', 'inactive', 'deleted'])
    .withMessage('Status must be one of: active, inactive, deleted'),
  
  body('products.*.featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

// Validation schema for posting product review (productController.postReview)
const validatePostReview = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
];

// Validation schema for search products query (productController.searchProducts)
const validateSearchQuery = [
  query('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
];

// ============================================
// Product Performance & Analytics Validators
// ============================================

// Validation schema for top selling products query
const validateTopSellingQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid category'),
  
  query('minRevenue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min revenue must be a positive number'),
  
  query('minQuantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Min quantity must be a positive integer'),
];

// Validation schema for low selling products query
const validateLowSellingQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid category'),
  
  query('maxSales')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Max sales must be between 0 and 100'),
];

// Validation schema for low stock alerts query
const validateLowStockAlertsQuery = [
  query('threshold')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Threshold must be between 1 and 1000'),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid category'),
];

// Validation schema for product performance query
const validateProductPerformanceQuery = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
];

module.exports = {
  validate,
  // Dashboard-specific validators
  validateAddProduct,
  validateUpdateProduct,
  validateProductId,
  validateReviewId,
  validateBulkUpdate,
  validateQueryParams,
  validateLowStockQuery,
  validateReviewQuery,
  // Admin Product Controller validators
  validateCreateProduct,
  validateAdminUpdateProduct,
  validateDeleteProduct,
  validateRestoreProduct,
  validateRelatedProducts,
  validateCategoryParam,
  validateAdminBulkUpdate,
  validatePostReview,
  validateSearchQuery,
  // Product Performance & Analytics validators
  validateTopSellingQuery,
  validateLowSellingQuery,
  validateLowStockAlertsQuery,
  validateProductPerformanceQuery
};

