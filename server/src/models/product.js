const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    availableCount: { type: Number, required: true },
    genre: { type: String }
});

module.exports = mongoose.model('Item', itemSchema);