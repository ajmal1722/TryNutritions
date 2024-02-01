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

module.exports = route