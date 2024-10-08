const { check } = require('express-validator');

// Validation middleware for registration (sign-up)
const validateSignUp = [
    check('username')
        .trim()
        .not().isEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

    check('email')
        .trim()
        .isEmail().withMessage('A valid email is required'),

    check('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

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
    validateInput([
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
    ]),
];

module.exports = {
    validateSignUp,
    validateSignIn,
    validateProfile
};
