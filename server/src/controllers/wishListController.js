const Wishlist = require('../models/wishList'); 
const User = require('../models/user'); 
const Product = require('../models/product');

// Get Wishlist
exports.getWishlist = async (req, res, next) => {
    try {
        // console.log('User from request:', req.user);
        const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate('products');
        
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found for this user' });
        }
        
        res.json(wishlist);
    } catch (error) {
        next(error);
    }
};


exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        
        // Check if product exists / productID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the wishlist exists
        let wishlist = await Wishlist.findOne({ userId: req.user._id });

        if (!wishlist) {
            // Create a new wishlist if not found
            wishlist = new Wishlist({
                userId: req.user._id,
                products: [productId]
            });
        } else {
            // Add product to the wishlist if it's not already in it
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
            }
        }

        await wishlist.save();
        
        // Populate with product details / fields
        await wishlist.populate({
            path: 'products',
            select: 'name price description image' 
        });

        // Return the complete wishlist object
        res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        next(error);
    }
};


exports.removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        
        // Find the user's wishlist
        const wishlist = await Wishlist.findOne({ userId: req.user._id });
        
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        
        // Remove the product from the wishlist
        wishlist.products = wishlist.products.filter(
            product => product.toString() !== productId
        );
        
        await wishlist.save();
        
        // Populate the products for the response
        await wishlist.populate({
            path: 'products',
            select: 'name price description image' 
        });
        
        res.status(200).json({
            success: true,
            wishlist
        });
    } catch (error) {
        next(error);
    }
};