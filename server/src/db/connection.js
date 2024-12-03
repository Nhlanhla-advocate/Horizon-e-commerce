// REQUIRED PACKAGE
const mongoose = require("mongoose");

// CONNECTING TO MONGODB
async function connectToMongoDB() {
  const connection = process.env.MONGODB_URL;
  try {
    await mongoose.connect(connection);
    console.log("Successfully Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// EXPORTING THE CONNECTION FUNCTION
module.exports = { connectToMongoDB };
