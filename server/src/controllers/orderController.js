const { validationResult } = require('express-validator');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const mongoose = require("mongoose");
const { calculateTotalPriceAndValidateStock, updateProductStock } = require('../utilities/stock');
// const stripe = require('stripe');
require('dotenv').config();

// const stripeClient = new stripe(process.env.NHLANHLA_ADVOCATE_KEY, {
//   apiVersion: '2023-10-16',
// });

exports.createOrder = async (req, res, next) => {
  try {
    const { items, customerId } = req.body;

    console.log("Received customerId:", customerId);
    
    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    const user = await User.findById(customerId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Creating order for user ${user.name} (${user.email})`);

    let totalPrice = 0;
    let formattedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.productId}` });
      }

      totalPrice += product.price * item.quantity;

      formattedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    const newOrder = new Order({
      customerId, 
      items: formattedItems, 
      totalPrice,
      status: "pending",
    });

    const savedOrder = await newOrder.save();

    for (let item of formattedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    next(error);
  }
};


exports.getOrderHistory = async (req, res) => {
  try {
    const customerId = req.user?._id;

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    console.log("Fetching order history for customer:", customerId);

    const orders = await Order.find({ customerId })
      .populate("items.productId", "name price") 
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this customer" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error.message); 
    console.error(error.stack); 
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }

    // const allOrders = await Order.find();
    // console.log("All Orders:", allOrders); 

    const order = await Order.findById(id).populate("customerId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("Received orderId:", orderId); // Debug log

    // Clean the orderId string
    const cleanOrderId = orderId.trim();

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(cleanOrderId)) {
      return res.status(400).json({ 
        message: 'Invalid order ID format',
        receivedId: cleanOrderId
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validStatuses
      });
    }

    const order = await Order.findById(cleanOrderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel order that is already ${order.status}` 
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createBulkOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentToken } = req.body;
    const userId = req.user?.id;

    const { totalPrice, processedItems } = await calculateTotalPriceAndValidateStock(items);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'zar',
      payment_method: paymentToken,
      confirm: true,
      description: `Bulk order for user ${userId}`,
    });

    if (paymentIntent.status === 'succeeded') {
      const newOrder = new Order({
        user: userId,
        items: processedItems,
        totalPrice,
        shippingAddress,
        paymentMethod,
        paymentId: paymentIntent.id,
        status: 'paid',
        currency: 'ZAR',
        isBulkOrder: true
      });

      const savedOrder = await newOrder.save();
      await updateProductStock(processedItems);

      res.status(201).json(savedOrder);
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getOrderAnalytics = async (req, res, next) => {
  try {
    // Get dates from either query params or request body
    const startDate = req.query.startDate || req.body.startDate;
    const endDate = req.query.endDate || req.body.endDate;

    let matchStage = {};
    
    // Only apply date filtering if both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        matchStage.createdAt = { $gte: start, $lte: end };
      }
    }

    // Debug: Count total orders in the system
    const totalOrdersInSystem = await Order.countDocuments();
    console.log('Total orders in system:', totalOrdersInSystem);

    const orderAnalytics = await Order.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          averageOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);

    console.log('Match stage:', matchStage);
    console.log('Analytics results:', orderAnalytics);

    const popularProducts = await Order.aggregate([
      {
        $match: matchStage
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          productName: { $arrayElemAt: ["$productInfo.name", 0] }
        }
      }
    ]);

    // If no analytics found, return zeros but with actual orders count
    if (!orderAnalytics.length) {
      return res.status(200).json({
        analytics: {
          totalOrders: totalOrdersInSystem,
          totalRevenue: 0,
          averageOrderValue: 0
        },
        popularProducts: []
      });
    }

    res.status(200).json({
      analytics: {
        ...orderAnalytics[0],
        totalOrdersInSystem 
      },
      popularProducts
    });
  } catch (error) {
    console.error("Error in getOrderAnalytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.createGuestOrder = async (req, res, next) => {
  try {
    const { items, customerDetails } = req.body;

    if (!customerDetails || !customerDetails.email || !customerDetails.name || !customerDetails.address) {
      return res.status(400).json({ 
        message: "Customer details (name, email, and address) are required" 
      });
    }

    let totalPrice = 0;
    let formattedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.productId}` });
      }

      totalPrice += product.price * item.quantity;

      formattedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    // Create a temporary guest user ID
    const guestId = new mongoose.Types.ObjectId();

    const newOrder = new Order({
      customerId: guestId, 
      items: formattedItems,
      totalPrice,
      status: "pending",
      isGuestOrder: true,
      guestDetails: customerDetails 
    });

    const savedOrder = await newOrder.save();

    // Update product stock
    for (let item of formattedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      message: "Guest order created successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Guest order creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

