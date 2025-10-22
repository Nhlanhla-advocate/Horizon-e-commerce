const Product = require('../models/product');
const Review = require('../models/review');
const User = require('../models/user');
const Order = require('../models/order');
const Dashboard = require('../models/dashboard');
const mongoose = require('mongoose');

class DashboardController {
  // Get dashboard statistics and overview (with caching)
  async getDashboardStats(req, res) {
    try {
      // Check if we should force refresh
      const forceRefresh = req.query.refresh === 'true';

      // Try to get cached data first (unless force refresh)
      if (!forceRefresh) {
        const cachedStats = await Dashboard.getDashboardStats();
        if (cachedStats) {
          return res.json({
            success: true,
            data: {
              overview: cachedStats.overview,
              recentOrders: cachedStats.recentOrders,
              topRatedProducts: cachedStats.topRatedProducts
            },
            cached: true,
            lastUpdated: cachedStats.lastUpdated
          });
        }
      }

      // Cache miss or force refresh - calculate fresh data
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
          { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]),
        Product.countDocuments({ stock: { $lt: 10 } }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('customerId', 'username email'),
        Product.find({ status: 'active' })
          .sort({ rating: -1 })
          .limit(5)
          .select('name rating numReviews price')
      ]);

      const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

      const statsData = {
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
      };

      // Save to cache for next time
      await Dashboard.updateDashboardStats(statsData);

