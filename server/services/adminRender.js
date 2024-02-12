// admin dashboard
exports.admindashboard = (req, res) => res.render('admin/body/dashboard');

// orders
exports.orders = (req, res) => res.render('admin/body/orders')

// category
exports.category = (req, res) => res.render('admin/body/category');

exports.products = (req, res) => res.render('admin/body/products');

exports.coupons = (req, res) => res.render('admin/body/coupons');

exports.banners = (req, res) => res.render('admin/body/banner');

exports.payments = (req, res) => res.render('admin/body/payments');

exports.settings = (req, res) => res.render('admin/body/settings');