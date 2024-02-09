const jwt = require('jsonwebtoken');

// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = (req, res) => res.render('user/body/shop', { pageName: 'Shop' });

// shop-details
exports.shopDetails = (req, res) => res.render('user/body/shop-details', { pageName: 'Shop-details' });

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