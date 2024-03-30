const Userdb = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Category = require('../model/category');
const Products = require('../model/products');
const nodemailer = require('nodemailer');

// home route (home page)
exports.homeRoutes = async (req, res) => {
    const limit = 8;
    const searchQuery = req.query.search || '';
    const category = await Category.find({}).exec();
    const product = await Products.find({}).exec();
    const latestProduct = await Products.find({})
                                .sort({createdAt: -1})
                                .limit(8)
                                .exec();
    const bestSellerProduct = await Products.find({})
                                .sort({salesCount: -1})
                                .limit(9)
                                .exec();
    try {
        const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR);
        
        res.status(201).render('user/body/home', {
            username: verify.name,
            Categories: category,
            Products: product,
            latestProducts: latestProduct,
            searchQuery: searchQuery,
            bestSellerProducts: bestSellerProduct,
            limit: limit
        })
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.status(201).render('user/body/home', {
                username: undefined, 
                Categories: category,
                Products: product,
                latestProducts: latestProduct,
                searchQuery: searchQuery,
                bestSellerProducts: bestSellerProduct,
                limit: limit
            });
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
            const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR)
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

        // Generate a random OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        // Save the OTP and its expiry time in the user document
        const expiryTime = Date.now() + 2 * 60 * 1000; // 2 minutes expiry time

        // encrypt the password
        const encPassword = await bcrypt.hash(data.password, 10) // here 10 is optional

        // Insert new user data
        const userData = await Userdb.create({
            ...data,
            password: encPassword,
            emailOtp: {
                otp: otp,
                expiry: new Date(expiryTime)
            }
        });

        const emailContent = `
            <h6>Verify Your Email Address</h6>
            
            <p class="text-center">Verify your email to finish signing up with TryNutritions.
            use the following verification code:
            </p>

            <h4 class="text-center">${otp}</h4>

            <p>The verification code is valid for  2 minutes</p>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.APP_EMAIL,
              pass: process.env.APP_PASSWORD,
            },
        });
                    
        // send mail with defined transport object
        const mailOptions = {
            from: process.env.APP_EMAIL, // sender address
            to: data.email, // list of receivers
            subject: "OTP for account verification", // Subject line
            text: `Your OTP for account verification is: ${otp}`, // plain text body
            html: emailContent, // html body
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log('err:', err)
            }
            
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        })

        // Schedule a task to delete the OTP after 2 minutes
        setTimeout(async () => {
            await Userdb.findOneAndUpdate(
                { email: data.email },
                { $unset: { emailOtp: "" } } // Delete the emailOtp field
            );
            console.log('OTP expired and deleted');
        }, 2 * 60 * 1000);



        // generate a token for user
        const token = jwt.sign(
            {id: userData._id, name: userData.name, email: userData.email},
            process.env.AUTH_STR,
            {
                expiresIn: '2h'
            }
        );

        userData.token = token
        userData.password = undefined
        
        res.status(201).redirect('/otp-page');

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
                process.env.AUTH_STR,
            {
                expiresIn: '2h'
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

exports.makePayment = async (req, res) => {
    const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_API_ID,
        key_secret: process.env.RAZORPAY_API_KEY,
    })
}