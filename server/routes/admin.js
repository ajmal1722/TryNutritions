const express = require('express');
const route = express.Router();

// require controller
const controller = require('../controller/adminController');
// require render
const services = require('../services/adminRender')

// admin dashboard
route.get('/admin/', services.admindashboard);

route.get('/orders', services.orders);

module.exports = route;