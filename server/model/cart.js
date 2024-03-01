const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({
    user: {
        type: ObjectID,
        ref: 'users'
    },
    items: [{
        itemId: {
            type: ObjectID,
            ref: 'Products'
      },
      name: String,
      quantity: {
            type: Number,
            min: 1,
            default: 1},
            price: Number
    }],
    bill: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Cart = mongoose.model('Cart', Schema)
module.exports = Cart;