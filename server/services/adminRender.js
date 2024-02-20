const Product = require("../model/products");
const Users = require('../model/userModel');
const Category = require('../model/category');

// admin dashboard
exports.admindashboard = (req, res) => res.render('admin/body/dashboard', { pageName: 'Home' });

// admin login
exports.adminLogin = (req, res) => res.render('admin/body/login');

// orders
exports.orders = (req, res) => res.render('admin/body/orders', { pageName: 'Orders' })

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

exports.coupons = (req, res) => res.render('admin/body/coupons', { pageName: 'Coupons' });

exports.banners = (req, res) => res.render('admin/body/banner', { pageName: 'Banners' });

exports.payments = (req, res) => res.render('admin/body/payments', { pageName: 'Payments' });

exports.settings = (req, res) => res.render('admin/body/settings', { pageName: 'Settings' });

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

        console.log('productId', productId)
        
        const product = await Product.findOne({ _id: productId });
        const updatedProduct = req.body;

        console.log('updatedProduct:', updatedProduct)

        const data = await Product.findByIdAndUpdate(productId, updatedProduct, {new: true});

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
    const data = req.body;
    const createCategory = await Category.create(data)
    res.status(200).redirect('admin/category')
}

exports.deleteCategory = async (req, res) => {
    // get the id from query string
    const categoryId = req.query.id;

    // match the id and delete
    const category = await Category.findByIdAndDelete({ _id: categoryId });

    res.redirect('/admin/category');
}