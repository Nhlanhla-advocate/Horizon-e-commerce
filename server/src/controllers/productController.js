const Product = require('../models/product');
const Review = require('../models/review');
const mongoose = require('mongoose');

class ProductController {
  // List products with filtering, sorting, and pagination
  async listProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        category,
        minPrice,
        maxPrice,
        inStock
      } = req.query;

      const query = { status: 'active' };

      // Apply filters
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }
      if (inStock === 'true') query.stockQuantity = { $gt: 0 };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const products = await Product.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      res.json({
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
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get single product details
  async getProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id)
        .populate('category', 'name')
        .populate('reviews.user', 'name email');

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      // Increment view count
      product.viewCount += 1;
      await product.save();

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      throw new ApiError(500, 'Error fetching product', error);
    }
  }

  // Create new product
  async createProduct(req, res) {
    try {
      const {
        name,
        description,
        price,
        category,
        stock,
        specifications,
        metadata
      } = req.body;

      // Handle image uploads
      let productImages = [];
      if (req.files && req.files.length > 0) {
        productImages = await Promise.all(
          req.files.map(file => uploadToCloud(file.path))
        );
      }

      const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        specifications,
        metadata,
        images: productImages,
        createdBy: req.user._id
      });

      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error creating product: ${error}`
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const {
        name,
        description,
        price,
        category,
        stock,
        specifications,
        metadata,
        status
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${error}`
        });
      }

      // Handle image updates
      let productImages = product.images;
      if (req.files && req.files.length > 0) {
        const newImages = await Promise.all(
          req.files.map(file => uploadToCloud(file.path))
        );
        productImages = [...productImages, ...newImages];
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name,
          description,
          price,
          category,
          stock,
          specifications,
          metadata,
          status,
          images: productImages,
          updatedBy: req.user._id
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error updating product: ${error}`
      });
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${error}`
        });
      }

      // Soft delete by updating status
      product.status = 'deleted';
      product.deletedAt = new Date();
      product.deletedBy = req.user._id;
      await product.save();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error deleting product: ${error}`
      });
    }
  }

  // Get related products
  async getRelatedProducts(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${error}`
        });
      }

      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'active'
      })
        .limit(4)
        .populate('category', 'name');

      res.json({
        success: true,
        data: relatedProducts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching related products: ${error}`
      });
    }
  }

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const featuredProducts = await Product.find({
        featured: true,
        status: 'active',
        stockQuantity: { $gt: 0 }
      })
        .populate('category', 'name')
        .limit(8);

      res.json({
        success: true,
        data: featuredProducts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error fetching related products: ${error}`
      });
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { query } = req.query;
      const products = await Product.find({
        $text: { $search: query },
        status: 'active'
      });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error searching product: ${error}`
      });
    }
  }

  // Bulk update products
  async bulkUpdateProducts(req, res) {
    try {
      const { products } = req.body;

      const updatedProducts = await Promise.all(
        products.map(async product => {
          const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            { ...product },
            { new: true, runValidators: true }
          );
          return updatedProduct;
        })
      );

      res.json({
        success: true,
        data: updatedProducts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Error bulk updating products: ${error}`
      });
    }
  }

  // Post Product Review
  async postReview(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { productId, rating, comment } = req.body;

      // Create a new review
      const review = new Review({
        user: req.user._id,  // Assuming `req.user` holds the logged-in user's info
        product: productId,
        rating,
        comment
      });

      await review.save({ session });

      // Update the product with new review details
      const product = await Product.findById(productId).session(session);
      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${error}`
        });
      }

      // Update product's review count and average rating
      product.numReviews += 1;
      product.rating = ((product.rating * (product.numReviews - 1)) + rating) / product.numReviews;

      await product.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Send response
      res.status(201).json({ success: true, message: 'Review added successfully' });
    } catch (error) {
      // Abort transaction in case of any errors
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await Product.find({
        category,
        status: 'active'
      });

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Get products by category: ${error}`
      });
    }
  }
}

module.exports = new ProductController();
