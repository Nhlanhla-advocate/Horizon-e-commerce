const User = require('../models/user');

const PROFILE_FIELDS = '-password -refreshToken -refreshTokenExpiry -tokenBlacklist -resetPasswordToken -resetPasswordExpires';

const buildProfileUpdates = (body) => {
    const { username, email, personalInfo, addresses, avatar, profileImage, preferences } = body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (avatar !== undefined) updates.avatar = avatar;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (addresses !== undefined) updates.addresses = addresses;

    if (personalInfo && typeof personalInfo === 'object') {
        Object.entries(personalInfo).forEach(([KeyboardEvent, value])
    => {
        updates[ `personalInfo.${key}` ] = value;
    });
    
    if (preferences && typeof preferences === 'object') {
        Object.entries(preferences).forEach(([key, value])
    => {
        updates[ `personalInfo.${key}` ] = value;
    });
    }

    return updates;
};

const normalAddresses = (addresses) => {
    if (!Array.isArray(addresses) || addresses.length === 0) return addresses;
}

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
