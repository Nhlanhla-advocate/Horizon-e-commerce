const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const adminController = require('./controllers/adminController');
const reviewRoutes = require('./routes/userReview');
const wishListRoutes = require('./routes/wishList');

// Global error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// Middleware to parse JSON
app.use(express.json());

// Use authentication routes
app.use('/auth', authRoutes);

// // Use admin routes
app.use('/admin', adminRoutes);

// // Use user routes
app.use('/user', userRoutes);

// // Use cart routes
app.use('/cart', cartRoutes);

// // Use order routes
app.use('/orders', orderRoutes);

// // Review routes
// app.use('/review', reviewRoutes);

// // WishList routes
// app.use('/wishList', wishListRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
