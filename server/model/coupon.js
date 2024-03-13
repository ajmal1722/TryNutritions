const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponName: {
        type: String,
        required: true,
        unique: true,
      },
      couponCode: {
        type: String,
        required: true,
        unique: true,
      },
      discount: {
        type: Number,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot exceed 100']
      },
      maxPriceOffer: {
        type: Number
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      usageLimit: {
        type: Number,
        default: 1
      }
})

module.exports = mongoose.model('Coupon', couponSchema);