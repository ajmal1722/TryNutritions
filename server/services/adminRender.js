const Product = require("../model/products");
const Users = require('../model/userModel');
const Orders = require('../model/order');
const Category = require('../model/category');
const Vendors = require('../model/vendorModel');
const Coupon = require('../model/coupon');
const jsScript = require('../middlewares/script');
const fs = require('fs');
const uploads = require('../middlewares/multer');
const cloudinary = require('../middlewares/cloudinary');
const { error } = require("console");
const nodemailer = require('nodemailer')

// admin dashboard
exports.admindashboard = async (req, res) => {
    try {
        const orders = await Orders.find({}).sort({ orderDate: -1 }).limit(9).exec();
        const orderlength = await Orders.find({}).exec();
        const users = await Users.find({}).exec();
        const totalOrder = await Orders.aggregate([{
            $group: {
                _id: null,
                totalFinalAmount: { $sum: "$finalAmount" }
            }
        }]);

        console.log(totalOrder[0])
        // Extract the total final amount from the result
        const totalFinalAmount = totalOrder.length > 0 ? totalOrder[0].totalFinalAmount : 0;

        res.render('admin/body/dashboard', { 
            pageName: 'Home',
            Orders: orders,
            totalOrders: orderlength,
            Users: users,
            totalsales: totalFinalAmount
         });  
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
} 

// admin login
exports.adminLogin = (req, res) => res.render('admin/body/login');

// orders
exports.orders = async (req, res) => {
    try {
        const sortValue = req.query.sortBy;
        let sortCriteria = {};

        if (sortValue === 'latest') {
            sortCriteria = { orderDate: -1 }; // Sort by createdAt field in descending order for latest
        } else if (sortValue === 'oldest') {
            sortCriteria = { orderDate: 1 }; // Sort by createdAt field in ascending order for oldest
        }

        const orders = await Orders.find({}).sort(sortCriteria).exec();

        res.render('admin/body/orders', { 
            pageName: 'Orders',
            Orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send({ error: error.message });
    }
};


exports.orderDetails = async (req, res) => {
    try {
        const orderId = req.query.id;
        console.log('orderId:', orderId)

        // Fetch the order and populate the product field to access the imageUrl
        const order = await Orders.findById(orderId).populate('items.product');
        const userId = order.userId;

        const user = await Users.findById(userId);

        res.render('admin/body/orderDetails', { 
            pageName: 'Order Details',
            Order: order,
            User: user
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: error.message });
    }
}

// category
exports.category = async (req, res) => {
    const categories = await Category.find({}).exec();
    res.render('admin/body/category', {
        pageName: 'Category',
        Category: categories
    });
}

exports.products = async (req, res) => {
    try {
        const items = await Product.find({}).exec();

        res.render('admin/body/products', {
            productsList: items,
            pageName: 'Products'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send(error.message);
    }
};

exports.addProducts = async (req, res) => {
    const categories = await Category.find({}).exec();
     res.render('admin/body/add_products', {
        pageName: 'Add Products',
        Category: categories
    })
} 

exports.coupons = async (req, res) => {
    coupon = await Coupon.find({}).exec()
    res.render('admin/body/coupons', {
        pageName: 'Coupons',
        Coupon: coupon
    });
} 

exports.banners = (req, res) => res.render('admin/body/banner', { pageName: 'Banners' });

exports.payments = (req, res) => res.render('admin/body/payments', { pageName: 'Payments' });

exports.settings = (req, res) => res.render('admin/body/settings', { pageName: 'settings' });

exports.vendors = async (req, res) => {
    const vendor = await Vendors.find({}).exec();
    res.render('admin/body/vendors', {
        pageName: 'Vendor Details',
        vendorList: vendor
    });
} 

exports.users = async (req, res) => {
    const users = await Users.find({}).exec();

    res.render('admin/body/users', {
        pageName: 'Users',
        userList: users
    });
} 

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        console.log(productId);

        // delete the productImage from cloudinary
        const product = await Product.findById(productId);
        if (product.imageId) {
            await cloudinary.uploader.destroy(product.imageId);
        }

        const deletedProduct = await Product.findByIdAndDelete(productId);
        
        res.status(200).redirect('admin/products')
    } catch (error) {
        res.status(500).send(error.message);
    }
}

exports.editProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const categories = await Category.find({}).exec();
        const product = await Product.findOne({ _id: productId })

        res.status(200).render('admin/body/update_product', {
            pageName: 'Upadate Product',
            Product: product,
            Category: categories
        });
    } catch (error) {
        res.status(500).send(error.message);
    } 
}

exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({ _id: productId });

        const productDiscount = await jsScript.calculateDiscount(req.body.mrp, req.body.sellingPrice);

        const updatedProduct = {
            ...req.body,
            discount: productDiscount
        };

        // Check if a new image file is uploaded
        if (req.file) {
            // Delete previous image from Cloudinary
            if (product.imageId) {
                await cloudinary.uploader.destroy(product.imageId);
            }

            const result = await cloudinary.uploader.upload(req.file.path);
            updatedProduct.imageUrl = result.url;
            updatedProduct.imageId = result.public_id;

            console.log('url:', updatedProduct.imageUrl);
        }

        const data = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });

        res.status(200).redirect('/admin/products');
    } catch (error) {
        res.status(500).send(error.message);
    }
}

