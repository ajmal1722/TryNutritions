const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    vendorName: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isBlocked: {
        type: String,
        default: 'Active'
    }  
})

module.exports = mongoose.model('Vendor', Schema)