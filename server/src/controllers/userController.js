const User = require('../models/user');

// Getting the user profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Updating the user profile
const updateProfile = async (req, res, next) => {
    const { username, email, address } = req.body;

    try {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { username, email, address } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile
};