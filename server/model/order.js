const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        size: String
    }],
    totalAmount: {
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