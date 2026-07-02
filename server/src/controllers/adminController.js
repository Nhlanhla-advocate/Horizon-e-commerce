const Admin = require('../models/admin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { deleteLocalUploadIfOwned } = require('../utilities/profileImageStorage');
const { generateSecret, keyuri, verifyToken } = require('../utilities/totp');
const {
    assertAdminAccount,
    loadAdminDocument,
    buildProfileUpdates,
    buildNotificationUpdates,
    buildMandatorySuperAdminNotificationUpdates,
    ensureNestedDefaults,
    serializeAdminProfile,
    recordAdminLogin,
    checkUsernameAvailable
} = require('../utilities/adminProfileHelpers');

const buildAdminAuthPayload = (adminDoc) => ({
    _id: adminDoc._id,
    email: adminDoc.email,
    role: adminDoc.role || 'admin',
    isAdmin: true,
});

const issueAdminAccessToken = (adminDoc) =>
    jwt.sign(buildAdminAuthPayload(adminDoc), process.env.JWT_SECRET, { expiresIn: '24h' });

const issueAdminTwoFactorPendingToken = (adminDoc) =>
    jwt.sign(
        { ...buildAdminAuthPayload(adminDoc), purpose: 'admin_2fa' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );

const respondAdminSignInSuccess = (res, adminDoc, token) => {
    res.json({
        success: true,
        accessToken: token,
        token,
        role: adminDoc.role || 'admin',
        admin: {
            _id: adminDoc._id,
            username: adminDoc.username,
            email: adminDoc.email,
            role: adminDoc.role,
            lastLogin: adminDoc.lastLogin,
        },
    });
};

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

        const emailRegex = { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };

        // Step 1: Check Admin collection
        let admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin) {
            admin = await Admin.findOne({ email: emailRegex });
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
                        await recordAdminLogin(userRegex, req, { success: false });
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
                    await recordAdminLogin(user, req, { success: false });
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
                await recordAdminLogin(admin, req, { success: false });
                return res.status(400).json({ 
                    success: false,
                    error: "Invalid credentials" 
                });
            }

        }

        const adminDoc = isUserCollection ? await User.findById(admin._id) : admin;
        if (!adminDoc) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found',
            });
        }

        ensureNestedDefaults(adminDoc);
        if (adminDoc.twoFactor?.enabled && adminDoc.twoFactor?.secret) {
            const twoFactorToken = issueAdminTwoFactorPendingToken(adminDoc);
            return res.json({
                success: true,
                requiresTwoFactor: true,
                twoFactorToken,
            });
        }

        await recordAdminLogin(adminDoc, req, { success: true });

        console.log(
            '[ADMIN SIGNIN] Admin authenticated successfully:',
            adminDoc.email,
            'Role:',
            adminDoc.role,
            'From collection:',
            isUserCollection ? 'User' : 'Admin'
        );

        respondAdminSignInSuccess(res, adminDoc, issueAdminAccessToken(adminDoc));
    } catch (error) {
        console.error("Admin sign in error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message || "Sign in failed" 
        });
    }
};

