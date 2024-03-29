const admin = require('../model/adminModel');
const products = require('../model/products');
const Category = require('../model/category');
const jsScript = require('../middlewares/script');
const uploads = require('../middlewares/multer');
const cloudinary = require('../middlewares/cloudinary');
const fs = require('fs');

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
                { expiresIn: '3d' }
            )
            userData.token = token

            // cookie section
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60  * 1000),
                httpOnly: true
            };

            res.cookie('adminToken', token, options)
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

exports.logout = async (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
}

// add products
exports.addProduct = async (req, res) => {
    try {
        // const data = {
        //     name: req.body.name,
        //     category: req.body.category,
        //     brand: req.body.brand,
        //     manufacture: req.body.manufacture,
        //     description: req.body.description,
        //     mrp: req.body.mrp,
        //     sellingPrice: req.body.sellingPrice
        // }
        const file = req.file;
        const data = req.body;

        const categories = await Category.find({}).exec();

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file.path);

        const productDiscount = await jsScript.calculateDiscount(req.body.mrp, req.body.sellingPrice);
        
        // console.log(data)
        const newProduct = new products({
            ...data,
            imageUrl: result.secure_url, // Cloudinary image URL
            imageId: result.public_id,    // Cloudinary image ID,
            discount: productDiscount
        });

        // Save the new product to the database
        const create = await newProduct.save();
    
        res.status(200).render('admin/body/add_products', {
            pageName: 'Add Products',
            Category: categories
        })
    } catch (error){
        res.status(500).json({
            status: 'failed',
            message: error.message
        })
    }
}