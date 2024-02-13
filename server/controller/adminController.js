const admin = require('../model/adminModel');
require('dotenv').config()

const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const user = await admin.create(req.body);

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