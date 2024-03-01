const express = require('express');
const route = express.Router();

const authentication = require('../middlewares/userAuth');

// require rendering page of user
const services = require('../services/userRender');
// require controller
const controller = require('../controller/userController')

// home route (home page)
route.get('/', controller.homeRoutes);

// login
route.get('/login', controller.userLogin);

// logout
route.get('/logout', controller.logout);

// signup
route.get('/signup', services.userSigup);

// shop
route.get('/shop' || '/shop/shop', services.shop);

// shop-details
route.get('/shop-details', services.shopDetails);

// cart
route.get('/cart', authentication.checkAuth, services.cart);

// checkout
route.get('/checkout', services.checkout);

// Error
route.get('/error', services.errorMessage)

// my account
route.get('/myAccount', authentication.checkAuth, services.myAccount);

// contact us
route.get('/contact', services.contact)



route.post('/api/users', controller.create);

route.post('/api/login', controller.login);


route.post('/add-to-cart', authentication.checkAuth, services.addToCart)

module.exports = route;