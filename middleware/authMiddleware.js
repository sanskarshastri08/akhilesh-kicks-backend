const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // console.log('protect middleware: token found', token); 

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('protect middleware: token decoded', decoded);

            req.user = await User.findById(decoded.id).select('-password');
            // console.log('protect middleware: user found', req.user?.email);

            next();
        } catch (error) {
            console.error('protect middleware: error', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        console.log('admin middleware: access granted for', req.user.email);
        next();
    } else {
        console.error('admin middleware: access denied for', req.user?.email);
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
