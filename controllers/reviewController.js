const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('user', 'name').populate('product', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Update review status (Approve/Reject)
// @route   PUT /api/reviews/:id
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const review = await Review.findById(req.params.id);

        if (review) {
            review.status = status;
            await review.save();

            // If approved, update product validation/stats if not already done
            // This logic depends on if 'product.numReviews' counts only approved reviews
            // Re-calculating average rating:
            if (status === 'approved') {
                const product = await Product.findById(review.product);
                // ... logic to recalculate average
            }

            res.json(review);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getReviews,
    updateReviewStatus
}
