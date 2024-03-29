const jwt = require('jsonwebtoken');
const Vendor = require('../model/vendorModel');
const { promisify } = require('util');
require('dotenv').config();

// creating a promisified version of jwt.verify
const verifyToken = promisify(jwt.verify);

exports.checkAuth = async (req, res, next) => {
    try {
        // Get the token from cookies or headers
        const token = req.cookies.jwt || req.headers.authorization;

        // If token is not present redirect to login page
        if (!token) {
            return res.status(200).redirect('/vendor/login');
        }

        try {
            // Verify token
            const decoded = await verifyToken(token, process.env.PRIVATE_STR);

            // check if the user exists in the database
            const user = await admin.findById(decoded.id);

            if (!user) {
                return res.status(200).redirect('/vendor/login');
            }

            req.user = user;
            next();
        } catch (error) {
            // Handle token verification errors
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(200).redirect('/vendor/login');
            }

            throw error; // Rethrow other errors
        }
    } catch (error) {
        res.status(500).send(error);
    }
};

// Middleware to check if the user is authenticated
exports.checkAuthenticated = (req, res, next) => {
    // Check if the user is authenticated (has a valid token)
    if (req.cookies.jwt) {
        // Redirect to the dashboard
        return res.redirect('/vendor');
    }

    // If not authenticated, proceed to the next middleware or route handler
    next();
};