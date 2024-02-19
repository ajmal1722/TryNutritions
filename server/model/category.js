const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    }
})

module.exports = categorySchema = mongoose.model('Category', Schema);