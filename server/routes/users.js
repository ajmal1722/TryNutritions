const express = require('express');
const route = express.Router();

// require rendering page of user
const services = require('../services/userRender');

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

module.exports = route