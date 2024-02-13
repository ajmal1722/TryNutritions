const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    }
})

const admin = mongoose.model('admin', Schema);

module.exports = admin;