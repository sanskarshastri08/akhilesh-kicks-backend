const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    console.log('getProducts called with query:', req.query);
    try {
        const pageSize = Number(req.query.pageSize) || 12;
        const page = Number(req.query.pageNumber) || 1;

        // Build filter object
        const filter = { status: 'active' };

        // Keyword search
        if (req.query.keyword) {
            filter.name = {
                $regex: req.query.keyword,
                $options: 'i',
            };
        }

        // Category filter
        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        // Brand filter
        if (req.query.brand && req.query.brand !== 'All') {
            filter.brand = req.query.brand;
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // New/Sale filters
        if (req.query.isNew === 'true') {
            filter.isNewProduct = true;
        }
        if (req.query.isSale === 'true') {
            filter.isSale = true;
        }

        // Sorting
        let sort = {};
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'price_asc':
                    sort = { price: 1 };
                    break;
                case 'price_desc':
                    sort = { price: -1 };
                    break;
                case 'rating':
                    sort = { rating: -1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        } else {
            sort = { createdAt: -1 };
        }

        console.log('Filter:', filter);
        console.log('Sort:', sort);

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        console.log(`Found ${products.length} products`);

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        console.error('getProducts error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    console.log('getProductById called with id:', req.params.id);
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('getProductById error:', error);
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    console.log('deleteProduct called with id:', req.params.id);
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('deleteProduct error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    console.log('createProduct called with body:', req.body);
    try {
        const product = new Product({
            name: req.body.name || 'Sample Name',
            price: req.body.price || 0,
            user: req.user?._id,
            images: req.body.images || ['https://via.placeholder.com/400'],
            brand: req.body.brand || 'Sample Brand',
            category: req.body.category || 'Sample Category',
            numReviews: 0,
            description: req.body.description || 'Sample description',
            slug: req.body.slug || `sample-slug-${Date.now()}`,
            countInStock: req.body.countInStock || 0
        });

        const createdProduct = await product.save();
        console.log('Product created:', createdProduct._id);
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('createProduct error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    console.log('updateProduct called with id:', req.params.id);
    try {
        const {
            name,
            price,
            description,
            images,
            brand,
            category,
            countInStock,
            slug,
            variants,
            sizes,
            colors,
            status,
            originalPrice,
            isNewProduct,
            isSale,
            isFeatured
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description || product.description;
            product.images = images || product.images;
            product.brand = brand || product.brand;
            product.category = category || product.category;
            product.slug = slug || product.slug;
            product.variants = variants || product.variants;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.status = status || product.status;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
            product.isNewProduct = isNewProduct !== undefined ? isNewProduct : product.isNewProduct;
            product.isSale = isSale !== undefined ? isSale : product.isSale;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

            const updatedProduct = await product.save();
            console.log('Product updated:', updatedProduct._id);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('updateProduct error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    console.log('createProductReview called for product:', req.params.id);
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            // For now, just acknowledge the review
            // In a full implementation, you'd create a Review document
            console.log(`Review submitted for ${product.name} by ${req.user.name}`);
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('createProductReview error:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
};
