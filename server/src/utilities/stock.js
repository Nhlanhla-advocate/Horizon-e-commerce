const Product = require('../models/product');

// Utility function to calculate total price and validate stock
const calculateTotalPriceAndValidateStock = async (items) => {
    let totalPrice = 0;
    const processedItems = [];

    for (let item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const price = item.quantity >= 10 ? product.wholesalePrice : product.price;
        totalPrice += price * item.quantity;
        processedItems.push({
            product: item.productId,
            quantity: item.quantity,
            price: price
        });
    }

    return { totalPrice, processedItems };
};

// Utility function to update product stock
const updateProductStock = async (items) => {
    for (let item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
        });
    }
};

module.exports = {
    calculateTotalPriceAndValidateStock,
    updateProductStock
};
