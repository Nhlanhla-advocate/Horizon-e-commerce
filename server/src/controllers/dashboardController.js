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
}

module.exports = new DashboardController();

