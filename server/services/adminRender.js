const Product = require("../model/products");

// admin dashboard
exports.admindashboard = (req, res) => res.render('admin/body/dashboard', { pageName: 'Home' });

// admin login
exports.adminLogin = (req, res) => res.render('admin/body/login');

// orders
exports.orders = (req, res) => res.render('admin/body/orders', { pageName: 'Orders' })

// category
exports.category = (req, res) => res.render('admin/body/category', { pageName: 'Category' });
// res.render('admin/body/products', { pageName: 'Products' });
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

exports.addProducts = (req, res) => res.render('admin/body/add_products', { pageName: 'Add Products' })

exports.coupons = (req, res) => res.render('admin/body/coupons', { pageName: 'Coupons' });

exports.banners = (req, res) => res.render('admin/body/banner', { pageName: 'Banners' });

exports.payments = (req, res) => res.render('admin/body/payments', { pageName: 'Payments' });

exports.settings = (req, res) => res.render('admin/body/settings', { pageName: 'Settings' });

exports.users = (req, res) => res.render('admin/body/users', { pageName: 'Users' });

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
        
    } catch (error) {
        res.status(500).send(error.message);
    } 
}