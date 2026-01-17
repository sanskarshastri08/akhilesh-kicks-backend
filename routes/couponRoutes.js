const express = require('express');
const router = express.Router();
const {
    validateCoupon,
    useCoupon,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/validate', validateCoupon);

// Protected routes
router.post('/use', protect, useCoupon);

// Admin routes
router.route('/')
    .get(protect, admin, getAllCoupons)
    .post(protect, admin, createCoupon);

router.route('/:id')
    .get(protect, admin, getCouponById)
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

module.exports = router;
