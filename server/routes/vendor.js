const controller = require('../controller/vendorController');
const services = require('../services/vendorRender');
const vendorAuth = require('../middlewares/vendorAuth');

const express = require('express');
const route = express.Router();

route.post('/signup', controller.signup);
route.post('/login', controller.login);
route.get('/logout', controller.logout);

route.get('/signup', services.signup);
route.get('/login', vendorAuth.checkAuthenticated, services.login);

// dashboard
route.get('/', vendorAuth.checkAuth, services.dashboard);

module.exports = route;