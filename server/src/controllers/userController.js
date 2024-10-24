const User = require('../models/user');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Input validation middleware
const validateInput = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    };
};

// Error handling middleware
const handleErrors = (err, req, res, next) => {
    console.error(err);
    if (err instanceof mongoose.Error.CastError) {
        return res.status(404).json({ message: 'Resource not found' });
    }
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
};

// Getting the user profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Updating the user profile
const updateProfile = async (req, res, next) => {
    const { username, email, address } = req.body;

    try {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { username, email, address } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Posting a review (placeholder function)
const postReview = async (req, res, next) => {
    // Implement review posting logic here
    res.status(501).json({ message: 'Review posting not implemented yet' });
};

module.exports = {
    validateInput,
    handleErrors,
    getProfile,
    updateProfile,
    postReview
};