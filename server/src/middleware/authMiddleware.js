const { verify } = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const Admin = require("../models/admin");
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false,
                message: "Authorization token is required" 
            });
        }

        const token = authHeader.split(" ")[1];

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        // Verify token
        const decoded = verify(token, process.env.JWT_SECRET);

        // Determine if this is an admin or user token
        // Admin tokens have 'isAdmin: true' flag, User tokens don't
        const isAdminToken = decoded.isAdmin === true;
        const userId = decoded._id;

        let account;
        let accountType;

        if (isAdminToken) {
            // Try to find admin first
            account = await Admin.findById(userId);
            accountType = 'admin';
            
            if (!account) {
                return res.status(401).json({ 
                    success: false,
                    message: "Admin not found" 
                });
            }

            // Check admin status
            if (account.status !== "active") {
                return res.status(403).json({ 
                    success: false,
                    message: "Admin account is inactive. Please contact administrator." 
                });
            }

            // Verify role in token matches admin role
            if (decoded.role && decoded.role !== account.role) {
                return res.status(403).json({ 
                    success: false,
                    message: "Access denied. Invalid admin token." 
                });
            }
        } else {
            // Try to find user
            account = await User.findById(userId);
            accountType = 'user';
            
            if (!account) {
                return res.status(401).json({ 
                    success: false,
                    message: "User not found" 
                });
            }

            // Check user status
            if (account.status === "inactive") {
                return res.status(401).json({ 
                    success: false,
                    message: "Account has been suspended, please contact support" 
                });
            }
        }

        // Add account to request object (as both user and specific type)
        req.user = account;
        if (accountType === 'admin') {
            req.admin = account;
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false,
                error: "Invalid token" 
            });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false,
                error: "Token has expired" 
            });
        }
        console.error("Auth middleware error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message || "Internal server error" 
        });
    }
};

// Middleware to check if user is admin (works for both User and Admin models)
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            message: "Access denied. Admin privileges required." 
        });
    }
};

module.exports = { authMiddleware, isAdmin };