const User = require('../models/user');

const PROFILE_FIELDS = '-password -refreshToken -refreshTokenExpiry -tokenBlacklist -resetPasswordToken -resetPasswordExpires';

// Getting the user profile
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select(PROFILE_FIELDS);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};



        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select(PROFILE_FIELDS);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Change password from profile settings
const changePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// New function to get user details
exports.getUserDetails = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    getUser,
    updateUser,
    changePassword
};
