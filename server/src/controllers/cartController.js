const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const mongoose = require('mongoose');



// Add item to the cart
exports.addToCart = async (req, res) => {
    const { userId, productId, quantity, items } = req.body;
    try {
        console.log(`Attempting to add product to cart for user ${userId}`);
        
        // Handle both new and old request formats
        let productIdToAdd, quantityToAdd;
        
        if (items && Array.isArray(items) && items.length > 0) {
            // Old format with items array
            productIdToAdd = items[0].productId;
            quantityToAdd = items[0].quantity || 1;
        } else {
            // New format with direct productId
            productIdToAdd = productId;
            quantityToAdd = quantity || 1;
        }
        
        // Check if productId is provided
        if (!productIdToAdd) {
            return res.status(400).json({ 
                message: 'Product ID is required',
                suggestion: 'Send productId directly in the request body or within an items array'
            });
        }
        
        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productIdToAdd)) {
            return res.status(400).json({ 
                message: 'Invalid product ID format',
                receivedId: productIdToAdd,
                suggestion: 'Product ID should be a 24-character hexadecimal string'
            });
        }
        
        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ 
                message: 'User ID is required',
                suggestion: 'Send userId in the request body'
            });
        }
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                message: 'Invalid user ID format',
                receivedId: userId,
                suggestion: 'User ID should be a 24-character hexadecimal string'
            });
        }
        
        // Check if quantity is valid
        if (quantityToAdd < 1) {
            return res.status(400).json({ 
                message: 'Valid quantity is required (minimum 1)'
            });
        }
        
        const product = await Product.findById(productIdToAdd);
        if (!product) {
            return res.status(404).json({ 
                message: 'Product not found',
                productId: productIdToAdd,
                suggestion: 'Please check if the product ID is correct or create the product first'
            });
        }

        let cart = await Cart.findOne({ customerId: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productIdToAdd);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantityToAdd;
            } else {
                cart.items.push({ 
                    productId: productIdToAdd, 
                    quantity: quantityToAdd, 
                    price: product.price,
                    name: product.name // Add the product name
                });
            }
            cart.totalPrice += product.price * quantityToAdd;
        } else {
            cart = new Cart({
                customerId: userId, // Use customerId instead of userId
                items: [{ 
                    productId: productIdToAdd, 
                    quantity: quantityToAdd, 
                    price: product.price,
                    name: product.name // Add the product name
                }],
                totalPrice: product.price * quantityToAdd
            });
        }
  
        await cart.save();
        res.status(200).json({
            message: 'Item added to cart successfully',
            cart
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ 
            message: 'Error adding item to cart', 
            error: error.message 
        });
    }
};

// Removing a single item from the cart
exports.removeFromCart = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const cart = await Cart.findOne({ customerId: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            const item = cart.items[itemIndex];
            cart.totalPrice -= item.price * item.quantity;
            cart.items.splice(itemIndex, 1);
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: 'Item not found in the cart'});
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from the cart', error});
    }
};

// Remove multiple items from the cart
exports.removeMultipleItems = async (req, res) => {
    const { userId, productIds } = req.body;

    try {
        const cart = await Cart.findOne({ customerId: userId});
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found'});
        }

        productIds.forEach(productId => {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (itemIndex > -1) {
                const item = cart.items[itemIndex];
                cart.totalPrice -= item.price * item.quantity;
                cart.items.splice(itemIndex, 1);
            }
        });
        
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing multiple items from the cart', error});
    }
};

    // Clear the cart
    exports.clearCart = async (req, res) => {
        const { userId } = req.body;

        try {
            const cart = await Cart.findOne({ customerId: userId });
            if (!cart) {
            return res.status(404).json({ message: 'Cart not found'});
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing the cart', error });
    }
 };

    // Get customer cart and make it persistent even when a user logs out
    exports.getCart = async (req, res) => {
        const { userId } = req.params;

        try {
            const cart = await Cart.findOne({ customerId: userId }).populate('items.productId');
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: 'Error getting the cart', error });
        }
    };

  
  // Update the cart (add an item)
  exports.addItemToCart = async (userId, item) => {
    try {
      const userCart = await Cart.findOne({ customerId: userId });
  
      if (userCart) {
        userCart.items.push(item);
        userCart.totalPrice += item.price; 
        await userCart.save();
      } else {
        // Create a new cart if it doesn't exist
        const newCart = new Cart({
          customerId: userId,
          items: [item],
          totalPrice: item.price,
          createdAt: new Date(),
        });
        await newCart.save();
      }
    } catch (error) {
      console.error(error);
    }
  };
  
// Create order from cart
exports.createOrderFromCart = async (userId) => {
    try {
        // Find the user's cart
        const cart = await Cart.findOne({ customerId: userId }).populate('items.productId');
        if (!cart) {
            throw new Error('Cart not found');
        }

        if (cart.items.length === 0) {
            throw new Error('Cart is empty');
        }

        // Create order items from cart items
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        // Create the order
        const order = new Order({
            customerId: userId,
            items: orderItems,
            totalPrice: cart.totalPrice,
            status: 'pending',
            shippingAddress: {} // You might want to get this from the user's profile
        });

        // Save the order
        await order.save();

        // Clear the cart
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return order;
    } catch (error) {
        console.error('Error creating order from cart:', error);
        throw error;
    }
};
  