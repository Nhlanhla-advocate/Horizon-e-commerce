const Product = require('../models/product');
const Review = require('../models/review');
const User = require('../models/user');
const Order = require('../models/order');
const mongoose = require('mongoose');

class DashboardController {
  // Get dashboard statistics and overview
  async getDashboardStats(req, res) {
    try {
      const [
        totalProducts,
        activeProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        recentOrders,
        topRatedProducts
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ status: 'active' }),
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Product.countDocuments({ stock: { $lt: 10 } }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'username email'),
        Product.find({ status: 'active' })
          .sort({ rating: -1 })
          .limit(5)
          .select('name rating numReviews price')
      ]);

      const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

      return res.json({
        success: true,
        data: {
          overview: {
            totalProducts,
            activeProducts,
            totalUsers,
            totalOrders,
            totalRevenue: revenue,
            lowStockProducts
          },
          recentOrders,
          topRatedProducts
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching dashboard stats: ${error.message}`
      });
    }
  }

  // Get all products for admin management, inactive/deleted
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'createdAt',
        order = 'desc',
        category,
        status,
        search,
        minPrice,
        maxPrice
      } = req.query;

      const query = {};

      if (category) query.category = category;
      if (status) query.status = status;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' }}
        ];
      }

      const products = await Product.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('createdBy', 'username email')
        .populate('updatedBy', 'username email');

      const total = await Product.countDocuments(query);

      return res.json({
        success: true,
        data: products,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching products: ${error.message}`
      });
    }
  }

  // Add new product (for the admin)
  async addProduct(req, res) {
    try {
      const {
        name, 
        category,
        description,
        price,
        stock,
        images = [],
        specifications,
        featured = false,
        status = 'active'
      } = req.body;

      // Validate required fields
      if(!name || !category || !description || !price || stock === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, category, description, price, and stock are required'
        });
      }

      const product = new Product({
        name,
        category,
        description,
        price,
        stock,
        images,
        specifications,
        featured,
        status,
        createdBy: req.user.id
      });

      await product.save();

      return res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error creating product: ${error.message}`
      });
    }
  }

  // Update existing product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const {
        name, 
        category,
        description,
        price,
        stock,
        images,
        specifications,
        featured,
        status,
      } = req.body;

      // Validate product exists
      const existingProduct = await Product.findById(id);

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // Validate category if provided
      if (category) {
        const validCategories = ['jewelry', 'electronics', 'consoles', 'computers'];
        if (!validCategories.includes(category)) {
          return res.status(400).json({
            success: false,
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
          });
        }
      }

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          ...(name && { name }),
          ...(category && { category }),
          ...(description && { description }),
          ...(price && { price }),
          ...(stock !== undefined && { stock }),
          ...(images && { images }),
          ...(specifications && { specifications }),
          ...(featured !== undefined && { featured }),
          ...(status && { status }),
          updatedBy: req.user.id
        },
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error updating product: ${error.message}`
      });
    }
  }

  // Get product reviews for admin review
  async getProductReviews(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

      // Check if the product exists
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
   

      const reviews = await Review.find({ product: id })
        .populate('user', 'username email')
        .sort({ [sort]: order === 'desc' ? -1 : 1 }) 
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Review.countDocuments({ product: id });

      // Calculate average rating
      const ratingStats = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(id) }},
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

      return res.json({
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
            total,
            pages: Math.ceil(total / limit),
            page: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching product reviews: ${error.message}`
      });
    }
  }

  // Delete a specific review (Admin only)
  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          error: `Review not found`
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Delete the review
        await Review.findByIdAndDelete(reviewId, { session });

        // Update product rating and review count
        const product = await Product.findById(review.product).session(session);
        if(product) {
          const remainingReviews = await Review.countDocuments({ product: review.product }, { session });
          if (remainingReviews > 0) {
            const avgRating = await Review.aggregate([
              { $match: { product: review.product }},
             { $group: {_id: null, avgRating: { $avg: '$rating'}}}
            ], { session });

            product.rating = avgRating.length > 0 ? avgRating[0].avgRating : 0;
          } else {
            product.rating = 0;
          }

          product.numReviews = remainingReviews;
          await product.save({ session});
        }

        await session.commitTransaction();
        session.endSession();

        return res.json({
          success: true,
          message: 'Review deleted successfully'
        });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error deleting review: ${error.message}`
      });
    }
  }

  // Bulk operations for products
  async bulkUpdateProducts(req, res) {
    try {
      const { productIds, updateData } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Product IDs array is required'
        });
      }

      const result = await Product.updateMany(
        {_id: { $in: productIds}},
        {
          ...updateData,
          updatedBy: req.user._id,
          updatedAt: new Date()
        }
      );

      return res.json({
        success: true,
        message: `${result.modifiedCount} products updated successfully` ,
        data: {
          matched: result.matchedCount,
          modified: result.modifiedCount
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error bulk updating products: ${error.message}`
      });
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res) {
    try {
      const { threshold = 10 } = req.query;

      const lowStockProducts = await Product.find({
        stock: {$lte: parseInt(threshold)},
        status: 'active'
      }).sort({ stock: 1 });

      return res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching low stock products: ${error.message}`
      });
    }
  }
}


module.exports = new DashboardController();

