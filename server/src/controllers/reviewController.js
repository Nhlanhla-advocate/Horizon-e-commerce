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
// Note: Avoid mongoose transactions here — they require a MongoDB replica set and fail on typical local standalone instances.
const postReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id || req.user.id;
    const { comment } = req.body;
    const rating = Number(req.body?.rating);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 1) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: userId
    });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment: comment.trim()
    });

    await review.save();

    const product = await Product.findById(productId);
    if (!product) {
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({ message: 'Product not found' });
    }

    try {
      const prevCount = Number(product.numReviews || 0);
      const prevRating = Number(product.rating || 0);
      product.numReviews = prevCount + 1;
      product.rating =
        prevCount === 0
          ? rating
          : (prevRating * prevCount + rating) / product.numReviews;

      await product.save();
    } catch (productErr) {
      await Review.findByIdAndDelete(review._id);
      throw productErr;
    }

    res.status(201).json({ success: true, message: 'Review added successfully' });
  } catch (error) {
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

    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('product', 'name price'); 

    const total = await Review.countDocuments({ user: userId });

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

    if (review.user.toString() !== userId) {
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

    if (review.user.toString() !== userId) {
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

// Get all reviews for a specific product (public endpoint)
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'username')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    // Calculate rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          rating: product.rating,
          numReviews: product.numReviews
        },
        reviews,
        ratingStats: ratingStats.length > 0 ? ratingStats[0] : {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: []
        },
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (err) {
    console.error('Error in getProductReviews:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product reviews',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

module.exports = {
  postReview,
  getUserReviews,
  editReview,
  deleteReview,
  getProductReviews,
  validateReviewInput
};
