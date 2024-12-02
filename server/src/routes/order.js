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

// const { authMiddleware } = require("../middleware/authMiddleware");

// Route to create an order
router.post("/", validateNewOrder, createOrder);

// Route to get order history for the authenticated user
router.get("/history", getOrderHistory);

// Route to get a specific order by its ID
router.get("/:id", getOrder);

// Route to get order analytics
router.get("/analytics", getOrderAnalytics);

// Route to update the status of an order
router.patch("/:orderId", updateOrderStatus);

// Route to cancel an order
router.delete("/:id/cancel", cancelOrder);

// Route to create a bulk order
router.post("/bulk", createBulkOrder);

router.post("/create-guest-order", validateGuestOrder, createGuestOrder);

module.exports = router;
