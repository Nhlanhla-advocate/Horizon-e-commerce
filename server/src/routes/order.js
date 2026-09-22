const express = require("express");
const router = express.Router();
const { validateNewOrder, handleValidationErrors } = require('../utilities/validation');

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
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, validateNewOrder, handleValidationErrors, createOrder);
router.post("/bulk", authMiddleware, createBulkOrder);
router.post("/create-guest-order", createGuestOrder);

router.get("/analytics/all", authMiddleware, isAdmin, getOrderAnalytics);
router.get("/history", authMiddleware, getOrderHistory);

router.get("/:id", authMiddleware, getOrder);
router.patch("/update/:orderId", authMiddleware, isAdmin, updateOrderStatus);
router.delete("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;
