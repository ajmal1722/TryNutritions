const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: Number
    },
    houseName: {
        type: String
    },
    streetName: {
        type: String
    },
    postOffice: {
        type: String
    },
    district: {
        type: String
    },
    state: {
        type: String
    },
    pinCode: {
        type: Number
    }
});

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required field']
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
    },
    addresses: [addressSchema],
    emailOtp: {
        otp: String,
        expiry: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Userdb = mongoose.model('users', Schema);

module.exports = Userdb;