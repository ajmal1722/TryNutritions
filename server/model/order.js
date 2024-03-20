const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    user: {
        type: String,
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            min: 1,
            default: 1},
            price: Number
    }],
    subTotal: {
        type: Number,
        required: true,
    },
    couponDiscount: {
        type: Number,
        required: true,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        name: String,
        phone: String,
        houseName: String,
        streetName: String,
        postOffice: String,
        district: String,
        state: String,
        pinCode: String
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Razorpay'],
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;