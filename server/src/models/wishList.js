const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    products: [
        {type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, { timestamps: true});

module.exports - mongoose.model('wishlist', wishlistSchema);