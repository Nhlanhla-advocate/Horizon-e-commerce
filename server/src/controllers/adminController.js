const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Sign In
exports.adminSignIn = async (req, res) => {
    try {
        // Check JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ 
                success: false,
                error: "Server configuration error" 
            });
        }

        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "Email and password are required" 
            });
        }

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                error: "Admin not found" 
            });
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            return res.status(403).json({ 
                success: false,
                error: "Admin account is inactive. Please contact administrator." 
            });
        }

        // Verify password using the model's method or bcrypt directly
        const match = await admin.comparePassword(password);
        if (!match) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid credentials" 
            });
        }

        // Update last login timestamp
        admin.lastLogin = new Date();
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                _id: admin._id, 
                email: admin.email,
                role: admin.role || "admin",
                isAdmin: true // Flag to distinguish admin tokens
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // Extended to 24h for admin convenience
        );

        // Return success response with admin info (excluding password)
        res.json({ 
            success: true,
            token, 
            role: admin.role || "admin",
            admin: {
                _id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                lastLogin: admin.lastLogin
            }
        });

    } catch (error) {
        console.error("Admin sign in error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error", 
            message: error.message 
        });
    }
};

// Admin Sign Out
exports.adminSignOut = async (req, res) => {
    try {
        // Note: In a stateless JWT system, sign out is handled client-side
        // If you implement token blacklisting, handle it here
        res.json({ 
            success: true,
            message: "Admin logged out successfully" 
        });
    } catch (error) {
        console.error("Admin sign out error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error", 
            message: error.message 
        });
    }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
    try {
        // Admin is already attached to req by adminAuthMiddleware
        // Just return it without password field
        const admin = req.admin || req.user;
        
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                error: "Admin not found" 
            });
        }

        // Create admin object without password
        const adminData = {
            _id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            status: admin.status,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        };

        res.json({ 
            success: true,
            admin: adminData
        });
    } catch (error) {
        console.error("Get admin profile error:", error);
        res.status(500).json({ 
            success: false,
            error: "Server error", 
            message: error.message 
        });
    }
};