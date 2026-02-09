const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    shipping: {
        standardRate: { type: Number, default: 0 },
        freeShippingThreshold: { type: Number, default: 0 },
        freeShippingMinItems: { type: Number, default: 0 },
        expressRate: { type: Number, default: 0 },
        isFreeShippingEnabled: { type: Boolean, default: false },
        buyXGetFreeEnabled: { type: Boolean, default: false },
        buyXItems: { type: Number, default: 2 },
        promotionText: { type: String, default: "" },
    },
    general: {
        storeName: { type: String, default: "Just Your Kicks" },
        storeEmail: { type: String, default: "store@justyourkicks.in" },
        storePhone: { type: String, default: "+91 9755373421" },
        storeAddress: { type: String, default: "" },
        currency: { type: String, default: "INR" },
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
