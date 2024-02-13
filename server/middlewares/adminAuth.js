const jwt = require('jsonwebtoken');
const admin = require('../model/adminModel');
const { promisify } = require('util');
require('dotenv').config();

// Creating a Promisified Version of jwt.verify
const verifyToken = promisify(jwt.verify);

exports.checkAuth = async (req, res, next) => {
    try {
        // Get the token from cookies or headers
        const token = req.cookies.jwt || req.headers.authorization

        // If token is not present redirect to login page
        if (!token) {
            return res.status(200).redirect('/login')
        }

        // Verify token
        const decoded = await verifyToken(token, process.env.SECRET_STR);

        // check if the user exists in database
        const user = await admin.findById(decoded.id)
        if (!user){
            return res.status(200).redirect('/admin/login')
        }

        req.user = user

        next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError'){
            res.redirect('/login')
        } else {
            res.status(500).send(error);
        }
    }
}