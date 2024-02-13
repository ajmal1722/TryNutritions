const admin = require('../model/adminModel');
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Userdb = require('../model/userModel');
const { token } = require('morgan');
const { options } = require('../routes/admin');

exports.signup = async (req, res) => {
    try {
        
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }

        const encPassword = await bcrypt.hash(data.password, 10);

        const user = await admin.create({
            ...data,
            password: encPassword
        });

        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_STR,
            { expiresIn: '2h'}
        )

        res.status(201).json({
            status: 'success',
            token,
            data: {
                admin: user
            }
        })
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
                process.env.SECRET_STR,
                { expiresIn: '1h' }
            )
            userData.token = token

            // cookie section 
            res.cookie('jwt', token, { httpOnly: true })
            res.status(201).redirect('/admin');
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