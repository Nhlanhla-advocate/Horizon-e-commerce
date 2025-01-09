const  validate  = require('../utilities/validation');
const { validationResult } = require('express-validator');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
// const stripe = require('stripe');
require('dotenv').config();

// const stripeClient = new stripe(process.env.NHLANHLA_ADVOCATE_KEY, {
//   apiVersion: '2023-10-16',
// });

exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentToken } = req.body;
    const userId = req.user?.id;

    // Fetch user details
    const user = await User.findById(userId).select('name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    let totalPrice = 0;
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'zar',
      payment_method: paymentToken,
      confirm: true,
      description: `Order for user ${user.name} (${user.email})`,
    });

    if (paymentIntent.status === 'succeeded') {
      const newOrder = new Order({
        user: userId,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod,
        paymentId: paymentIntent.id,
        status: 'paid',
        currency: 'ZAR'
      });

      const savedOrder = await newOrder.save();

      for (let item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      res.status(201).json(savedOrder);
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user?.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name price');

    const total = await Order.countDocuments({ user: req.user?.id });

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'paid') {
      return res.status(400).json({ message: 'Cannot cancel order that is not in paid status' });
    }

    const refund = await stripeClient.refunds.create({
      payment_intent: order.paymentId,
    });

    if (refund.status === 'succeeded') {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      order.status = 'refunded';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: 'Refund not successful' });
    }
  } catch (error) {
    next(error);
  }
};

exports.createBulkOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentToken } = req.body;
    const userId = req.user?.id;

    let totalPrice = 0;
    const processedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.productId}` });
      }
      
      const price = item.quantity >= 10 ? product.wholesalePrice : product.price;
      totalPrice += price * item.quantity;
      processedItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: price
      });
    }

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

      for (let item of processedItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }

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
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const orderAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
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

    const popularProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
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

    res.json({
      analytics: orderAnalytics[0],
      popularProducts
    });
  } catch (error) {
    next(error);
  }
};

exports.createGuestOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { items, shippingAddress, paymentMethod, paymentToken, guestEmail } = req.body;

    let totalPrice = 0;
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${item.productId}` });
      }
      totalPrice += product.price * item.quantity;
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'zar',
      payment_method: paymentToken,
      confirm: true,
      description: `Guest order for email ${guestEmail}`,
    });

    if (paymentIntent.status === 'succeeded') {
      const newOrder = new Order({
        user: null, // No user ID for guest
        items,
        totalPrice,
        shippingAddress,
        paymentMethod,
        paymentId: paymentIntent.id,
        status: 'paid',
        currency: 'ZAR'
      });

      const savedOrder = await newOrder.save();

      for (let item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      res.status(201).json(savedOrder);
    } else {
      res.status(400).json({ message: 'Payment not successful' });
    }
  } catch (error) {
    next(error);
  }
};