// Complete admin sign-in after TOTP verification
exports.adminVerifyTwoFactorSignIn = async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                error: 'Server configuration error',
            });
        }

        const { twoFactorToken, token } = req.body;
        if (!twoFactorToken || !token) {
            return res.status(400).json({
                success: false,
                error: 'Authenticator code is required',
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                success: false,
                error: 'Verification session expired. Please sign in again.',
            });
        }

        if (decoded.purpose !== 'admin_2fa' || !decoded.isAdmin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid verification session',
            });
        }

        const adminDoc = await loadAdminDocument(decoded);
        if (!adminDoc) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found',
            });
        }

        if (adminDoc.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Admin account is inactive. Please contact administrator.',
            });
        }

        ensureNestedDefaults(adminDoc);
        if (!adminDoc.twoFactor?.enabled || !adminDoc.twoFactor?.secret) {
            return res.status(400).json({
                success: false,
                error: 'Two-factor authentication is not enabled for this account',
            });
        }

        if (!verifyToken(token, adminDoc.twoFactor.secret)) {
            await recordAdminLogin(adminDoc, req, { success: false });
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code',
            });
        }

        await recordAdminLogin(adminDoc, req, { success: true });
        respondAdminSignInSuccess(res, adminDoc, issueAdminAccessToken(adminDoc));
    } catch (error) {
        console.error('Admin 2FA sign in error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Verification failed',
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
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({
                success: false,
                error: 'Admin not found'
            });
        }

        res.json({
            success: true,
            admin: serializeAdminProfile(doc)
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

//Update admin profile (username, personal info)
exports.updateAdminProfile = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const updates = buildProfileUpdates(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid profile fields provided'
            });
        }

        if (updates.username) {
            const usernameCheck = await checkUsernameAvailable(updates.username, account._id);
            if (!usernameCheck.ok) {
                return res.status(400).json({ success: false, error: usernameCheck.message });
            }
        }

        const  Model = account.constructor?.modelName === 'User' ? User : Admin;
        const doc = await Model.findByIdAndUpdate(
            account._id,
            { $set: updates },
            { new: true, runValidators: true}
        );

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        res.json({ 
            success: true,
            message: 'Profile updated successfully',
            admin: serializeAdminProfile(doc)
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

// Change admin password
exports.changeAdminPassword = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const { currentPassword, newPassword } = req.body;
        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        const isMatch = await doc.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }

        doc.password = newPassword;
        await doc.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

// Upload / change admin profile photo
exports.uploadAdminAvatar = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const uploaded = req.uploadedFiles?.[0];
        if (!uploaded) {
            return res.status(400).json({ success: false, error: 'Image file is required' });
        }

        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        if (doc.avatar) {
            await deleteLocalUploadIfOwned(doc.avatar, doc._id);
        }

        doc.avatar = uploaded.url;
        await doc.save();

        res.status(201).json({
            success: true,
            message: 'Profile photo updated',
            url: uploaded.url,
            admin: serializeAdminProfile(doc)
        });
    } catch (error) {
        console.error('Upload admin avatar error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

// View login history
exports.getAdminLoginHistory = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
        const history = Array.isArray(doc.loginHistory)
            ? [...doc.loginHistory].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, limit)
            : [];

        res.json({
            success: true,
            loginHistory: history,
            total: doc.loginHistory?.length || 0
        });
    } catch (error) {
        console.error('Get admin login history error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }

};

// Update notification preferences
exports.updateAdminNotificationPreferences = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const updates = account.role === 'super_admin'
            ? buildMandatorySuperAdminNotificationUpdates()
            : buildNotificationUpdates(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid notification preferences provided'
            });
        }

        const Model = account.constructor?.modelName === 'User' ? User : Admin;
        const doc = await Model.findByIdAndUpdate(
            account._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        res.json({
            success: true,
            message: 'Notification preferences updated',
            notificationPreferences: doc.notificationPreferences,
            admin: serializeAdminProfile(doc)
        });
    } catch (error) {
        console.error('Update admin notification preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

//Begin 2FA setup. returns secret + otpauth URL for authenticator apps
exports.setupAdminTwoFactor = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        ensureNestedDefaults(doc);
        if (doc.twoFactor.enabled) {
            return res.status(400).json({ success: false, error: 'Two-factor authentication is already enabled' });
        }

        const secret = generateSecret();
        doc.twoFactor.tempSecret = secret;
        await doc.save();

        const issuer = process.env.APP_NAME || 'Horizon E-commerce';
        const otpauthURL = keyuri(doc.email, issuer, secret);

        res.json({
            success: true,
            secret,
            otpauthURL,
            message: 'Scan the otpauth URL in your authenticator app, then verify with a 6 digit code.'
        });
    } catch (error) {
        console.error('Setup admin two-factor error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

// Verify TOTP code and enable 2FA
exports.verifyAdminTwoFactor = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const { token } = req.body;
        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        ensureNestedDefaults(doc);
        const secret = doc.twoFactor.tempSecret || doc.twoFactor.secret;
        if (!secret) {
            return res.status(400).json({ success: false, error: 'Run 2FA setup first' });
        }

        if (!verifyToken(token, secret)) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        doc.twoFactor.enabled = true;
        doc.twoFactor.secret = secret;
        doc.twoFactor.tempSecret = undefined;
        doc.twoFactor.enabledAt = new Date();
        await doc.save();

        res.json({
            success: true,
            message: 'Two-factor authentication enabled',
            twoFactor: { enabled: true }
        });
    } catch (error) {
        console.error('Verify admin 2FA error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};

// Disable 2FA (requires current password)
exports.disableAdminTwoFactor = async (req, res) => {
    try {
        const account = assertAdminAccount(req, res);
        if (!account) return;

        const { currentPassword, token } = req.body;
        const doc = await loadAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }

        ensureNestedDefaults(doc);
        if (!doc.twoFactor?.enabled) {
            return res.status(400).json({ success: false, error: 'Two-factor authentication is not enabled' });
        }

        const passwordOk = await doc.comparePassword(currentPassword);
        if (!passwordOk) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }

        if (doc.twoFactor.secret && !verifyToken(token, doc.twoFactor.secret)) {
            return res.status(400).json({ success: false, error: 'Invalid authenticator code' });
        }

        doc.twoFactor.enabled = false;
        doc.twoFactor.secret = undefined;
        doc.twoFactor.tempSecret = undefined;
        doc.twoFactor.enabledAt = undefined;
        await doc.save();

        res.json({
            success: true,
            message: 'Two-factor authentication disabled',
            twoFactor: { enabled: false }
        });
    } catch (error) {
        console.error('Disable admin 2FA error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
};