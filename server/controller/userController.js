const Userdb = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// create and save user
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
                expiresIn: '2h'
            }
        );

        userData.token = token
        userData.password = undefined
        
        res.status(201).json(userData);

    } catch (error) {
        console.error('Error message:', error.message);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    }
};
