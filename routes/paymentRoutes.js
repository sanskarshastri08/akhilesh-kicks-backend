const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getPaymentDetails,
    handleWebhook,
    refundPayment,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/payments/create-order
 * @desc    Create a new Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, createRazorpayOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private
 */
router.post('/verify', protect, verifyRazorpayPayment);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:paymentId', protect, getPaymentDetails);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (verified via signature)
 */
router.post('/webhook', handleWebhook);

/**
 * @route   POST /api/payments/refund
 * @desc    Refund a payment
 * @access  Private (Admin only)
 */
router.post('/refund', protect, admin, refundPayment);

module.exports = router;
