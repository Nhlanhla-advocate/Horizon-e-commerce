// Load environment variables first (from project root .env when you run npm run app)
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });
require("dotenv").config({ path: path.resolve(process.cwd(), "server", ".env") });

const express = require("express");
const app = express();
app.set('trust proxy', 1);
const { connectToMongoDB } = require("./db/connection");
const cookieParser = require('cookie-parser');
const cors = require("cors");

// Verify environment variables are loaded
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from environment variables");
  process.exit(1);
}

// Warn early if Stripe keys are misconfigured (does not block server startup)
(async () => {
  const sk = String(process.env.STRIPE_SECRET_KEY || '').trim();
  const pk = String(process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').trim();
  if (!sk && !pk) return;
  if (sk.startsWith('pk_')) {
    console.error('[Stripe] STRIPE_SECRET_KEY is a publishable key (pk_...). Swap it with STRIPE_PUBLISHABLE_KEY.');
    return;
  }
  if (pk.startsWith('sk_')) {
    console.error('[Stripe] STRIPE_PUBLISHABLE_KEY is a secret key (sk_...). Swap it with STRIPE_SECRET_KEY.');
    return;
  }
  if (!sk.startsWith('sk_')) {
    console.error('[Stripe] STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.');
    return;
  }
  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(sk, { apiVersion: '2024-11-20.acacia' });
    await stripe.balance.retrieve();
    console.log('[Stripe] Secret key verified.');
  } catch (err) {
    console.error('[Stripe] Secret key rejected by Stripe. Create a new key at https://dashboard.stripe.com/test/apikeys');
    console.error('[Stripe]', err.message?.replace(/sk_test_[A-Za-z0-9]+/g, 'sk_test_[REDACTED]'));
  }
})();

// Enable CORS for frontend at http://localhost:3000
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'], 
//   allowedHeaders: ['Content-Type'] 
// }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Public-Ip'],
}));

app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Public-Ip'],
}));


// Import route modules
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");
const wishListRoutes = require("./routes/wishList");
const products = require("./routes/product");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded profile images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/payments", paymentRoutes);

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
