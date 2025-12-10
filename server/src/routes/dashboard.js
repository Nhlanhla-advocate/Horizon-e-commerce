const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const productController = require('../controllers/productController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const {
  validate,
  validateAddProduct,
  validateUpdateProduct,
  validateProductId,
  validateReviewId,
  validateBulkUpdate,
  validateQueryParams,
  validateLowStockQuery,
  validateReviewQuery,
  validateTopSellingQuery,
  validateLowSellingQuery,
  validateLowStockAlertsQuery,
  validateProductPerformanceQuery
} = require('../utilities/dashboardValidators');

// All dashboard routes require admin authentication
router.use(authMiddleware);
router.use(isAdmin);

// Dashboard overview and statistics
router.get('/stats', (req, res) => dashboardController.getDashboardStats(req, res));
router.get('/charts', (req, res) => dashboardController.getChartData(req, res));

// Cache management routes
router.post('/cache/refresh', (req, res) => dashboardController.refreshDashboardCache(req, res));
router.delete('/cache/clear', (req, res) => dashboardController.clearDashboardCache(req, res));
router.get('/cache/status', (req, res) => dashboardController.getCacheStatus(req, res));

// Product management routes
router.get('/products', validateQueryParams, validate, (req, res) => dashboardController.getAllProducts(req, res));
router.post('/products', validateAddProduct, validate, (req, res) => dashboardController.addProduct(req, res));
router.put('/products/:id', validateUpdateProduct, validate, (req, res) => dashboardController.updateProduct(req, res));
router.delete('/products/:id', validateProductId, validate, (req, res) => productController.deleteProduct(req, res));
router.post('/products/:id/restore', validateProductId, validate, (req, res) => productController.restoreProduct(req, res));
router.post('/products/bulk-update', validateBulkUpdate, validate, (req, res) => dashboardController.bulkUpdateProducts(req, res));
router.get('/products/low-stock', validateLowStockQuery, validate, (req, res) => dashboardController.getLowStockProducts(req, res));

// Product review management routes
router.get('/products/:id/reviews', validateReviewQuery, validate, (req, res) => dashboardController.getProductReviews(req, res));
router.delete('/reviews/:reviewId', validateReviewId, validate, (req, res) => dashboardController.deleteReview(req, res));

// Order management routes
router.get('/orders', validateQueryParams, validate, (req, res) => dashboardController.getAllOrders(req, res));
router.get('/orders/:orderId', (req, res) => dashboardController.getOrder(req, res));
router.patch('/orders/:orderId/status', (req, res) => dashboardController.updateOrderStatus(req, res));

// Product performance and analytics routes
router.get('/analytics/top-selling', validateTopSellingQuery, validate, (req, res) => dashboardController.getTopSellingProducts(req, res));
router.get('/analytics/low-selling', validateLowSellingQuery, validate, (req, res) => dashboardController.getLowSellingProducts(req, res));
router.get('/analytics/low-stock-alerts', validateLowStockAlertsQuery, validate, (req, res) => dashboardController.getLowStockAlerts(req, res));
router.get('/analytics/performance', validateProductPerformanceQuery, validate, (req, res) => dashboardController.getProductPerformance(req, res));

module.exports = router;
