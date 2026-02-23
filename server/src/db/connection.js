// REQUIRED PACKAGE
const mongoose = require("mongoose");
require('dotenv').config();
mongoose.set('strictQuery', true);

// CONNECTING TO MONGODB
async function connectToMongoDB() {
  const connection = process.env.MONGODB_URL;
  if (!connection) {
    const err = new Error("MONGODB_URL is not set in .env");
    console.error("Error:", err.message);
    throw err;
  }
  try {
    await mongoose.connect(connection);
    console.log("Successfully Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// EXPORTING THE CONNECTION FUNCTION
module.exports = { connectToMongoDB };
