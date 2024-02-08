const jwt = require('jsonwebtoken');

// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = (req, res) => res.render('user/body/shop', { pageName: 'Shop' });

// shop-details
exports.shopDetails = (req, res) => res.render('user/body/shop-details', { pageName: 'Shop-details' });

// cart
exports.cart = (req, res) => res.render('user/body/cart', { pageName: 'Cart' });

// checkout
exports.checkout = (req, res) => res.render('user/body/checkout', { pageName: 'Checkout' });

// my account
exports.myAccount = (req, res) => {
    if (req.cookies.jwt) {
        const verify = jwt.verify(req.cookies.jwt, 'shhhh');
        res.render('user/body/myAccount', { pageName: 'My Account', userName: verify.name })
    }
} 