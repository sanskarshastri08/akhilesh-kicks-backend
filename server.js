const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow any localhost or 127.0.0.1 origin
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
        }

        // Allow specific production domains from environment variables
        const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
            : [];
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Optional: Log blocked origin for debugging
        console.log('Blocked by CORS:', origin);

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies/headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes')); // For admin management

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
