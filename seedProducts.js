const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
    {
        name: "Adidas Ultraboost 23",
        price: 4999,
        originalPrice: 6999,
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5"
        ],
        category: "Mens Sports",
        brand: "Adidas",
        description: "Experience cloud-like comfort with every stride. The Ultraboost 23 features responsive Boost cushioning and a Primeknit upper for the ultimate running experience.",
        slug: "adidas-ultraboost-23",
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        colors: [
            { name: "Black", hex: "#1a1a1a" },
            { name: "White", hex: "#f5f5f5" },
            { name: "Red", hex: "#dc2626" }
        ],
        rating: 4.8,
        numReviews: 3,
        countInStock: 25,
        status: "active",
        status: "active",
        isFeatured: true,
        isNewProduct: true,
        isSale: false
    },
    {
        name: "Puma RS-X Reinvention",
        price: 7499,
        images: [
            "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2"
        ],
        category: "Mens Sneakers",
        brand: "Puma",
        description: "Bold, chunky, and unmistakably retro. The RS-X Reinvention brings back the iconic running system with modern comfort and street-ready style.",
        slug: "puma-rs-x-reinvention",
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
        colors: [
            { name: "Navy", hex: "#1e3a5f" },
            { name: "Grey", hex: "#6b7280" }
        ],
        rating: 4.6,
        numReviews: 2,
        countInStock: 18,
        status: "active",
        status: "active",
        isFeatured: true,
        isNewProduct: false,
        isSale: true
    },
    {
        name: "USPA Classic Court",
        price: 8999,
        images: [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86",
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77"
        ],
        category: "Mens Sneakers",
        brand: "USPA",
        description: "Sleek, sophisticated, and supremely comfortable. The Classic Court seamlessly transitions from day to night with premium materials and timeless design.",
        slug: "uspa-classic-court",
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
        colors: [
            { name: "Black", hex: "#1a1a1a" },
            { name: "Tan", hex: "#d4a574" }
        ],
        rating: 4.7,
        numReviews: 3,
        countInStock: 30,
        status: "active",
        status: "active",
        isFeatured: false,
        isNewProduct: true,
        isSale: true
    },
    {
        name: "Wrong Classic Flip",
        price: 1499,
        originalPrice: 1999,
        images: [
            "https://images.unsplash.com/photo-1603487742131-4160ec999306",
            "https://images.unsplash.com/photo-1556906781-9a412961c28c",
            "https://images.unsplash.com/photo-1562183241-b937e95585b6"
        ],
        category: "Flippers",
        brand: "Wrong",
        description: "Casual comfort redefined. The Classic Flip features a cushioned footbed and durable straps for all-day wear at the beach or around town.",
        slug: "wrong-classic-flip",
        sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        colors: [
            { name: "Black", hex: "#1a1a1a" },
            { name: "Navy", hex: "#1e3a5f" },
            { name: "Olive", hex: "#4d5c2a" }
        ],
        rating: 4.4,
        numReviews: 2,
        countInStock: 50,
        status: "active",
        isFeatured: false
    },
    {
        name: "Adidas Forum Low",
        price: 9499,
        images: [
            "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2",
            "https://images.unsplash.com/photo-1552346154-21d32810aba3",
            "https://images.unsplash.com/photo-1543508282-6319a3e2621f"
        ],
        category: "Mens Sneakers",
        brand: "Adidas",
        description: "A basketball icon reborn for the streets. The Forum Low brings vintage vibes with modern comfort technology for everyday style.",
        slug: "adidas-forum-low",
        sizes: ["UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
        colors: [
            { name: "White/Green", hex: "#22c55e" },
            { name: "White/Navy", hex: "#1e3a5f" }
        ],
        rating: 4.9,
        numReviews: 3,
        countInStock: 15,
        status: "active",
        isFeatured: true
    },
    {
        name: "Puma Velocity Nitro 2",
        price: 5499,
        originalPrice: 7999,
        images: [
            "https://images.unsplash.com/photo-1539185441755-769473a23570",
            "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
            "https://images.unsplash.com/photo-1605348532760-6753d2c43329"
        ],
        category: "Mens Sports",
        brand: "Puma",
        description: "Engineered for speed and endurance. The Velocity Nitro 2 offers responsive NITRO foam cushioning and a breathable mesh upper for peak performance.",
        slug: "puma-velocity-nitro-2",
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        colors: [
            { name: "Black/Yellow", hex: "#fbbf24" },
            { name: "Blue", hex: "#3b82f6" },
            { name: "Black", hex: "#1a1a1a" }
        ],
        rating: 4.5,
        numReviews: 2,
        countInStock: 22,
        status: "active",
        isFeatured: false
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Existing products cleared');

        // Insert new products
        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products seeded successfully!`);

        console.log('\nSeeded Products:');
        createdProducts.forEach(p => {
            console.log(`- ${p.name} (${p._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
