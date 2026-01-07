const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            default: ''
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        addresses: [
            {
                firstName: { type: String },
                lastName: { type: String },
                address: { type: String },
                city: { type: String },
                state: { type: String },
                pincode: { type: String },
                phone: { type: String },
                isDefault: { type: Boolean, default: false },
                type: { type: String, enum: ['home', 'office', 'other'], default: 'home' }
            }
        ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        cart: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                qty: { type: Number, default: 1 },
                size: { type: String }
            }
        ]
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
