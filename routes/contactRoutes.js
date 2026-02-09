const express = require('express');
const {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route - submit contact form
router.post('/', submitContactForm);

// Admin routes - manage contacts
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
