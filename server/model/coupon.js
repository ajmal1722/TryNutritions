const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    minCartValue: {
        type: Number,
        required: true,
        default: 0
    },
    couponType: {
        type: String,
        enum: ['Fixed', 'Percentage'],
        required: true
    },
    discount: {
        type: Number,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot exceed 100']
    },
    discountPrice: {
      type: Number
    },
    maxPriceOffer: {
        type: Number
    },
    usageLimit: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Coupon', couponSchema);