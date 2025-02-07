const { verify } = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

const secret = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token is required" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = verify(token, secret);

        // Find user
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check user status
        if (user.status === "inactive") {
            return res.status(401).json({ message: "Account has been suspended, please contact support" });
        }

        // Add user to request object
        req.user = user;
        
        // Proceed to the next middleware
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired" });
        }
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
};

module.exports = { authMiddleware, isAdmin };