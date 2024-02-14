const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    brand: {
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
    productImage: {
        type: String
    },
    stock: {
        type: Number
    },
    description: {
        type: String
    },
    advancedDescription: {
        type: String
    }
})

const products = mongoose.model('Products', Schema);

module.exports = products;