const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    syncCart,
    syncWishlist
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getUsers);
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.route('/cart').post(protect, syncCart);
router.route('/wishlist').post(protect, syncWishlist);
router
    .route('/:id')
    .get(protect, admin, getUserById)
    .delete(protect, admin, deleteUser);

module.exports = router;
