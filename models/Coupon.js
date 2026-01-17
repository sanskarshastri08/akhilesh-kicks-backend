const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minPurchase: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number, // For percentage discounts
            default: null,
        },
        usageLimit: {
            type: Number,
            default: null, // null means unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            default: null, // null means no expiry
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
