const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    image: {
        filename: String,
        contentType: String,
        imageBase64: String
    },
    heading: {
        type: String
    },
    subHeading: {
        type: String
    },
    buttonLink: {
        type: String
    }
})

module.exports = mongoose.model('Banner', Schema);