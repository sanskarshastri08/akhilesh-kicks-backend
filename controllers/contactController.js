const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create contact entry
        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            message: 'Thank you for contacting us! We will get back to you soon.',
            contact: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
            },
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Failed to submit contact form. Please try again.' });
    }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private/Admin
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        // Mark as read
        if (contact.status === 'new') {
            contact.status = 'read';
            await contact.save();
        }

        res.json(contact);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({ message: 'Failed to fetch contact' });
    }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const { status, replyMessage } = req.body;

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        if (status) {
            contact.status = status;
        }

        if (replyMessage) {
            contact.replyMessage = replyMessage;
            contact.replied = true;
            contact.repliedAt = new Date();
            contact.status = 'replied';
        }

        await contact.save();

        res.json({
            message: 'Contact updated successfully',
            contact,
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({ message: 'Failed to update contact' });
    }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await contact.deleteOne();

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ message: 'Failed to delete contact' });
    }
};

module.exports = {
    submitContactForm,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
};
