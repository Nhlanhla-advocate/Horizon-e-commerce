const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    // Cached dashboard statistics
    overview: {
        totalProducts: {
            type: Number,
            default: 0
        },
        activeProducts: {
            type: Number,
            default: 0
        },
        totalUsers: {
            type: Number,
            default: 0
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        lowStockProducts: {
            type: Number,
            default: 0
        }
    },
    
    // Recent orders 
    recentOrders: [{
        _id: mongoose.Schema.Types.ObjectId,
        user: {
            _id: mongoose.Schema.Types.ObjectId,
            username: String,
            email: String
        },
        totalAmount: Number,
        status: String,
        createdAt: Date
    }],
    
    // Top rated products (cached)
    topRatedProducts: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        rating: Number,
        numReviews: Number,
        price: Number
    }],
    
    // Cache metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    
    // Cache expiration
    cacheExpiry: {
        type: Number,
        default: 5 
    }
}, {
    timestamps: true
});

// Index for efficient queries
dashboardSchema.index({ lastUpdated: 1 });

// Static method to get or create dashboard stats
dashboardSchema.statics.getDashboardStats = async function() {
    const now = new Date();
    const cacheExpiryMinutes = 5; // 5 minutes cache
    
    // Try to find existing cached stats
    let dashboardStats = await this.findOne();
    
    // Check if cache is expired or doesn't exist
    if (!dashboardStats || 
        (now - dashboardStats.lastUpdated) > (cacheExpiryMinutes * 60 * 1000)) {
        
        // Cache is expired or doesn't exist, I'll need to refresh it
        // This will be handled by the controller
        return null;
    }
    
    return dashboardStats;
};

// Static method to update dashboard stats
dashboardSchema.statics.updateDashboardStats = async function(statsData) {
    const now = new Date();
    
    // Update or create dashboard stats
    const dashboardStats = await this.findOneAndUpdate(
        {},
        {
            overview: statsData.overview,
            recentOrders: statsData.recentOrders,
            topRatedProducts: statsData.topRatedProducts,
            lastUpdated: now
        },
        { 
            upsert: true, 
            new: true 
        }
    );
    
    return dashboardStats;
};

module.exports = mongoose.model('Dashboard', dashboardSchema);
