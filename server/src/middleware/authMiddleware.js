const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const User = require('../models/user');

const authMiddleware = (role) => async (req, res, next) => {
    try {
        // Authorization header
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user based on the role
        if (role === 'admin') {
            const admin = await Admin.findById(decoded._id);
            if (!admin) throw new Error('Admin not found');
            req.admin = admin;
        } else if (role === 'customer') {
            const user = await User.findById(decoded._id);
            if (!user) throw new Error('Access denied. User not found');
            req.user = user;
        } else {
            return res.status(400).json({error: 'Invalid role'});
        }

        // Route handler
    } catch (error) {
        if (error.message === 'No token provided') {
            return res.status(401).json({ error: 'No token provided'});
        } else if (error.message === 'jwt malformed'){
            return res.status(401).json({ error: 'Invalid token'});
        } else if (error.message === 'Admin not found' || error.message === 'User not found') {
            return res.status(401).json({ error: 'Authentication failed'});
        }
            return res.status(500).json({ error: 'Internal server error'});
    }
};

module.exports = authMiddleware