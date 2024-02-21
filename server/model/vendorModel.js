const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    vendorName: {
        type: String
    },
    phone: {
        type: Number
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