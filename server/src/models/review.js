const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    
}, { timestamps: true});

module.exports = mongoose.model('Review', ReviewSchema);