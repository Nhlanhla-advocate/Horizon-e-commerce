const Review = require('../models/review');
const Product = require('../models/product');
const mongoose = require('mongoose');

// Input validation middleware
const validateReviewInput = (req, res, next) => {
  const { rating, comment } = req.body;
  
  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 1) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  next();
};

// Post a review for a product
const postReview = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { productId } = req.params;
    const userId = req.user.id; 
    const { rating, comment } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
      createdAt: new Date()
    });

    await review.save({ session });

    // Update the product with new review details
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error('Product not found');
    }

    // Update product's review count and average rating
    product.numReviews += 1;
    product.rating = ((product.rating * (product.numReviews - 1)) + rating) / product.numReviews;

    await product.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in postReview:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error posting review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'

    });
  }
};

// Get user reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('productId', 'name price'); 

    const total = await Review.countDocuments({ userId });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    console.error('Error in getUserReviews:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user reviews',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Edit a review
const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        rating, 
        comment,
        updatedAt: new Date()
      },
      { 
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedReview
    });
  } catch (err) {
    console.error('Error in editReview:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error editing review',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    // Find review and check ownership
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Error in deleteReview:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = {
  postReview,
  getUserReviews,
  editReview,
  deleteReview,
  validateReviewInput
};
