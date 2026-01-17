const Coupon = require('../models/Coupon');

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        // Find coupon (case-insensitive)
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        // Check if coupon is active
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        // Check validity period
        const now = new Date();
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
            return res.status(400).json({ message: 'This coupon is not yet valid' });
        }
        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'This coupon has reached its usage limit' });
        }

        // Check minimum purchase
        if (orderTotal < coupon.minPurchase) {
            return res.status(400).json({
                message: `Minimum purchase of ₹${coupon.minPurchase} required to use this coupon`
            });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
            // Apply max discount if set
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed order total
        if (discountAmount > orderTotal) {
            discountAmount = orderTotal;
        }

        res.json({
            valid: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                description: coupon.description,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment coupon usage
// @route   POST /api/coupons/use
// @access  Private
const useCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.usedCount += 1;
        await coupon.save();

        res.json({ message: 'Coupon usage recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            validFrom,
            validUntil,
            description,
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchase: minPurchase || 0,
            maxDiscount: maxDiscount || null,
            usageLimit: usageLimit || null,
            validFrom: validFrom || Date.now(),
            validUntil: validUntil || null,
            description: description || '',
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (key === 'code') {
                coupon[key] = req.body[key].toUpperCase();
            } else {
                coupon[key] = req.body[key];
            }
        });

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.deleteOne();
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    validateCoupon,
    useCoupon,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
