const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    imageId: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);