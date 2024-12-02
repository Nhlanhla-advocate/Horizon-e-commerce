const express = require('express');
const app = express();

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/userReview');
const wishListRoutes = require('./routes/wishList');

// Middleware to parse JSON
app.use(express.json());

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// Use authentication routes
app.use('/auth', authRoutes);

// Use user routes
app.use('/user', userRoutes);

// Use cart routes
app.use('/cart', cartRoutes);

// Use order routes
app.use('/orders', orderRoutes);

// Use review routes
app.use('/review', reviewRoutes);

// Use wishList routes
app.use('/wishList', wishListRoutes);

// Set the server to listen on the specified port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
