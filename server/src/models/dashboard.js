const mongoose = require('mongoose');

// Item schema for order items
const ItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    quantity: { type: Number, required: true }
});

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
        inactiveProducts: {
            type: Number,
            default: 0
        },
        deletedProducts: {
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
        pendingOrders: {
            type: Number,
            default: 0
        },
        completedOrders: {
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
        },
        outOfStockProducts: {
            type: Number,
            default: 0
        }
    },
    
    // Recent orders with full details
    recentOrders: [{
        _id: mongoose.Schema.Types.ObjectId,
        user: {
            _id: mongoose.Schema.Types.ObjectId,
            username: String,
            email: String
        },
        totalAmount: Number,
        status: String,
        items: [{
            product: mongoose.Schema.Types.ObjectId,
            quantity: Number,
            price: Number
        }],
        createdAt: Date,
        updatedAt: Date
    }],
    
    // Top rated products (cached)
    topRatedProducts: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        category: String,
        rating: Number,
        numReviews: Number,
        price: Number,
        stock: Number,
        featured: Boolean
    }],
    
    // Top selling products (based on order data)
    topSellingProducts: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        category: String,
        price: Number,
        stock: Number,
        totalSold: Number,
        totalRevenue: Number,
        averageOrderValue: Number,
        lastOrderDate: Date
    }],
    
    // Low selling products (products with few or no sales)
    lowSellingProducts: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        category: String,
        price: Number,
        stock: Number,
        totalSold: Number,
        totalRevenue: Number,
        createdAt: Date,
        daysSinceCreated: Number,
        lastOrderDate: Date
    }],
    
    // Low stock products details with alerts
    lowStockItems: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        category: String,
        stock: Number,
        price: Number,
        status: String,
        reorderLevel: Number,
        totalSold: Number,
        averageDailySales: Number,
        estimatedDaysUntilOutOfStock: Number,
        alertLevel: {
            type: String,
            enum: ['critical', 'warning', 'low']
        }
    }],
    
    // Product categories summary
    categoryStats: [{
        category: String,
        totalProducts: Number,
        activeProducts: Number,
        averagePrice: Number,
        totalRevenue: Number
    }],
    
    // Recent product activities
    recentActivities: [{
        type: {
            type: String,
            enum: ['product_added', 'product_updated', 'product_deleted', 'product_restored', 'review_added', 'review_deleted']
        },
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        performedBy: {
            _id: mongoose.Schema.Types.ObjectId,
            username: String
        },
        timestamp: Date,
        details: mongoose.Schema.Types.Mixed
    }],
    
    // Cache metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    
    // Cache expiration time in minutes
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
    
    // Prepare update data
    const updateData = {
        lastUpdated: now
    };
    
    // Add optional fields only if they exist in statsData
    if (statsData.overview) updateData.overview = statsData.overview;
    if (statsData.recentOrders) updateData.recentOrders = statsData.recentOrders;
    if (statsData.topRatedProducts) updateData.topRatedProducts = statsData.topRatedProducts;
    if (statsData.topSellingProducts) updateData.topSellingProducts = statsData.topSellingProducts;
    if (statsData.lowSellingProducts) updateData.lowSellingProducts = statsData.lowSellingProducts;
    if (statsData.lowStockItems) updateData.lowStockItems = statsData.lowStockItems;
    if (statsData.categoryStats) updateData.categoryStats = statsData.categoryStats;
    if (statsData.recentActivities) updateData.recentActivities = statsData.recentActivities;
    
    // Update or create dashboard stats
    const dashboardStats = await this.findOneAndUpdate(
        {},
        updateData,
        { 
            upsert: true, 
            new: true 
        }
    );
    
    return dashboardStats;
};

// Static method to add activity log
dashboardSchema.statics.addActivity = async function(activityData) {
    const activity = {
        type: activityData.type,
        productId: activityData.productId,
        productName: activityData.productName,
        performedBy: activityData.performedBy,
        timestamp: new Date(),
        details: activityData.details || {}
    };
    
    // Add activity to the beginning of the array and limit to last 50
    await this.findOneAndUpdate(
        {},
        {
            $push: {
                recentActivities: {
                    $each: [activity],
                    $position: 0,
                    $slice: 50 // Keep only the most recent 50 activities
                }
            }
        },
        { upsert: true }
    );
};

// Static method to update category stats
dashboardSchema.statics.updateCategoryStats = async function(categoryStatsData) {
    await this.findOneAndUpdate(
        {},
        {
            categoryStats: categoryStatsData,
            lastUpdated: new Date()
        },
        { upsert: true }
    );
};

// Static method to clear cache
dashboardSchema.statics.clearCache = async function() {
    await this.deleteMany({});
};

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;
module.exports.ItemSchema = ItemSchema;
