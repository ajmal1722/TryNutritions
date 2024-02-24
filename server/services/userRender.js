const jwt = require('jsonwebtoken');
const Products = require('../model/products');
const Category = require('../model/category');

// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = async (req, res) => {
    const product = await Products.find({}).exec();
    const category = await Category.find({}).exec();

    res.render('user/body/shop', {
        pageName: 'Shop',
        Products: product,
        Categories: category,
    });
} 

// shop-details
exports.shopDetails = async (req, res) => {
    const productId = req.query.id;
    const product = await Products.findById(productId);

    res.render('user/body/shop-details', {
        pageName: 'Shop-details',
        Product: product
    });
} 

exports.contact = (req, res) => res.render('user/body/contact', { pageName: 'Contact us' });

// cart
exports.cart = (req, res) => {
    try {
        const verify = jwt.verify(req.cookies.jwt, 'shhhh');
        res.render('user/body/cart', { pageName: 'Cart' });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.status(201).redirect('/login');
        } else {
            res.status(500).send(error);
        }
    }
} 

// checkout
exports.checkout = (req, res) => res.render('user/body/checkout', { pageName: 'Checkout' });

// Error Messages
exports.errorMessage = (req, res) => res.render('user/body/error');
    

// my account
exports.myAccount = (req, res) => {
    try {
        const verify = jwt.verify(req.cookies.jwt, 'shhhh');
        res.status(201).render('user/body/myAccount', { pageName: 'My Account', userName: verify.name });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.status(201).render('user/body/login');
        } else {
            res.status(500).send(error);
        }
    }
}