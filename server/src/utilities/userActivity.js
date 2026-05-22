const User = require('../models/user');

const recordUserLogin = (user) => {
    const now = new Date();
    user.activity = user.activity || {};
    user.activity.lastLoginAt = now;
    user.activity.lastActiveAt = now;
    user.activity.loginCount = (user.activity.loginCount || 0) + 1;
};

const recordUserActive = (user) => {
    user.activity = user.activity || {};
    user.activity.lastActiveAt = new Date();
};

const recordUserOrder = async (userId) => {
    if (!userId) return;

    await User.findByIdAndUpdate(userId, {
        $set: { 'activity.lastOrderAt': new Date() },
        $inc: { 'activity.orderCount': 1 }
    });
};

module.exports = {
    recordUserLogin,
    recordUserActive,
    recordUserOrder
};
