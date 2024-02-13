const admin = require('../model/adminModel');
require('dotenv').config()

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
        res.send(error)
    }
}