      return res.json({
        success: true,
        data: statsData,
        cached: false,
        lastUpdated: new Date()
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

      // Invalidate dashboard cache since product count changed
      await this.invalidateCache();

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

      // Invalidate cache if stock or status changed (affects dashboard stats)
      if (stock !== undefined || status) {
        await this.invalidateCache();
      }

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

      // Invalidate cache after bulk update
      if (result.modifiedCount > 0) {
        await this.invalidateCache();
      }

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
      const { threshold = 10 } = req.query; // 10 is the default threshold for low stock products

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

  // Get top selling products based on order data
  async getTopSellingProducts(req, res) {
    try {
      const { 
        limit = 5, // 5 is the default limit for top selling products
        days = 30,
        category,
        minRevenue,
        minQuantity
      } = req.query;

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Build aggregation pipeline
      const matchStage = {
        status: 'completed',
        createdAt: { $gte: startDate }
      };

      const topSellingProducts = await Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            orderCount: { $sum: 1 },
            lastOrderDate: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $match: {
            'productDetails.status': 'active',
            ...(category && { 'productDetails.category': category }),
            ...(minRevenue && { totalRevenue: { $gte: parseFloat(minRevenue) } }),
            ...(minQuantity && { totalSold: { $gte: parseInt(minQuantity) } })
          }
        },
        {
          $project: {
            _id: '$productDetails._id',
            name: '$productDetails.name',
            category: '$productDetails.category',
            price: '$productDetails.price',
            stock: '$productDetails.stock',
            totalSold: 1,
            totalRevenue: 1,
            orderCount: 1,
            averageOrderValue: { $divide: ['$totalRevenue', '$orderCount'] },
            lastOrderDate: 1
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: parseInt(limit) }
      ]);

      return res.json({
        success: true,
        data: topSellingProducts,
        meta: {
          period: `Last ${days} days`,
          count: topSellingProducts.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching top selling products: ${error.message}`
      });
    }
  }

  // Get low selling products (products with poor sales performance)
  async getLowSellingProducts(req, res) {
    try {
      const { 
        limit = 10, 
        days = 30,
        category,
        maxSales = 5
      } = req.query;

      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get all products with their sales data
      const productsWithSales = await Order.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startDate }
          } 
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
            lastOrderDate: { $max: '$createdAt' }
          }
        }
      ]);

      // Create a map of product sales
      const salesMap = new Map();
      productsWithSales.forEach(item => {
        salesMap.set(item._id.toString(), item);
      });

      // Get all active products
      const allProducts = await Product.find({ 
        status: 'active',
        ...(category && { category })
      }).select('name category price stock createdAt');

      // Identify low selling products
      const lowSellingProducts = allProducts
        .map(product => {
          const sales = salesMap.get(product._id.toString());
          const totalSold = sales ? sales.totalSold : 0;
          const totalRevenue = sales ? sales.totalRevenue : 0;
          const lastOrderDate = sales ? sales.lastOrderDate : null;
          
          const daysSinceCreated = Math.floor(
            (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)
          );

          return {
            _id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            totalSold,
            totalRevenue,
            createdAt: product.createdAt,
            daysSinceCreated,
            lastOrderDate
          };
        })
        .filter(product => product.totalSold <= parseInt(maxSales))
        .sort((a, b) => a.totalSold - b.totalSold)
        .slice(0, parseInt(limit));

      return res.json({
        success: true,
        data: lowSellingProducts,
        meta: {
          period: `Last ${days} days`,
          count: lowSellingProducts.length,
          maxSalesThreshold: maxSales
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching low selling products: ${error.message}`
      });
    }
  }

  // Get low stock alerts with product performance data
  async getLowStockAlerts(req, res) {
    try {
      const { 
        threshold = 10,
        days = 30,
        category
      } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get sales data for products
      const salesData = await Order.aggregate([
        { 
          $match: { 
            status: 'completed',
            createdAt: { $gte: startDate }
          } 
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      // Create sales map
      const salesMap = new Map();
      salesData.forEach(item => {
        salesMap.set(item._id.toString(), {
          totalSold: item.totalSold,
          orderCount: item.orderCount,
          averageDailySales: item.totalSold / parseInt(days)
        });
      });

      // Get low stock products
      const lowStockProducts = await Product.find({
        stock: { $lte: parseInt(threshold) },
        status: 'active',
        ...(category && { category })
      }).select('name category stock price');

      // Enrich with performance data
      const alerts = lowStockProducts.map(product => {
        const sales = salesMap.get(product._id.toString());
        const totalSold = sales ? sales.totalSold : 0;
        const averageDailySales = sales ? sales.averageDailySales : 0;
        
        // Calculate estimated days until out of stock
        let estimatedDaysUntilOutOfStock = null;
        if (averageDailySales > 0) {
          estimatedDaysUntilOutOfStock = Math.floor(product.stock / averageDailySales);
        }

        // Determine alert level
        let alertLevel = 'low';
        if (product.stock === 0) {
          alertLevel = 'critical';
        } else if (estimatedDaysUntilOutOfStock !== null && estimatedDaysUntilOutOfStock <= 7) {
          alertLevel = 'critical';
        } else if (estimatedDaysUntilOutOfStock !== null && estimatedDaysUntilOutOfStock <= 14) {
          alertLevel = 'warning';
        } else if (product.stock <= 5) {
          alertLevel = 'warning';
        }

        return {
          _id: product._id,
          name: product.name,
          category: product.category,
          stock: product.stock,
          price: product.price,
          reorderLevel: threshold,
          totalSold,
          averageDailySales: averageDailySales.toFixed(2),
          estimatedDaysUntilOutOfStock,
          alertLevel,
          status: product.status
        };
      }).sort((a, b) => {
        // Sort by alert level priority and then by stock
        const alertPriority = { critical: 0, warning: 1, low: 2 };
        if (alertPriority[a.alertLevel] !== alertPriority[b.alertLevel]) {
          return alertPriority[a.alertLevel] - alertPriority[b.alertLevel];
        }
        return a.stock - b.stock;
      });

      // Calculate summary statistics
      const summary = {
        total: alerts.length,
        critical: alerts.filter(a => a.alertLevel === 'critical').length,
        warning: alerts.filter(a => a.alertLevel === 'warning').length,
        low: alerts.filter(a => a.alertLevel === 'low').length,
        outOfStock: alerts.filter(a => a.stock === 0).length
      };

      return res.json({
        success: true,
        data: alerts,
        summary,
        meta: {
          threshold,
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching low stock alerts: ${error.message}`
      });
    }
  }

  // Get product performance summary
  async getProductPerformance(req, res) {
    try {
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const [
        topSelling,
        lowSelling,
        lowStockAlerts,
        categoryPerformance
      ] = await Promise.all([
        // Top 5 selling products
        Order.aggregate([
          { 
            $match: { 
              status: 'completed',
              createdAt: { $gte: startDate }
            } 
          },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          { $match: { 'product.status': 'active' } },
          {
            $project: {
              name: '$product.name',
              category: '$product.category',
              totalSold: 1,
              totalRevenue: 1
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 }
        ]),

        // Products with no or very low sales
        Product.countDocuments({ status: 'active' }),

        // Low stock count
        Product.countDocuments({ stock: { $lte: 10 }, status: 'active' }),

        // Category performance
        Order.aggregate([
          { 
            $match: { 
              status: 'completed',
              createdAt: { $gte: startDate }
            } 
          },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          {
            $group: {
              _id: '$product.category',
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
              productCount: { $addToSet: '$product._id' }
            }
          },
          {
            $project: {
              category: '$_id',
              totalSold: 1,
              totalRevenue: 1,
              productCount: { $size: '$productCount' }
            }
          },
          { $sort: { totalRevenue: -1 } }
        ])
      ]);

      return res.json({
        success: true,
        data: {
          topSellingProducts: topSelling,
          lowStockCount: lowStockAlerts,
          categoryPerformance,
          totalActiveProducts: lowSelling
        },
        meta: {
          period: `Last ${days} days`
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching product performance: ${error.message}`
      });
    }
  }

  // CACHE MANAGEMENT METHODS
  
  // Manually refresh dashboard cache
  async refreshDashboardCache(req, res) {
    try {
      // Clear existing cache
      await Dashboard.clearCache();

      // Trigger fresh calculation by calling getDashboardStats with force refresh
      req.query.refresh = 'true';
      return this.getDashboardStats(req, res);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error refreshing cache: ${error.message}`
      });
    }
  }

  // Clear dashboard cache (useful for testing or manual intervention)
  async clearDashboardCache(req, res) {
    try {
      await Dashboard.clearCache();
      
      return res.json({
        success: true,
        message: 'Dashboard cache cleared successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error clearing cache: ${error.message}`
      });
    }
  }

  // Get cache status and metadata
  async getCacheStatus(req, res) {
    try {
      const cachedData = await Dashboard.findOne();
      
      if (!cachedData) {
        return res.json({
          success: true,
          cached: false,
          message: 'No cache exists yet'
        });
      }

      const now = new Date();
      const cacheAge = Math.floor((now - cachedData.lastUpdated) / 1000); // in seconds
      const cacheExpirySeconds = cachedData.cacheExpiry * 60;
      const isExpired = cacheAge > cacheExpirySeconds;

      return res.json({
        success: true,
        cached: true,
        cacheStatus: {
          lastUpdated: cachedData.lastUpdated,
          cacheAgeSeconds: cacheAge,
          cacheExpirySeconds: cacheExpirySeconds,
          isExpired: isExpired,
          timeUntilExpiry: isExpired ? 0 : cacheExpirySeconds - cacheAge
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Error fetching cache status: ${error.message}`
      });
    }
  }

  // Helper method to invalidate cache (called internally by data-modifying operations)
  async invalidateCache() {
    try {
      await Dashboard.clearCache();
      console.log('Dashboard cache invalidated');
    } catch (error) {
      console.error('Error invalidating cache:', error);
      // Don't throw - cache invalidation failure shouldn't break the main operation
    }
  }
}


module.exports = new DashboardController();

