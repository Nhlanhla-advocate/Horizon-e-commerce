// Load environment variables first, before any other imports
require("dotenv").config({ path: "./server/.env" });

const express = require("express");
const app = express();
const { connectToMongoDB } = require("./db/connection");
const cookieParser = require('cookie-parser');
const cors = require("cors");

// Verify environment variables are loaded
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from environment variables");
  process.exit(1);
}

// Enable CORS for frontend at http://localhost:3000
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], 
//   allowedHeaders: ['Content-Type'] 
// }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true
}));


// Import route modules
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");
const wishListRoutes = require("./routes/wishList");
const products = require("./routes/product");
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .json({ message: "An unexpected error occurred", error: err.message });
});

// Use routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/wishlist", wishListRoutes);
app.use("/products", products);

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
