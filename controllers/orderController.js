const Order = require('../models/Order');
const Setting = require('../models/Setting');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            couponCode,
            couponDiscount,
            totalPrice,
        } = req.body;

        let { shippingPrice } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }

        // Recalculate shipping price on backend for security
        const settings = await Setting.findOne();
        if (settings && settings.shipping) {
            const { shipping } = settings;
            let isFree = false;

            const totalItems = orderItems.reduce((acc, item) => acc + item.qty, 0);

            if (shipping.isFreeShippingEnabled && itemsPrice >= shipping.freeShippingThreshold) {
                isFree = true;
            }
            if (shipping.buyXGetFreeEnabled && totalItems >= shipping.buyXItems) {
                isFree = true;
            }

            shippingPrice = isFree ? 0 : shipping.standardRate;
        }

        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            shippingPrice,
            couponCode: couponCode || null,
            couponDiscount: couponDiscount || 0,
            totalPrice: itemsPrice + shippingPrice - (couponDiscount || 0),
            orderNumber: `ORD-${Date.now()}` // Simple generation
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (order) {
            // Check if user is owner or admin
            if (req.user.isAdmin || order.user._id.equals(req.user._id)) {
                res.json(order);
            } else {
                res.status(401).json({ message: 'Not authorized' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            const updatedOrder = await order.save();

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems.product');

        if (order) {
            // Check if already delivered to prevent double stock reduction
            if (order.isDelivered) {
                return res.status(400).json({ message: 'Order is already marked as delivered' });
            }

            // Reduce stock for each product in the order
            const Product = require('../models/Product');

            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);

                if (product) {
                    // Reduce stock
                    product.countInStock = Math.max(0, product.countInStock - item.qty);

                    // Update status if out of stock
                    if (product.countInStock === 0) {
                        product.status = 'out_of_stock';
                    }

                    await product.save();
                }
            }

            // Update order status
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            order.status = 'delivered';

            const updatedOrder = await order.save();

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            if (status === 'delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();
            }
            // If status is not delivered, we don't necessarily want to unset isDelivered if it was true, 
            // as it might be a retrospective update, but let's keep it simple.

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
    updateOrderStatus,
};
