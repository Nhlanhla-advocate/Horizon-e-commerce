// REQUIRED PACKAGE
const mongoose = require("mongoose");
require('dotenv').config();
mongoose.set('strictQuery', true);

// CONNECTING TO MONGODB
async function connectToMongoDB() {
  const connection = 'mongodb+srv://roykeane888:n3RNZWBK5lfocsed@horizon.alzof.mongodb.net/?retryWrites=true&w=majority&appName=Horizon';
  try {
    await mongoose.connect(connection);
    console.log("Successfully Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// EXPORTING THE CONNECTION FUNCTION
module.exports = { connectToMongoDB };
