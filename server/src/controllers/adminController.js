const Admin = require('../models/admin');
const User = require('../models/user');
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

        // Normalize email for search
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log('[ADMIN SIGNIN] Attempting admin signin for email:', normalizedEmail);

        // Step 1: Check Admin collection first
        let admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin) {
            // Try case-insensitive regex search
            admin = await Admin.findOne({ 
                email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
            });
        }
        
        let isUserCollection = false;
        
        // Step 2: If not found in Admin collection, check User collection for admin role
        if (!admin) {
            console.log('[ADMIN SIGNIN] Admin not found in Admin collection, checking User collection...');
            const user = await User.findOne({ 
                email: normalizedEmail 
            });
            
            if (!user) {
                // Try case-insensitive regex search
                const userRegex = await User.findOne({ 
                    email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
                });
                
                if (userRegex && (userRegex.role === 'admin' || userRegex.role === 'super_admin')) {
                    console.log('[ADMIN SIGNIN] Found admin in User collection with role:', userRegex.role);
                    // Verify password
                    const passwordMatch = await userRegex.comparePassword(password);
                    if (!passwordMatch) {
                        return res.status(400).json({ 
                            success: false,
                            error: "Invalid credentials" 
                        });
                    }
                    
                    // Check if admin is active
                    if (userRegex.status !== 'active') {
                        return res.status(403).json({ 
                            success: false,
                            error: "Admin account is inactive. Please contact administrator." 
                        });
                    }
                    
                    // Create admin-like object from user
                    admin = {
                        _id: userRegex._id,
                        email: userRegex.email,
                        username: userRegex.username,
                        role: userRegex.role || 'admin',
                        status: userRegex.status || 'active',
                        lastLogin: new Date()
                    };
                    isUserCollection = true;
                } else if (userRegex) {
                    console.log('[ADMIN SIGNIN] User found but not an admin, role:', userRegex.role);
                    return res.status(404).json({ 
                        success: false,
                        error: "Admin not found" 
                    });
                } else {
                    console.log('[ADMIN SIGNIN] No user found with email:', normalizedEmail);
                    return res.status(404).json({ 
                        success: false,
                        error: "Admin not found" 
                    });
                }
            } else if (user.role === 'admin' || user.role === 'super_admin') {
                console.log('[ADMIN SIGNIN] Found admin in User collection with role:', user.role);
                // Verify password
                const passwordMatch = await user.comparePassword(password);
                if (!passwordMatch) {
                    return res.status(400).json({ 
                        success: false,
                        error: "Invalid credentials" 
                    });
                }
                
                // Check if user is active
                if (user.status !== 'active') {
                    return res.status(403).json({ 
                        success: false,
                        error: "Admin account is inactive. Please contact administrator." 
                    });
                }
                
                // Create admin-like object from user
                admin = {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role || 'admin',
                    status: user.status || 'active',
                    lastLogin: new Date()
                };
                isUserCollection = true;
            } else {
                console.log('[ADMIN SIGNIN] User found but not an admin, role:', user.role);
                return res.status(404).json({ 
                    success: false,
                    error: "Admin not found" 
                });
            }
        }

        if (!admin) {
            return res.status(404).json({ 
                success: false,
                error: "Admin not found" 
            });
        }

        // If admin is from Admin collection, verify password and update lastLogin
        if (!isUserCollection) {
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
        }

        console.log('[ADMIN SIGNIN] Admin authenticated successfully:', admin.email, 'Role:', admin.role, 'From collection:', isUserCollection ? 'User' : 'Admin');

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
        // Return both accessToken and token for compatibility
        res.json({ 
            success: true,
            accessToken: token,  // Primary field name for frontend
            token: token,        // Keep for backward compatibility
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
        // Admin is already attached to req by authMiddleware
        // It can be from either Admin or User collection
        const admin = req.admin || req.user;
        
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                error: "Admin not found" 
            });
        }

        // Verify this is actually an admin (check role)
        // Log detailed admin information for debugging
        const adminRole = admin.role;
        console.log('[GET ADMIN PROFILE] Admin object details:', {
            id: admin._id?.toString(),
            email: admin.email,
            role: adminRole,
            roleType: typeof adminRole,
            status: admin.status,
            hasAdminRole: adminRole === 'admin' || adminRole === 'super_admin',
            isAdmin: adminRole === 'admin',
            isSuperAdmin: adminRole === 'super_admin',
            isMongooseDoc: admin.toObject !== undefined,
            rawRole: adminRole
        });
        
        // More robust role check - handle undefined, null, and string comparison
        // First check direct comparison (most reliable)
        const isAdminRoleDirect = adminRole === 'admin' || adminRole === 'super_admin';
        
        // Also try normalized comparison as fallback
        const userRoleNormalized = adminRole?.toString().toLowerCase().trim();
        const isAdminRoleNormalized = userRoleNormalized === 'admin' || userRoleNormalized === 'super_admin';
        
        const isAdminRole = isAdminRoleDirect || isAdminRoleNormalized;
        
        // Explicitly block users with role "user"
        const isUserRole = adminRole === 'user' || userRoleNormalized === 'user';
        
        if (isUserRole) {
            console.log('[GET ADMIN PROFILE]  Access denied - user has "user" role and cannot access admin dashboard. Role:', adminRole);
            return res.status(403).json({ 
                success: false,
                error: "Access denied. Admin privileges required." 
            });
        }
        
        if (!isAdminRole) {
            console.log('[GET ADMIN PROFILE]  Access denied - user does not have admin role.');
            console.log('[GET ADMIN PROFILE] Role details:', {
                raw: adminRole,
                normalized: userRoleNormalized,
                directCheck: isAdminRoleDirect,
                normalizedCheck: isAdminRoleNormalized
            });
            return res.status(403).json({ 
                success: false,
                error: "Access denied. Admin privileges required." 
            });
        }
        
        console.log('[GET ADMIN PROFILE]  Admin role verified:', adminRole);

        // Create admin object without password
        // Handle both Admin and User models (User model might not have lastLogin)
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

        console.log('[GET ADMIN PROFILE] Returning admin profile for:', admin.email, 'Role:', admin.role);

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