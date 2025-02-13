const { check, body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


// Inputting validation middleware
const validateInput = (validations) => async (req, res, next) => {
  try {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);

       // If there are validation errors, return a 400 response
       if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Proceed to the next middleware
    next();
} catch (err) {
    next(err);
}
};

// Error handling middleware
const handleErrors = (err, req, res, next) => {
console.error(err.message);

if (err instanceof mongoose.Error.CastError) {
    return res.status(404).json({ message: 'Resource not found' });
}
if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: 'Invalid token' });
}

res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
};

// Validation middleware for registration (sign-up)
const validateSignUp = [
    check('username')
        .trim()
        .not().isEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 6 characters long'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
];

// Middleware for handling validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation middleware for sign-in
const validateSignIn = [
    check('email')
        .trim()
        .isEmail().withMessage('A valid email is required'),

    check('password')
        .not().isEmpty().withMessage('Password is required')
];

// Update Profile
exports.updateProfile = [
    body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

    body('email')
    .isEmail()
    .withMessage('Invalid email format'),

    body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty')
];

// catch express-validator errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateGuestOrder = [
    body("items").isArray().notEmpty().withMessage("Items must be an array and not empty."),
    body("paymentMethod").notEmpty().withMessage("Payment method is required."),
    body("paymentToken").notEmpty().withMessage("Payment token is required."),
    body("guestEmail").isEmail().withMessage("A valid guest email is required."),
  ];

  const validateNewOrder = [
    body("customerId").isMongoId().withMessage("Invalid customer ID."),
    body("items")
      .isArray()
      .withMessage("Items must be an array.")
      .custom((value) => value.length > 0)
      .withMessage("Items cannot be empty."),
    body("items.*.productId")
      .isMongoId()
      .withMessage("Each item must have a valid product ID."),
    body("items.*.quantity")
      .isInt({ gt: 0 })
      .withMessage("Each item must have a valid quantity greater than 0."),
    body("items.*.price")
      .isFloat({ gt: 0 })
      .withMessage("Each item must have a valid price."),
  ];


module.exports = {
    handleErrors,
    validateSignUp,
    validateSignIn,
    handleValidationErrors,
    validate,
    validateGuestOrder,
    validateNewOrder
};
