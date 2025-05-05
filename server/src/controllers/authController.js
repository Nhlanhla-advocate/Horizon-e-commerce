const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configure nodemailer with more secure settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // This helps bypass the self-signed certificate issue
  }
});

// Generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short lived access token
    );

    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Long lived refresh token
    );

    return { accessToken, refreshToken };
};

// User sign-up
exports.signUp = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return res.status(500).json({ 
        success: false,
        error: "Server configuration error" 
      });
    }

    const { username, email, password, ...rest } = req.body;
    console.log('Sign-up attempt with:', { email });

    // Check for existing user with the same email
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Check for existing user with the same username
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res.status(400).json({ error: "Username already in use" });
    }
    
    // Create new user - password will be hashed by the pre-save middleware
    const user = new User({
      email,
      username,
      password, // Plain password - will be hashed by middleware 
      ...rest,
    });

    // Save user to database
    const savedUser = await user.save();
    console.log('User saved successfully with ID:', savedUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
 
    // Send response
    res.status(201).json({ 
      success: true,
      token, 
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      },
      message: "User registered successfully" 
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to create user" 
    });
  }
};

// User sign-in
exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user and validate password
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ error: "Invalid login credentials" });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await user.save();

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Sign in error:", error);
        res.status(500).json({ error: "Sign in failed" });
    }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token required" });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        // Find user and check if refresh token matches
        const user = await User.findOne({
            _id: decoded._id,
            refreshToken,
            refreshTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await user.save();

        // Set new refresh token in cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken: tokens.accessToken
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(401).json({ error: "Invalid refresh token" });
    }
};

// Sign out
exports.signOut = async (req, res) => {
    try {
        const user = req.user;
        
        // Clear refresh token from database
        user.refreshToken = null;
        user.refreshTokenExpiry = null;
        await user.save();

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: "Signed out successfully"
        });
    } catch (error) {
        console.error("Sign out error:", error);
        res.status(500).json({ error: "Sign out failed" });
    }
};

// Forgot Password handler
exports.forgotPassword = async (req, res) => {
  let user; // Declare user variable in outer scope
  try {
    const { email } = req.body;

    // Check if user exists
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/reset-password/${resetToken}`;

    // Create email message
    const message = {
      from: process.env.EMAIL_USER, // Use EMAIL_USER instead of EMAIL_FROM
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>You have requested a password reset</h1>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
        <p>This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Send email
    await transporter.sendMail(message);

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Reset user fields & save
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: "Email could not be sent",
      error: error.message
    });
  }
};

// Reset Password handler
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params; // Get token from URL params
    const { password } = req.body;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Hash the token from the URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Could not reset password',
      error: error.message
    });
  }
};


