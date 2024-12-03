const User = require('../models/user');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User sign-up
exports.signUp = async (req, res) => {
    try {

        // Check for validation errors
        exports.handleValidationErrors = (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        return null;
    }

        const { username, email, password, ...rest } = req.body;

        // Check for existing user with the same email
        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Check for existing user with the same username
        const existingUsernameUser = await User.findOne({ username });
        if (existingUsernameUser) {
            return res.status(400).json({ error: 'Username already in use' });
        }

        // Salt and Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            email,
            username,
            password: hashedPassword,
            ...rest
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token, message: 'User registered successfully' });
    } catch (error) {
        console.error('Sign up error:', error);
        res.status(400).json({ error: 'Failed to create user' });
    }
};

        // User sign-in
        exports.signIn = async (req, res) => {
         try {
            // Check for validation errors
            exports.handleValidationErrors = (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            return null
        }

            const { username, email, password } = req.body;

            // Check if user exists
             const user = username 
                 ? await User.findOne({ username }) 
                 : await User.findOne({ email });

             if (!user) {
                 return res.status(400).json({ error: 'Invalid login credentials' });
             }

            // Compare passwords
             const isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch) {
                 return res.status(400).json({ error: 'Invalid login credentials' });
             }

            // Generate JWT token
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token, message: 'Signed in successfully' });
            } catch (error) {
            console.error('Sign in error:', error)
            res.status(400).json({ error: 'Sign in failed' });
            }
        };

             // Customer sign-out
            exports.signOut = async (req, res) => {
            try {
            // Assuming you're using middleware to attach the user to the request
            const user = req.user;

            // Add the current token to a blacklist in the user document
            user.tokenBlacklist = user.tokenBlacklist || [];
            user.tokenBlacklist.push(req.token);

            // Optional: Remove old tokens from the blacklist (e.g., tokens older than 1 hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            user.tokenBlacklist = user.tokenBlacklist.filter(token => {
                 const payload = jwt.decode(token);
                 return payload.exp * 1000 > oneHourAgo.getTime();
            });

            await user.save();

            res.status(200).send('Signed out successfully');
            } catch (error) {
             res.status(500).json({ error: 'Sign out failed' });
            }
        };