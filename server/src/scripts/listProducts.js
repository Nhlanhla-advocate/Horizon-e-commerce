const mongoose = require('mongoose');
const Product = require('../models/product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/horizon-ecommerce')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// List all products
const listProducts = async () => {
  try {
    const products = await Product.find();
    
    if (products.length === 0) {
      console.log('No products found in the database.');
    } else {
      console.log(`Found ${products.length} products:`);
      products.forEach(product => {
        console.log(`- ID: ${product._id}`);
        console.log(`  Name: ${product.name}`);
        console.log(`  Price: ${product.price}`);
        console.log(`  Category: ${product.category}`);
        console.log('---');
      });
    }
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error listing products:', error);
    mongoose.connection.close();
  }
};

listProducts(); 