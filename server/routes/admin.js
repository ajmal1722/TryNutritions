const express = require('express');
const route = express.Router();

// require controller
const controller = require('../controller/adminController');
// require render
const services = require('../services/adminRender')

route.get('/admin/', services.admindashboard);

module.exports = route;