const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { cloudinary, upload } = require('../config/cloudinary');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload a single image to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Cloudinary automatically uploads and returns the URL
        res.status(200).json({
            message: 'File uploaded successfully to Cloudinary',
            url: req.file.path, // Cloudinary URL
            publicId: req.file.filename, // Cloudinary public ID
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images to Cloudinary
// @access  Private/Admin
router.post('/multiple', protect, admin, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Return array of Cloudinary URLs
        const fileUrls = req.files.map(file => ({
            url: file.path, // Cloudinary URL
            publicId: file.filename, // Cloudinary public ID
        }));

        res.status(200).json({
            message: 'Files uploaded successfully to Cloudinary',
            files: fileUrls,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete an image from Cloudinary
// @access  Private/Admin
router.delete('/:publicId', protect, admin, async (req, res) => {
    try {
        const publicId = req.params.publicId;

        // Extract the full public ID (including folder path)
        // If publicId contains 'just-your-kicks/products/', use it as is
        // Otherwise, prepend the folder path
        const fullPublicId = publicId.includes('just-your-kicks/products/')
            ? publicId
            : `just-your-kicks/products/${publicId}`;

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(fullPublicId);

        if (result.result === 'ok' || result.result === 'not found') {
            res.status(200).json({
                message: 'File deleted successfully from Cloudinary',
                result: result
            });
        } else {
            res.status(400).json({
                message: 'Failed to delete file from Cloudinary',
                result: result
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
