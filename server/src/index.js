const express = require('express');
const app = express();
const { connectToMongoDB } = require('./db/connection');

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const wishListRoutes = require('./routes/wishList');

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
});

// Use routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes); 
app.use('/wishlist', wishListRoutes); 

// Set the server to listen on the specified port
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("An error occurred while trying to start the server:", error);
        process.exit(1);
    }
}

startServer();
