const mongoose = require('mongoose');
const Review = require('../models/review');  
const Product = require('../models/product');  

// Review Controller
exports.reviewController = {
  // Get User Reviews
  getUserReviews: async (req, res, next) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Find reviews of the logged-in user
      const reviews = await Review.find({ user: req.user._id })
        .populate('product', 'name')  // Populate the 'product' field with just the product name
        .sort({ createdAt: -1 })      // Sort reviews by creation date with the most recent first
        .skip(skip)                   // skip the previous pages' reviews
        .limit(limit);                // Limit the number of reviews per page

      // Count total reviews for the user
      const total = await Review.countDocuments({ user: req.user._id });

      // Send response with pagination info
      res.json({
        success: true,
        reviews,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      });
    } catch (error) {
      next(error);
    }
  },

  // Edit Review
  editReview: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      // Find the review by ID and the logged-in user
      const review = await Review.findOne({ _id: reviewId, user: req.user._id }).session(session);
      if (!review) {
        throw new Error('Review not found or you are not authorized to edit this review');
      }

      const oldRating = review.rating;
      review.rating = rating;
      review.comment = comment;

      // Save the updated review
      await review.save({ session });

      // Find the associated product to update its rating
      const product = await Product.findById(review.product).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      // Update product's sum of ratings and average rating
      product.sumRatings = product.sumRatings - oldRating + rating;
      product.avgRating = product.sumRatings / product.totalRatings;

      // Save the updated product
      await product.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send the updated review in response
      res.json({ success: true, review });
    } catch (error) {
      // Abort the transaction in case of error
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  },

  // Delete Review
  deleteReview: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { reviewId } = req.params;

      // Find and delete the review based on the reviewId and the user
      const review = await Review.findOneAndDelete({ _id: reviewId, user: req.user._id }).session(session);
      if (!review) {
        throw new Error('Review not found or you are not authorized to delete this review');
      }

      // Find the associated product to update its ratings
      const product = await Product.findById(review.product).session(session);
      if (!product) {
        throw new Error('Product not found');
      }

      // Update product's total ratings and average rating
      product.totalRatings -= 1;
      product.sumRatings -= review.rating;
      product.avgRating = product.totalRatings > 0 ? product.sumRatings / product.totalRatings : 0;

      // Save the updated product
      await product.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send success response
      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      // Abort transaction in case of an error
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  }
};

module.exports = new userReviewController();