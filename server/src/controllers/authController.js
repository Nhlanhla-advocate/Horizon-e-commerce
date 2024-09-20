const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User sign-up
exports.signUp = async (req, res) => {
    try {
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

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            username,
            password: hashedPassword,
            ...rest
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
};

// User sign-in
exports.signIn = async (req, res) => {
    try {
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

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Sign in failed' });
    }
};

// Customer sign-out
exports.signOut = (req, res) => {
    res.status(200).send('Signed out successfully');
};