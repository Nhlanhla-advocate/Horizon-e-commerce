const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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
const { isAuthenticated } = require("../middleware/authMiddleware");

// router.post(
//     '/create', isAuthenticated
//     // [
//     //     body('items').isArray().notEmpty(),
//     //     body('paymentMethod').notEmpty(),
//     //     body('paymentToken').notEmpty()
//     // ]
//     ,
//     (req, res, next) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }
//         next();
//     },
//     createOrder
// );

// router.post(
//     "/create",
//     isAuthenticated,  // Check if the user is authenticated
//     [
//       body("items").isArray().notEmpty(),
//       body("paymentMethod").notEmpty(),
//       body("paymentToken").notEmpty(),
//     ],
//     (req, res, next) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
//       next();  // If no validation errors, move to the createOrder function
//     },
//     createOrder  // Your handler function that creates the order
//   );

router.get("/history", getOrderHistory);
router.get("/:id", getOrder);
// router.patch(
//   "/:id/update-status",
//   [body("status").isString().notEmpty()],
//   isAuthenticated,
//   updateOrderStatus
// );

router.delete("/:id/cancel", cancelOrder);
router.post("/bulk", createBulkOrder);
router.get("/analytics", getOrderAnalytics);
// router.post(
//   "/guest",
//   [
//     body("items").isArray().notEmpty(),
//     body("paymentMethod").notEmpty(),
//     body("paymentToken").notEmpty(),
//     body("guestEmail").isEmail(),
//   ],
//   createGuestOrder
// );

module.exports = router;
