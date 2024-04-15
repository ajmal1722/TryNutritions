const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    manufacture: {
        type: String
    },
    mrp: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        default: 1
    },
    stock: {
        type: Number
    },
    description: {
        type: String
    },
    advancedDescription: {
        type: String
    },
    originOfProduct: {
        type: String
    },
    salesCount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number
    },
    imageUrl: {
        type: String
    },
    imageId: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const products = mongoose.model('Products', Schema);

module.exports = products;