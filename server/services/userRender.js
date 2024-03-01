const jwt = require('jsonwebtoken');
const Products = require('../model/products');
const Category = require('../model/category');

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
    const category = await Category.find({}).exec()

    res.render('user/body/shop-details', {
        pageName: 'Shop-details',
        Product: product,
        Categories: category
    });
} 

exports.contact = (req, res) => res.render('user/body/contact', { pageName: 'Contact us' });

// cart
exports.cart = (req, res) => res.render('user/body/cart', { pageName: 'Cart' });

// checkout
exports.checkout = (req, res) => res.render('user/body/checkout', { pageName: 'Checkout' });

// Error Messages
exports.errorMessage = (req, res) => res.render('user/body/error');
    
// my account
exports.myAccount = (req, res) => {
    const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR);
    res.status(201).render('user/body/myAccount', { pageName: 'My Account', userName: verify.name });
 }