const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    imageUrl: {
        type: String
    },
    imageId: {
        type: String
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