const mongoose = require('mongoose');
const Product = require('../models/product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/horizon-ecommerce')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create a sample product
const createProduct = async () => {
  try {
    const product = new Product({
      name: 'Test Product',
      description: 'A test product for cart functionality',
      price: 100,
      category: 'electronics',
      stock: 10,
      specifications: {
        brand: 'Test Brand',
        model: 'Test Model',
        warranty: '1 year'
      }
    });

    const savedProduct = await product.save();
    console.log('Product created successfully:', savedProduct);
    console.log('Product ID to use in cart:', savedProduct._id);
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating product:', error);
    mongoose.connection.close();
  }
};

createProduct(); 