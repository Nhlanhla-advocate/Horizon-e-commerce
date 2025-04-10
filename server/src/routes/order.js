const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validateGuestOrder, validateNewOrder } = require('../utilities/validation');

const {
  createOrder,
  getOrderHistory,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  createBulkOrder,
  getOrderAnalytics,
  createGuestOrder,
} = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Route for creating orders
router.post("/create", validateNewOrder, createOrder);
router.post("/bulk", createBulkOrder);
router.post("/create-guest-order", validateGuestOrder, createGuestOrder);

// Routes for information
router.get("/analytics/all", authMiddleware, getOrderAnalytics);
router.get("/history", authMiddleware, getOrderHistory);

// Parameter routes last
router.get("/:id", authMiddleware, getOrder);
router.patch("/update/:orderId", updateOrderStatus);
router.delete("/:id/cancel", cancelOrder);

module.exports = router;
