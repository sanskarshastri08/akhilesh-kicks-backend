const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        isNewProduct: {
            type: Boolean,
            default: false,
        },
        isSale: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            required: true,
            default: 0,
        },
        numReviews: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'draft', 'out_of_stock'],
            default: 'active',
        },
        sizes: [
            {
                type: String,
            },
        ],
        colors: [
            {
                name: String,
                hex: String,
            },
        ],
        variants: [
            {
                size: String,
                color: String,
                stock: Number,
                sku: String,
            },
        ],
        metaTitle: String,
        metaDescription: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'User',
        },
        countInStock: {
            type: Number,
            default: 0
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
