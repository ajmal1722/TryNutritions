const Userdb = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Category = require('../model/category');
const Products = require('../model/products');
const nodemailer = require('nodemailer');
const Order = require('../model/order');
const Banner = require('../model/banner');


// storing otp globally
let resetOtp = { emailOtp: null};

// home route (home page)
exports.homeRoutes = async (req, res) => {
    const limit = 8;
    const searchQuery = req.query.search || '';
    const category = await Category.find({}).exec();
    const banner = await Banner.find({}).exec();
    const product = await Products.find({}).exec();
    const verifiedUser = req.user;
    const latestProduct = await Products.find({})
                                .sort({createdAt: -1})
                                .limit(8)
                                .exec();
    const bestSellerProduct = await Products.find({})
                                .sort({salesCount: -1})
                                .limit(9)
                                .exec();      
                                console.log(banner)     
    try {
        const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR);
        
        res.status(201).render('user/body/home', {
            username: verify.name,
            Categories: category,
            Products: product,
            latestProducts: latestProduct,
            searchQuery: searchQuery,
            bestSellerProducts: bestSellerProduct,
            limit: limit,
            Banner: banner,
            verifiedUser
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
                limit: limit,
                Banner: banner,
                verifiedUser
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
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.render('user/body/login')
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError' || 'JsonWebTokenError') {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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

        // Schedule a task to delete user data if not validated after 3 minutes
        setTimeout(async () => {
            const user = await Userdb.findOne({ email: data.email });
            console.log('user.isValidated:', user.isVerified)
            if (user && user.isVerified === false) {
                await Userdb.deleteOne({ email: data.email });
                console.log('User data deleted after 2 minutes');
            }
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
        
        res.status(201).json({ userData });

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
            return res.status(401).json({ error: 'user does not exist' });
        }

        // check if the user is Active or Blocked
        if (userData.isBlocked === 'Blocked') {
            return res.status(403).json( { error: "You're Account has been blocked by Admin" });
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
            res.status(201).json({ userData })

        } else {
            res.status(401).json({ error: 'Invalid password' });
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


exports.updateProfile = async (req, res) => {
    try {
        const userData = req.body;
        const userId = userData.userId; // Extract userId from the request body

        // Find the user by userId and update their profile information
        const updateUser = await Userdb.findOneAndUpdate(
            { _id: userId }, // Filter to find the user by userId
            { $set: userData }, // Update the user data
            { new: true } // Return the updated user document
        );

        res.status(200).redirect('back');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.updateAddress = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user._id;

        const addressId = data.addressId; // Extract addressId from the request body
        // delete data.addressId; // Remove addressId from the data object

        // Find the user by their ID and update the specific address
        const updateUser = await Userdb.findOneAndUpdate(
            { _id: userId, "addresses._id": addressId }, // Filter to find the user and address by their IDs
            { $set: { "addresses.$": data } }, // Update the specific address in the addresses array
            { new: true } // Return the updated user document
        );

        res.status(200).redirect('back');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.id;
        const userId = req.user._id;

        // Find the user by their ID and update the addresses array to remove the specified address
        const updatedUser = await Userdb.findOneAndUpdate(
            { _id: userId },
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );

        res.status(200).json({ updatedUser });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get the user from the database
        const user = await Userdb.findById(userId);
        
        // Compare the current password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Incorrect Password" });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password with the hashed new password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' })
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

// Forgot Password
exports.generateOtp = (req, res) => {
    try {
        const { email } = req.body;
        console.log('email:', req.body)

        // Generate a random OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

        // save the generated otp in a variable
        resetOtp.emailOtp = otp

        const emailContent = `
            <h6>Verify Your Email Address</h6>
            
            <p class="text-center">Verify your email to finish Your resetting password.
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
            to: email, // list of receivers
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

        res.status(200).json({ resetOtp })
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
    
}

exports.verifyPasswordOtp = async (req, res) => {
    try {
        console.log(req.body);


    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}