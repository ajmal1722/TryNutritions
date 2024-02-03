// home route (home page)
exports.homeRoutes = (req, res) => res.render('user/body/home');

// signup
exports.userSigup = (req, res) => res.render('user/body/signup');

// login
exports.userLogin = (req, res) => res.render('user/body/login');

// shop
exports.shop = (req, res) => res.render('user/body/shop');

// shop-details
exports.shopDetails = (req, res) => res.render('user/body/shop-details');

// cart
exports.cart = (req, res) => res.render('user/body/cart');