// Users
exports.viewUser = async (req, res) => {
    const userId = req.query.id;
    const userData = await Users.findOne({_id: userId});
    res.render('admin/body/viewUser', {
        pageName: 'User Information',
        user: userData
    })
} 

exports.blockUser = async (req, res) => {
    try {
        const userId = req.query.id;

        const user = await Users.findOne({ _id: userId })
        console.log('user' ,user)
    if (!user){
        return res.send('user not found');
    } 

        user.isBlocked = user.isBlocked === 'Blocked' ? 'Active' : 'Blocked';
        await user.save()

    res.status(200).redirect('/admin/users');
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// Category

exports.addCategory = async (req, res) => {
    try {
        const file = req.file;

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file.path);

        // Create a new category with the data and Cloudinary information
        const categoryData = {
            ...req.body,
            imageUrl: result.secure_url, // Cloudinary image URL
            imageId: result.public_id     // Cloudinary image ID
        };

        const createCategory = await Category.create(categoryData);

        res.status(200).redirect('admin/category');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    // get the id from query string
    const categoryId = req.query.id;

    try {
        // Find the category to get the image public_id
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ error: error.message });
        }

        // Extract the public_id from the image URL
        const publicId = category.imageId;

        // Delete the category from the database
        await Category.findByIdAndDelete(categoryId);

        // If a public_id exists, delete the image from Cloudinary
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
exports.editCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log('Id:', categoryId);

        const category = await Category.findById(categoryId);

        res.redirect('back')

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.updatedCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log('id:', categoryId);
        console.log('body: ', req.body);
        console.log('File: ', req.file);

        const existingCategory = await Category.findById(categoryId);
        console.log('existingCategory:', existingCategory)

        const updatedCategory = { ...req.body };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updatedCategory.imageUrl = result.url;
            updatedCategory.imageId = result.public_id;

            console.log('url:', updatedCategory.imageUrl)
        }

        updatedCategory.category = req.body.category;

        const updatedCategoryDoc = await Category.findByIdAndUpdate(
            categoryId,
            updatedCategory,
            { new: true }
        );

        res.status(200).redirect('/admin/category');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// vendor
exports.viewVendor = async (req, res) => {
    const userId = req.query.id;
    const userData = await Vendors.findOne({_id: userId});
    res.render('admin/body/viewVendor', {
        pageName: 'Vendor Information',
        user: userData
    })
}

exports.toggleVendorAccess = async (req, res) => {
    try {
        const vendorId = req.query.id;

        const vendor = await Vendors.findById(vendorId);

        if (!vendor) {
            return res.send('Vendor not found');
        }

        vendor.vendorAccessEnabled = vendor.vendorAccessEnabled === 'Denied' ? 'Enabled' : 'Denied';
        await vendor.save();

        res.status(200).redirect('/admin/vendors');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


// Coupons
exports.createCoupon = async (req, res) => {
    try {
        const couponData = req.body;
        const coupon = await Coupon.create(couponData);

        res.status(200).redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.id;
        console.log('couponId:', couponId);

        const couponDelete = await Coupon.findByIdAndDelete(couponId);
        res.status(200).json({ message: 'Coupon deleted succesfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.updateCoupon = async (req, res) => {
    try {
        const couponId = req.body._id;
        console.log('id:', couponId)
        const data = req.body;

        console.log(data)
        const updatedData = await Coupon.findByIdAndUpdate(couponId, data, { new: true });
        res.status(200).redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const order = await Orders.findById(orderId);
        // Update the order status
        order.status = status;
        await order.save();

        // Retrieve the user associated with the order
        const user = await Users.findById(order.userId);

        const emailContent = `
            <p>Dear ${order.user},</p>

            <p>Your order with orderId: <strong>${order.orderId}</strong> has been <strong>${order.status}</strong></p>
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
            to: user.email, // list of receivers
            subject: "Order Updated", // Subject line
            text: "Your order status is updated!", // plain text body
            html: emailContent, // html body
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return console.log('err:', err)
            }
            
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        })

        res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}
