const express = require('express');
const route = express.Router();

// require controller
const controller = require('../controller/adminController');
// require render
const services = require('../services/adminRender')

// admin dashboard
route.get('/admin/', services.admindashboard);

// category
route.get('/category', services.category)

// orders
route.get('/orders', services.orders);

route.get('/products', services.products);

route.get('/coupons', services.coupons);

route.get('/banners', services.banners);

route.get('/payments', services.payments);

route.get('/settings', services.settings);

route.get('/products', services.products);

module.exports = route;