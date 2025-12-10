const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Sign Up
exports.adminSignUp = async (req, res) => {
    try {
        // Check JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ 
                success: false,
                error: "Server configuration error" 
            });
        }

        const { username, email, password, role } = req.body;

        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "Username, email, and password are required" 
            });
        }

        // Check if admin with this email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false,
                error: "Email already in use by an admin account" 
            });
        }

        // Check if admin with this username already exists
        const existingUsername = await Admin.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ 
                success: false,
                error: "Username already in use" 
            });
        }

        // Create new admin - password will be hashed by the pre-save middleware
        const admin = new Admin({
            username,
            email,
            password, // Plain password - will be hashed by middleware
            role: role || 'admin',
            status: 'active'
        });

        // Save admin to database
        const savedAdmin = await admin.save();
        console.log('Admin created successfully with ID:', savedAdmin._id);

        // Generate JWT token
        const token = jwt.sign(
            { 
                _id: savedAdmin._id, 
                email: savedAdmin.email,
                role: savedAdmin.role || "admin",
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Return success response with admin info (excluding password)
        res.status(201).json({ 
            success: true,
            token, 
            role: savedAdmin.role || "admin",
            admin: {
                _id: savedAdmin._id,
                username: savedAdmin.username,
                email: savedAdmin.email,
                role: savedAdmin.role,
                status: savedAdmin.status
            },
            message: "Admin account created successfully"
        });

    } catch (error) {
        console.error("Admin sign up error:", error);
        
        // Handle duplicate key error (MongoDB)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false,
                error: `${field} already in use` 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: "Server error", 
            message: error.message 
        });
    }
};

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