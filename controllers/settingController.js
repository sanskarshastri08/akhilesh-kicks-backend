const Setting = require('../models/Setting');

// Get all settings or initialize if not exists
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = await Setting.create({});
        }
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

// Update shipping settings
exports.updateShippingSettings = async (req, res) => {
    try {
        const {
            standardRate,
            freeShippingThreshold,
            freeShippingMinItems,
            expressRate,
            isFreeShippingEnabled,
            buyXGetFreeEnabled,
            buyXItems,
            promotionText
        } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        settings.shipping = {
            standardRate: Number(standardRate) || 0,
            freeShippingThreshold: Number(freeShippingThreshold) || 0,
            freeShippingMinItems: Number(freeShippingMinItems) || 0,
            expressRate: Number(expressRate) || 0,
            isFreeShippingEnabled: Boolean(isFreeShippingEnabled),
            buyXGetFreeEnabled: Boolean(buyXGetFreeEnabled),
            buyXItems: Number(buyXItems) || 0,
            promotionText: promotionText || ""
        };

        await settings.save();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating shipping settings', error: error.message });
    }
};

// Update general settings
exports.updateGeneralSettings = async (req, res) => {
    try {
        const { storeName, storeEmail, storePhone, storeAddress, currency } = req.body;

        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
        }

        settings.general = {
            storeName,
            storeEmail,
            storePhone,
            storeAddress,
            currency
        };

        await settings.save();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating general settings', error: error.message });
    }
};
