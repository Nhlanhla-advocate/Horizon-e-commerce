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
            // Try to find admin in Admin collection first
            account = await Admin.findById(userId);
            accountType = 'admin';
            
            // If not found in Admin collection, check User collection for admin role
            if (!account) {
                console.log('[AUTH MIDDLEWARE] Admin not found in Admin collection, checking User collection...');
                console.log('[AUTH MIDDLEWARE] Looking for user with ID:', userId);
                let userAccount = await User.findById(userId);
                
                if (userAccount) {
                    console.log('[AUTH MIDDLEWARE] User found in User collection:', {
                        id: userAccount._id?.toString(),
                        email: userAccount.email,
                        role: userAccount.role,
                        roleType: typeof userAccount.role,
                        status: userAccount.status,
                        isMongooseDoc: userAccount.toObject !== undefined
                    });
                    
                    // Ensure role is explicitly checked and preserved
                    const userRole = userAccount.role;
                    console.log('[AUTH MIDDLEWARE] User role value:', userRole, 'Type:', typeof userRole);
                    
                    // Check both direct comparison and normalized comparison
                    const isAdminDirect = userRole === 'admin' || userRole === 'super_admin';
                    const roleNormalized = userRole?.toString().toLowerCase().trim();
                    const isAdminNormalized = roleNormalized === 'admin' || roleNormalized === 'super_admin';
                    const isAdmin = isAdminDirect || isAdminNormalized;
                    
                    // Explicitly block users with role "user"
                    const isUserRole = userRole === 'user' || roleNormalized === 'user';
                    
                    if (isUserRole) {
                        console.log('[AUTH MIDDLEWARE] ❌ Access denied - user has "user" role and cannot access admin routes. Role:', userRole);
                        return res.status(403).json({ 
                            success: false,
                            message: "Access denied. Admin privileges required." 
                        });
                    }
                    
                    if (isAdmin) {
                        console.log('[AUTH MIDDLEWARE] ✅ Found admin in User collection with role:', userRole);
                        // Ensure we're using the full Mongoose document, not a plain object
                        account = userAccount;
                        accountType = 'admin';
                        
                        // Double-check role is preserved
                        console.log('[AUTH MIDDLEWARE] Account role after assignment:', account.role, 'Type:', typeof account.role);
                    } else {
                        console.log('[AUTH MIDDLEWARE] ❌ User found but not an admin. Role:', userRole, 'Normalized:', roleNormalized);
                        return res.status(401).json({ 
                            success: false,
                            message: "Admin not found" 
                        });
                    }
                } else {
                    console.log('[AUTH MIDDLEWARE] ❌ No user found with ID:', userId);
                    return res.status(401).json({ 
                        success: false,
                        message: "Admin not found" 
                    });
                }
            } else {
                console.log('[AUTH MIDDLEWARE] ✅ Found admin in Admin collection:', {
                    id: account._id,
                    email: account.email,
                    role: account.role
                });
            }

            if (!account) {
                return res.status(401).json({ 
                    success: false,
                    message: "Admin not found" 
                });
            }

            // CRITICAL: Explicitly block users with role "user" from accessing admin routes
            const accountRole = account.role;
            const roleNormalized = accountRole?.toString().toLowerCase().trim();
            if (accountRole === 'user' || roleNormalized === 'user') {
                console.log('[AUTH MIDDLEWARE] ❌ Access denied - user has "user" role and cannot access admin routes. Role:', accountRole);
                return res.status(403).json({ 
                    success: false,
                    message: "Access denied. Admin privileges required." 
                });
            }

            // Check admin status (works for both Admin and User models)
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
            
            // Final check: Ensure account has admin or super_admin role
            const hasAdminRole = accountRole === 'admin' || accountRole === 'super_admin' || 
                                roleNormalized === 'admin' || roleNormalized === 'super_admin';
            if (!hasAdminRole) {
                console.log('[AUTH MIDDLEWARE] ❌ Access denied - account does not have admin role. Role:', accountRole);
                return res.status(403).json({ 
                    success: false,
                    message: "Access denied. Admin privileges required." 
                });
            }
        } else {
            // This is a regular user token (not adminToken)
            // Regular users should NOT be able to access admin routes
            // Block them immediately
            console.log('[AUTH MIDDLEWARE] ❌ Regular user token detected on admin route - blocking access');
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Admin privileges required." 
            });
        }

        // Add account to request object (as both user and specific type)
        req.user = account;
        if (accountType === 'admin') {
            req.admin = account;
            console.log('[AUTH MIDDLEWARE] ✅ Admin account attached to request:', {
                id: account._id?.toString(),
                email: account.email,
                role: account.role,
                status: account.status,
                hasAdminRole: account.role === 'admin' || account.role === 'super_admin'
            });
        } else {
            console.log('[AUTH MIDDLEWARE] User account attached to request:', {
                id: account._id?.toString(),
                email: account.email,
                role: account.role
            });
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