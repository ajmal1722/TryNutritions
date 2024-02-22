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
    vendorAccessEnabled: {
        type: String,
        default: 'Denied'
    }  
})

module.exports = mongoose.model('Vendor', Schema)