require('dotenv').config();
const mongoose = require('mongoose');

async function fixCloudinaryUrls() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected\n');
        console.log('Fixing Cloudinary URLs in database...\n');

        // Find all products with cloudinary URLs
        const products = await mongoose.connection.db.collection('products').find({
            images: { $regex: 'cloudinary' }
        }).toArray();

        console.log(`Found ${products.length} product(s) with Cloudinary URLs\n`);

        for (const product of products) {
            const fixedImages = product.images.map(url => {
                if (url.includes('localhost') && url.includes('cloudinary.com')) {
                    // Extract the Cloudinary URL
                    const match = url.match(/(https:\/\/res\.cloudinary\.com\/.+)/);
                    if (match) {
                        console.log(`Fixing: ${product.name}`);
                        console.log(`  Before: ${url}`);
                        console.log(`  After:  ${match[1]}`);
                        return match[1];
                    }
                }
                return url;
            });

            // Update the product
            await mongoose.connection.db.collection('products').updateOne(
                { _id: product._id },
                { $set: { images: fixedImages } }
            );

            console.log(`✅ Updated ${product.name}\n`);
        }

        console.log('✅ All Cloudinary URLs fixed!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixCloudinaryUrls();
