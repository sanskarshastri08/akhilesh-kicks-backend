const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 * @route POST /api/payments/create-order
 * @access Private
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1, // Auto capture payment
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message,
        });
    }
};

/**
 * Verify Razorpay Payment
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId, // Our database order ID
        } = req.body;

        // Validate required fields
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification details',
            });
        }

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }

        // If orderId is provided, update the order in database
        if (orderId) {
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            // Update order with payment details
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: razorpay_payment_id,
                status: 'completed',
                update_time: new Date().toISOString(),
            };

            await order.save();
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id,
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message,
        });
    }
};

/**
 * Get Payment Details
 * @route GET /api/payments/:paymentId
 * @access Private
 */
const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await razorpay.payments.fetch(paymentId);

        res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error('Fetch payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details',
            error: error.message,
        });
    }
};

/**
 * Razorpay Webhook Handler
 * @route POST /api/payments/webhook
 * @access Public (but verified)
 */
const handleWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (webhookSecret) {
            // Verify webhook signature
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (webhookSignature !== expectedSignature) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        console.log('Webhook Event:', event);

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                // Payment was successful
                console.log('Payment captured:', paymentEntity.id);
                // Update order status if needed
                break;

            case 'payment.failed':
                // Payment failed
                console.log('Payment failed:', paymentEntity.id);
                // Update order status if needed
                break;

            case 'payment.authorized':
                // Payment authorized but not captured
                console.log('Payment authorized:', paymentEntity.id);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};

/**
 * Refund Payment
 * @route POST /api/payments/refund
 * @access Private (Admin only)
 */
const refundPayment = async (req, res) => {
    try {
        const { paymentId, amount, orderId } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required',
            });
        }

        const refundOptions = {
            payment_id: paymentId,
        };

        // If amount is specified, do partial refund
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        // Update order status if orderId is provided
        if (orderId) {
            const order = await Order.findById(orderId);
            if (order) {
                order.status = 'refunded';
                await order.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            refund,
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Refund processing failed',
            error: error.message,
        });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentDetails,
    handleWebhook,
    refundPayment,
};
