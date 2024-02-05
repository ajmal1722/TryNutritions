const Userdb = require('../model/userModel');

// create and save user
exports.create = async (req, res) => {
    try {
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

        // Insert new user data
        const userData = await Userdb.create(data);

        res.status(201).send('Data added successfully');
    } catch (error) {
        console.error('Error message:', error.message);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    }
};
