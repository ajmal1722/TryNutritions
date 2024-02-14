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
route.get('/login', adminAuth.checkAuthenticated, services.adminLogin);

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

route.get ('/addProducts', services.addProducts);

route.get('/users', services.users);

route.post('/signup', controller.signup);

route.post('/login', controller.login);

route.get('/logout', controller.logout);
module.exports = route;