const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
    console.log('Sign-in attempt with:', { email });

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(400).json({ error: "Invalid login credentials" });
    }

    // Compare passwords using the method from the user model
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid login credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.status(200).json({ 
      success: true,
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      message: "Signed in successfully" 
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(400).json({ error: "Sign in failed" });
  }
};

// Customer sign-out
exports.signOut = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    // Get user from middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add token to blacklist
    if (!user.tokenBlacklist) {
      user.tokenBlacklist = [];
    }
    user.tokenBlacklist.push(token);

    // Clean up old tokens (optional)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    user.tokenBlacklist = user.tokenBlacklist.filter((blacklistedToken) => {
      try {
        const decoded = jwt.decode(blacklistedToken);
        return decoded && decoded.exp * 1000 > oneHourAgo.getTime();
      } catch (error) {
        return false;
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Signed out successfully"
    });
  } catch (error) {
    console.error("Sign out error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Sign out failed" 
    });
  }
};
