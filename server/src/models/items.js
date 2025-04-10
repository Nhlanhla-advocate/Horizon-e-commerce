const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Correct reference
    name: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    quantity: { type: Number, required: true }
});

module.exports = ItemSchema;