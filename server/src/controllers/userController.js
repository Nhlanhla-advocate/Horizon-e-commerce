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
        Object.entries(personalInfo).forEach(([key, value]) => {
            updates[`personalInfo.${key}`] = value;
        });
    }

    if (preferences && typeof preferences === 'object') {
        Object.entries(preferences).forEach(([key, value]) => {
            updates[`preferences.${key}`] = value;
        });
    }

    return updates;
};

const normalizeAddresses = (addresses) => {
    if (!Array.isArray(addresses) || addresses.length === 0) return addresses;

    const defaultIndex = addresses.findIndex((address) => address.isDefault);
    const resolvedDefaultIndex = defaultIndex === -1 ? 0 : defaultIndex;

    return addresses.map((address, index) => ({
        ...address,
        isDefault: index === resolvedDefaultIndex
    }));
};

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

// Updating the user profile
const updateUser = async (req, res, next) => {
    try {
        const updates = buildProfileUpdates(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid profile fields provided' });
        }

        if (updates.email) {
            const existingUser = await User.findOne({
                email: updates.email,
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        if (updates.username) {
            const existingUser = await User.findOne({
                username: updates.username,
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already in use' });
            }
        }

        if (updates.addresses) {
            updates.addresses = normalizeAddresses(updates.addresses);
        }

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

const fetchProfile = (userId) => User.findById(userId).select(PROFILE_FIELDS);

// Add a single address
const addAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.push(req.body);
        const normalized = normalizeAddresses(
            user.addresses.map((address) => (
                typeof address.toObject === 'function' ? address.toObject() : address
            ))
        );
        user.set('addresses', normalized);
        await user.save();

        const updatedUser = await fetchProfile(req.user._id);
        res.status(201).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        Object.entries(req.body).forEach(([key, value]) => {
            if (value !==undefined) {
                address[key] = value;
            }
        });

        if (req.body.isDefault === true) {
            user.addresses.forEach((addr) => {
                addr.isDefault = addr._id.toString() === addressId;
            });
        }

        await user.save();

        const updatedUser = await fetchProfile(req.user._id);
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

//Delete a single address
const deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = address.isDefault;
        user.addresses.pull(addressId);

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        const updatedUser = await fetchProfile(req.user._id);
        res.json(updatedUser);
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
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress
};
