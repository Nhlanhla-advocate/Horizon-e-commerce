const User = require('../models/wishList'); 

// Get Wishlist
exports.getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.wishlist);
    } catch (error) {
        next(error);
    }
};

// Add to Wishlist
exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { wishlist: productId } }, // Ensures no duplicate items
            { new: true }
        ).populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.wishlist);
    } catch (error) {
        next(error);
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res, next) => {
        try {
            const { productId } = req.body;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { wishlist: productId }},
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found'});
            }
            res.json(user.wishlist);
        } catch (error) {
            next(error);
        }
    };
