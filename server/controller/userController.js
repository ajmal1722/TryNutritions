const Userdb = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// create and save user (signup)
exports.create = async (req, res) => {
    try {
        // get all data from body
        const data = {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password
        };

        // Check if phone already exists
        const existingPhone = await Userdb.findOne({ phone: data.phone });
        if (existingPhone) {
            return res.status(400).send('Phone number already exists');
        }

        // Check if email already exists
        const existingEmail = await Userdb.findOne({ email: data.email });
        if (existingEmail) {
            return res.status(400).send('Email already exists');
        }

        // encrypt the password
        const encPassword = await bcrypt.hash(data.password, 10) // here 10 is optional

        // Insert new user data
        const userData = await Userdb.create({
            ...data,
            password: encPassword
        });

        // generate a token for user
        const token = jwt.sign(
            {id: userData._id, email: userData.email},
            'shhhh',
            {
                expiresIn: '1h'
            }
        );

        userData.token = token
        userData.password = undefined
        
        res.status(201).json(userData);

    } catch (error) {
        console.error('Error message:', error.message);
        res.status(500).send({
            message: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        // get all data from frontend
        const {email, password} = req.body;

        // find user in DB
        const userData = await Userdb.findOne({email})

        // match the password
        if (userData && (await bcrypt.compare(password, userData.password))) {
            const token = jwt.sign(
                {id: userData._id},
                'shhhh',
            {
                expiresIn: '1h'
            }
            );
            userData.token = token
            userData.password = undefined

            // cookie section
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60  * 1000),
                httpOnly: true
            };
            res.status(201).cookie('token', token, options).json({
                success: true,
                token,
                userData
            })

        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // send token in user cookie

    } catch (error) {
        console.error('Error message:', error.message);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    }
}
