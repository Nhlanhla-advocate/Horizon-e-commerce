const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
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
const authMiddleware = require('../middleware/authMiddleware');

const user = require("../models/user");


router.post(
    '/create', authMiddleware(user),
    [
        body('items').isArray().notEmpty().withMessage("Items must be an array and not empty"),
        // body('paymentMethod').notEmpty(),
        // body('paymentToken').notEmpty()
    ]
    ,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    createOrder
);

// Route to get order history for the authenticated user
router.get("/history", authMiddleware(user), getOrderHistory);

// Route to get a specific order by its ID
router.get("/:id", authMiddleware(user), getOrder);

// Route to get order analytics
router.get("/analytics", authMiddleware(user),getOrderAnalytics);

// Route to update the status of an order
router.patch(
  "/:id/update-status",
  authMiddleware,
  [body("status").isString().notEmpty().withMessage("Status is required.")],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateOrderStatus
);

// Route to cancel an order
router.delete("/:id/cancel", authMiddleware(user), cancelOrder);

// Route to create a bulk order
router.post("/bulk", authMiddleware(user), createBulkOrder);

router.post(
  "/guest",
  [
    body("items").isArray().notEmpty().withMessage("Items must be an array and not empty."),
    body("paymentMethod").notEmpty().withMessage("Payment method is required."),
    body("paymentToken").notEmpty().withMessage("Payment token is required."),
    body("guestEmail").isEmail().withMessage("A valid guest email is required."),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createGuestOrder
);

module.exports = router;
