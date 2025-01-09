const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');



// Add item to the cart
exports.addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found'});
        }

        let cart = await Cart.findOne({ userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity, price: product.price });
            }
            cart.totalPrice += product.price * quantity;
        } else {
            cart = new Cart({
                userId,
                items: [{ productId, quantity, price: product.price }],
                totalPrice: product.price * quantity
            });
        }
  
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error });
    }
};

// Removing a single item from the cart
exports.removeFromCart = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const cart = await Cart.findOne({ userId });
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
        const cart = await Cart.findOne({ userId});
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
            const cart = await Cart.findOne({ userId });
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
            const cart = await Cart.findOne({ userId }).populate('items.productId');
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ message: 'Error getting the cart', error });
        }
    };

    // Convert cart items to an order
exports.createOrderFromCart = async (userId) => {
    try {
      const userCart = await Cart.findOne({ userId: userId });
  
      if (!userCart) {
        // throw new Error('Cart not found for this user');
      }
  
   
      const newOrder = new Order({
        userId: userId,
        items: userCart.items,
        totalPrice: userCart.totalPrice,
        status: 'pending',
        createdAt: new Date(),
      });
  
      // Save the order to the database
      await newOrder.save();
  
      // Optionally, clear the cart after order creation
      await Cart.deleteOne({ userId: userId });
  
      return newOrder;
    } catch (error) {
      console.error(error);
    //   throw new Error('Error creating order from cart');
    }
  };
  
  // Get user details
  exports.getUserDetails = async (userId) => {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      console.error(error);
    //   throw new Error('Error retrieving user details');
    }
  };
  
  // Update the cart (add an item)
  exports.addItemToCart = async (userId, item) => {
    try {
      const userCart = await Cart.findOne({ userId: userId });
  
      if (userCart) {
        userCart.items.push(item);
        userCart.totalPrice += item.price; 
        await userCart.save();
      } else {
        // Create a new cart if it doesn't exist
        const newCart = new Cart({
          userId: userId,
          items: [item],
          totalPrice: item.price,
          createdAt: new Date(),
        });
        await newCart.save();
      }
    } catch (error) {
      console.error(error);
    //   throw new Error('Error adding item to cart');
    }
  };
  