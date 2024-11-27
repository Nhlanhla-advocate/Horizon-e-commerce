const Admin = require('../models/admin'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new admin
exports.registerAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const newAdmin = new Admin({ email, password });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        next(error);
    }
};

// Login an admin
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find the admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the stored password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};

// Example: Update Admin Profile
exports.updateAdminProfile = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Update admin details
        const updateData = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(req.admin._id, updateData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
    } catch (error) {
        next(error);
    }
};
