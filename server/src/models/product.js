const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true,
        enum: ['jewelry', 'electronics', 'consoles', 'computers']
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true,
        min: 0
    },
    stock: { 
        type: Number, 
        required: true,
        min: 0
    },
    images: [{ 
        type: String 
    }],
    specifications: {
        // Jewelry specific fields
        material: String,
        weight: Number,
        purity: String, // for gold/silver
        gemstones: [String],
        
        // Electronics/Computers/Consoles specific fields
        brand: String,
        model: String,
        warranty: String,
        processor: String,
        memory: String,
        storage: String,
        display: String,
        connectivity: [String]
    },
    rating: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 5 
    },
    numReviews: { 
        type: Number, 
        default: 0 
    },
    featured: { 
        type: Boolean, 
        default: false 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Add index for better search performance
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);