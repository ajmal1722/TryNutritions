const Vendor = require('../model/vendorModel');
const Products = require('../model/products');

require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }
    
        const encPassword = await bcrypt.hash(data.password, 10);
    
        const user = await Vendor.create({
            ...data,
            password: encPassword
        });
    
        const token = jwt.sign(
            { id: user._id },
                process.env.PRIVATE_STR,
                { expiresIn: '2h'}
        )
    
        res.status(201).render('/vendor/body/dashbord');
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        // get all data from frontend
        const {email, password} = req.body;

        // find user in DB
        const userData = await admin.findOne({email});

        // match the password
        if (userData && (await bcrypt.compare(password, userData.password))) {
            const token = jwt.sign(
                { id: userData._id, email: userData.email },
                process.env.PRIVATE_STR,
                { expiresIn: '3d' }
            )
            userData.token = token

            // cookie section
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60  * 1000),
                httpOnly: true
            };

            res.cookie('jwt', token, options)
            res.status(201).redirect('/vendor');
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error message:', error.message);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
}