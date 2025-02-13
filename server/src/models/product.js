const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
    genre: { type: String }
});

module.exports = mongoose.model('Item', itemSchema);