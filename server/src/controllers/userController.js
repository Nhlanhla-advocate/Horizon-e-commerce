const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');
const Review = require('../models/review');
const { body,validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Input validation middleware
const validateInput = (validations)=> {
    return async(req, res, next) => {
        await Promise.all(validation.map(validation => validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next();
        }
        res.status(400).json({errors:errors.array()});
    };
};

// Error handling middleware
const handleErrors = (err, req, res, next) => {
    console.error(err);
    if (err instanceof mongoose.Error.CastError) {
        return res.status(404).json({ message: 'Resource not found'});
    }
    res.status(500).json({ message:'An unexpected error occurred', error:err.message});
};

// Getting the user profile
exports.getProfile = async(req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if(!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Update profile
// exports.updateProfile = [
//     validateInput([
//         body
//     ])
// ]



