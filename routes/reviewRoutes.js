const express = require('express');
const router = express.Router();
const {
    getReviews,
    updateReviewStatus
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getReviews);
router.route('/:id').put(protect, admin, updateReviewStatus);

module.exports = router;
