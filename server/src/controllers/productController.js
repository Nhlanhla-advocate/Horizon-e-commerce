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
        search,
        inStock
      } = req.query;

      const query = {};

      // Build filter conditions
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
        .populate('category', 'name')
        .sort({ [sort]: order })
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
      throw new ApiError(500, 'Error fetching products', error);
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
        stockQuantity,
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
        stockQuantity,
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
      throw new ApiError(500, 'Error creating product', error);
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
        stockQuantity,
        specifications,
        metadata,
        status
      } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        throw new ApiError(404, 'Product not found');
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
          stockQuantity,
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
      throw new ApiError(500, 'Error updating product', error);
    }
  }

  // Delete product (soft delete)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        throw new ApiError(404, 'Product not found');
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
      throw new ApiError(500, 'Error deleting product', error);
    }
  }

  // Get related products
  async getRelatedProducts(req, res) {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        throw new ApiError(404, 'Product not found');
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
      throw new ApiError(500, 'Error fetching related products', error);
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
      throw new ApiError(500, 'Error fetching featured products', error);
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { query, category, priceRange } = req.body;

      const searchQuery = {
        status: 'active',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };

      if (category) {
        searchQuery.category = category;
      }

      if (priceRange) {
        searchQuery.price = {
          $gte: priceRange.min,
          $lte: priceRange.max
        };
      }

      const products = await Product.find(searchQuery)
        .populate('category', 'name')
        .limit(20);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      throw new ApiError(500, 'Error searching products', error);
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
      throw new ApiError(500, 'Error bulk updating products', error);
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
        throw new ApiError(404, 'Product not found');
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
}

module.exports = new ProductController();
