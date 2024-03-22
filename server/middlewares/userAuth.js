const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const { promisify } = require('util');
require('dotenv').config();
const Cart = require('../model/cart')

// Creating a Promisified Version of jwt.verify
const verifyToken = promisify(jwt.verify);

exports.checkAuth = async (req, res, next) => {
    try {
        // Get the token from cookies or headers
        const token = req.cookies.jwt || req.headers.authorization;

        // If token is not present redirect to login page
        if (!token) {
            return res.status(200).redirect('/login');
        }

        try {
            // Verify token
            const decoded = await verifyToken(token, process.env.AUTH_STR);

            // check if the user exists in the database
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(200).redirect('/login');
            }

            req.user = user;
            next();
        } catch (error) {
            // Handle token verification errors
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(200).redirect('/login');
            }

            throw error; // Rethrow other errors
        }
    } catch (error) {
        res.status(500).send(error);
    }
};


// Middleware to check if the user is authenticated
exports.checkAuthenticated = (redirectTo) => (req, res, next) => {
    // Check if the user is authenticated (has a valid token)
    if (req.cookies.jwt) {
        // Redirect to the specified page
        return res.redirect(redirectTo || '/');
    }

    // If not authenticated, proceed to the next middleware or route handler
    next();
};

exports.fetchCartItems = async (req, res, next) => {
    if (req.user) {
        try {
            console.log('req.user:', req.user)
            const cart = await Cart.findOne({ user: req.user._id });
            if (cart) {
                res.locals.cartItemCount = cart.items.length;
            } else {
                res.locals.cartItemCount = 0;
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
            res.locals.cartItemCount = 0;
        }
    } else {
        // User is not authenticated
        console.log('req.user:', req.user)
        res.locals.cartItemCount = 0;
    }
    next();
};