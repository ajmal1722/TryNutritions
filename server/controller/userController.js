const Userdb = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Category = require('../model/category');

// home route (home page)
exports.homeRoutes = async (req, res) => {
    const category = await Category.find({}).exec();
    try {
        const verify = jwt.verify(req.cookies.jwt, 'shhhh');
        res.status(201).render('user/body/home', {
            username: verify.name,
            Categories: category
        })
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.status(201).render('user/body/home', { username: undefined, Categories: category });
        } else {
            res.status(500).send(error);
        }
    }
};

// login page
exports.userLogin = async (req, res) => {
    try {
        const category = await Category.find({}).exec();
        if (req.cookies.jwt) {
            const verify = jwt.verify(req.cookies.jwt, 'shhhh')
            res.status(201).redirect('/');
        } else {
            res.render('user/body/login')
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.status(201).render('user/body/login');
        } else {
            res.status(500).send(error);
        }
    }
};

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
            {id: userData._id, name: userData.name, email: userData.email},
            'shhhh',
            {
                expiresIn: '1h'
            }
        );

        userData.token = token
        userData.password = undefined
        
        res.status(201).redirect('/');

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
        const userData = await Userdb.findOne({email});

        // check if the user exists
        if (!userData) {
            return res.status(401).json({ success: false, message: 'user does not exist' });
        }

        // check if the user is Active or Blocked
        if (userData.isBlocked === 'Blocked') {
            return res.status(403).render('user/body/error', {
                pageName: '403 Error',
                statusCode: 403,
                errorMessage: "You're Account has been blocked by Admin.. "
            });
        }

        // match the password
        if (userData && (await bcrypt.compare(password, userData.password))) {
            const token = jwt.sign(
                { id: userData._id, name: userData.name },
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
            res.cookie('jwt', token, options)
            res.status(201).redirect('/')

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

exports.logout = (req, res) => {
    res.clearCookie('jwt'); // Clear the 'jwt' cookie
    res.redirect('/'); // Redirect to the login page or any other desired page
}
