const express = require('express');
const route = express.Router();

// require rendering page of user
const services = require('../services/userRender');
// require controller
const controller = require('../controller/userController')

// home route (home page)
route.get('/',services.homeRoutes);

// signup
route.get('/signup', services.userSigup);

// login
route.get('/login', services.userLogin);

// shop
route.get('/shop', services.shop);

// shop-details
route.get('/shop-details', services.shopDetails);

// cart
route.get('/cart', services.cart);

// checkout
route.get('/checkout', services.checkout);


// API
route.all('/api/users', controller.create)

module.exports = route;