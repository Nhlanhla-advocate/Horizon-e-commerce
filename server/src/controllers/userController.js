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

// Check if email is already in use
try {
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id }});
if (existingUser) {
    return res.status(400).json({ message: 'Email is already in use' });
}

const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { username, email, address }},
    { new: true, runValidators: true }
).select('-password');

if (!user) {
    return res.status(404).json({ message: 'User not found' });
}

res.json(user);
} catch (error) {
    next(error);
}

// Get order history
exports.getOrderHistory = async(req,res,next) => {
    try {
        const page = parseInt(req.query.page) ||1;
        const limit = parseInt(req.query.limit) ||10;
        const skip = (page - 1) * limit;
    
const orders = await Order.find({ user: req.user._id })
.sort({ createdAt: -1 })
.skip(skip)
.limit(limit)
.populate('items.product', 'name price');

const total = await Order.countDocuments({ user: req.user._id });

res.json({
    orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalOrders: total
});
} catch (error) {
    next(error);
}
};

// Wishlist
exports.addToWishlist = [
    validateInput([
        body('productId').isMongoId().withMessage('Invalid product ID')
    ]),
    async (req, res, next) => {
        try {
            const { productId } = req.body;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $addToSet: { wishlist: productId }},
                { new: true }
            );

            res.json(user.wishlist);
        } catch (error) {
            next(error);
        }
    }
];

// Remove from wishlist
exports.removeFromWishlist = [
    validateInput([
        body('productId').isMongoId().withMessage('Invalid product ID')
    ]),
    async (req, res, next) => {
        try {
            const { productId } = req.body;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { wishlist: productId }},
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found'});
            }
            res.json(user.wishlist);
        } catch (error) {
            next(error);
        }
    }
];

// Get Wishlist
exports.getWishlist = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate('wishlist');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user.wishlist);
    } catch (error) {
      next(error);
    }
  };
  
  // Post Product Review
  exports.postReview = [
    validateInput([
      body('productId').isMongoId().withMessage('Invalid product ID'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('comment').optional().trim().isLength({ min: 1 }).withMessage('Comment cannot be empty if provided')
    ]),
    async (req, res, next) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { productId, rating, comment } = req.body;
  
        const review = new Review({
          user: req.user._id,
          product: productId,
          rating,
          comment
        });
  
        await review.save({ session });
  
        // Update product's average rating
        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw new Error('Product not found');
        }
  
        product.totalRatings += 1;
        product.sumRatings += rating;
        product.avgRating = product.sumRatings / product.totalRatings;
  
        await product.save({ session });
  
        await session.commitTransaction();
        session.endSession();
  
        res.status(201).json(review);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
      }
    }
  ];
  
  // Edit Review
  exports.editReview = [
    validateInput([
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
      body('comment').optional().trim().isLength({ min: 1 }).withMessage('Comment cannot be empty if provided')
    ]),
    async (req, res, next) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
  
        const review = await Review.findOne({ _id: reviewId, user: req.user._id }).session(session);
  
        if (!review) {
          throw new Error('Review not found or not authorized');
        }
  
        const oldRating = review.rating;
        review.rating = rating;
        review.comment = comment;
  
        await review.save({ session });
  
        // Update product's average rating
        const product = await Product.findById(review.product).session(session);
        if (!product) {
          throw new Error('Product not found');
        }
  
        product.sumRatings = product.sumRatings - oldRating + rating;
        product.avgRating = product.sumRatings / product.totalRatings;
  
        await product.save({ session });
  
        await session.commitTransaction();
        session.endSession();
  
        res.json(review);
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
      }
    }
  ];
  
  // Delete Review
  exports.deleteReview = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { reviewId } = req.params;
  
      const review = await Review.findOneAndDelete({ _id: reviewId, user: req.user._id }).session(session);
  
      if (!review) {
        throw new Error('Review not found or not authorized');
      }
  
      // Update product's average rating
      const product = await Product.findById(review.product).session(session);
      if (!product) {
        throw new Error('Product not found');
      }
  
      product.totalRatings -= 1;
      product.sumRatings -= review.rating;
      product.avgRating = product.totalRatings > 0 ? product.sumRatings / product.totalRatings : 0;
  
      await product.save({ session });
  
      await session.commitTransaction();
      session.endSession();
  
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  };
  
  // Get User Reviews
  exports.getUserReviews = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const reviews = await Review.find({ user: req.user._id })
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const total = await Review.countDocuments({ user: req.user._id });
  
      res.json({
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    getOrderHistory: exports.getOrderHistory,
    addToWishlist: exports.addToWishlist,
    removeFromWishlist: exports.removeFromWishlist,
    getWishlist: exports.getWishlist,
    postReview: exports.postReview,
    editReview: exports.editReview,
    deleteReview: exports.deleteReview,
    getUserReviews: exports.getUserReviews,
    handleErrors
  };



