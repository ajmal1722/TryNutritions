const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../model/userModel')
const Products = require('../model/products');
const Category = require('../model/category');
const Cart = require('../model/cart');
const { calculateDiscount, calculateTotalBill } = require('../middlewares/script');

// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = async (req, res) => {
    const product = await Products.find(req.query).exec();
    const category = await Category.find().exec();
    
    const feauturedProduct = await Products.find({})
                                            .sort({ discount: -1 })
                                            .limit(3)
                                            .exec()

    res.render('user/body/shop', {
        pageName: 'Shop',
        Products: product,
        Categories: category,
        feauturedProducts: feauturedProduct
    });
} 

// shop-details
exports.shopDetails = async (req, res) => {
    const productId = req.query.id;
    const product = await Products.findById(productId);
    const category = await Category.find({}).exec();
    const relatedProduct = await Products.find({ category: product.category }).limit(6);
    const feauturedProduct = await Products.find({})
                                            .sort({ discount: -1 })
                                            .limit(4)
                                            .exec()

    res.render('user/body/shop-details', {
        pageName: 'Shop-details',
        Product: product,
        Categories: category,
        relatedProducts: relatedProduct,
        feauturedProducts: feauturedProduct
    });
} 

exports.contact = (req, res) => res.render('user/body/contact', { pageName: 'Contact us' });

// checkout
exports.checkout = (req, res) => res.render('user/body/checkout', { pageName: 'Checkout' });

// Error Messages
exports.errorMessage = (req, res) => res.render('user/body/error');
    
// my account
exports.myAccount = (req, res) => {
    const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR);
    res.status(201).render('user/body/myAccount', { pageName: 'My Account', userName: verify.name });
}

// cart
exports.cart = async (req, res) => {
    try {
        const user = req.user._id;
        const cart = await Cart.findOne({ user });

        // console.log('User: ', user);
        // console.log('Cart: ', cart);

        res.render('user/body/cart', {
            pageName: 'Cart',
            cart: cart,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
} 

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.user._id;

        // Get the user's cart
        let cart = await Cart.findOne({ user: userId });

        // If the cart doesn't exist, create a new one
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.items.findIndex(val => String(val.itemId) === productId);

        if (existingProductIndex !== -1) {
            // Product exists, increment quantity
            cart.items[existingProductIndex].quantity += 1;
        } else {
            // Product doesn't exist, add it to the cart
            const product = await Products.findById(productId);

            if (product) {
                cart.items.push({
                    itemId: product._id,
                    name: product.name,
                    price: product.sellingPrice,
                    quantity: 1
                });
            } else {
                return res.status(404).send({ error: 'Product not found' });
            }
        }

        // Update the total bill in the cart (assuming calculateTotalBill is implemented correctly)
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();

        // Redirect to the current page
        res.status(200).redirect('back');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Delete Cart
exports.deleteCart = async (req, res) => {
    try {
        const itemID = req.query.id;
        const userID = req.user._id;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userID });

        // Remove the item from the cart based on the itemId
        cart.items = cart.items.filter(item => String(item.itemId) !== itemID);

        // Recalculate the total bill
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();

        console.log('Item removed from the cart successfully', cart);
        res.status(200).redirect('/cart');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

// increment and decrement products
exports.changeQuantity = async (req, res) => {
    const userId = req.user._id;
    const itemId = req.query.id;
    const action = req.query.action;

    // Get the user's cart
    let cart = await Cart.findOne({ user: userId });

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(val => String(val.itemId) === itemId);

    if (itemIndex !== -1) {
        // Update the quantity based on the action
        if (action === 'increment') {
            cart.items[itemIndex].quantity += 1;
        } else if (action === 'decrement' && cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        }

        // Update the total bill in the cart
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();
        console.log('product added succesfully')
        res.status(200).redirect('/cart');
    } else {
        res.status(404).send({ error: 'Item not found in the cart' });
    }
};
