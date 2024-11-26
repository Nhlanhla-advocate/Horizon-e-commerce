// REQUIRED PACKAGE
const mongoose = require("mongoose");

// CONNECTING TO MONGODB
async function connectToMongoDB() {
  const connection =
  "mongodb+srv://roykeane888:<4656464Swagger!>@horizon-e-commerce.3uhmh.mongodb.net/?retryWrites=true&w=majority&appName=Horizon-E-commerce";
  try {
    await mongoose.connect(connection);
    console.log("Successfully Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// EXPORTING THE CONNECTION FUNCTION
module.exports = { connectToMongoDB };
