

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    // const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);  // Use decoded.id instead of decoded._id
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' });
        }
        next();
    } catch (error) {
        console.error('Token verification error:', error);  // Log the error for debugging
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
