const Vendor = require('../model/vendorModel');

exports.dashboard = (req, res) => res.render('vendor/body/dashboard', { pageName: 'Home' });

exports.signup = (req, res) => res.render('vendor/body/signup');
exports.login = (req, res) => res.render('vendor/body/login');