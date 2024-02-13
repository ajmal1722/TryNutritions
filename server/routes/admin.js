const express = require('express');
const route = express.Router();
const adminAuth = require('../middlewares/adminAuth');

// require controller
const controller = require('../controller/adminController');
// require render
const services = require('../services/adminRender')

// admin dashboard
route.get('/admin/', adminAuth.checkAuth, services.admindashboard);

// admin login
route.get('/login', services.adminLogin);

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

route.post('/signup', controller.signup);

route.post('/login', controller.login);

module.exports = route;