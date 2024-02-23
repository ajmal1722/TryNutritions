const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    image: {
        filename: String,
        contentType: String,
        imageBase64: String
    },
    category: {
        type: String
    }
})

module.exports = mongoose.model('Banner', Schema);