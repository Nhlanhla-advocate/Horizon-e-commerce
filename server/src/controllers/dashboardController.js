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
}

module.exports = new DashboardController();

