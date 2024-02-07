const express = require('express');
const route = express.Router();

// require rendering page of user
const services = require('../services/userRender');
// require controller
const controller = require('../controller/userController')

// home route (home page)
route.get('/',controller.homeRoutes);

// login
route.get('/login', controller.userLogin);

// signup
route.get('/signup', services.userSigup);

// shop
route.get('/shop', services.shop);

// shop-details
route.get('/shop-details', services.shopDetails);

// cart
route.get('/cart', services.cart);

// checkout
route.get('/checkout', services.checkout);


// API
route.post('/api/users', controller.create);

route.post('/api/login', controller.login)

module.exports = route;