// admin dashboard
exports.admindashboard = (req, res) => res.render('admin/body/dashboard', { pageName: 'Home' });

// admin login
exports.adminLogin = (req, res) => res.render('admin/body/login');

// orders
exports.orders = (req, res) => res.render('admin/body/orders', { pageName: 'Orders' })

// category
exports.category = (req, res) => res.render('admin/body/category', { pageName: 'Category' });

exports.products = (req, res) => res.render('admin/body/products', { pageName: 'Products' });

exports.addProducts = (req, res) => res.render('admin/body/add_products', { pageName: 'Add Products' })

exports.coupons = (req, res) => res.render('admin/body/coupons', { pageName: 'Coupons' });

exports.banners = (req, res) => res.render('admin/body/banner', { pageName: 'Banners' });

exports.payments = (req, res) => res.render('admin/body/payments', { pageName: 'Payments' });

exports.settings = (req, res) => res.render('admin/body/settings', { pageName: 'Settings' });

exports.users = (req, res) => res.render('admin/body/users', { pageName: 'Users' })