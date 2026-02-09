const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { cloudinary, upload } = require('../config/cloudinary');

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field. Use "image" for single upload or "images" for multiple uploads.' });
        }
        return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
};

// @route   POST /api/upload
// @desc    Upload a single image to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
}, async (req, res) => {
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
router.post('/multiple', protect, admin, (req, res, next) => {
    upload.array('images', 10)(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
}, async (req, res) => {
    try {
        console.log('Multiple upload request received');
        console.log('Files count:', req.files?.length || 0);

        if (!req.files || req.files.length === 0) {
            console.error('No files uploaded in request');
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Return array of Cloudinary URLs
        const fileUrls = req.files.map(file => ({
            url: file.path, // Cloudinary URL
            publicId: file.filename, // Cloudinary public ID
        }));

        console.log('Files uploaded successfully:', fileUrls.length);
        res.status(200).json({
            message: 'Files uploaded successfully to Cloudinary',
            files: fileUrls,
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: error.message || 'Failed to upload images',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
