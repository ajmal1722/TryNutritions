
// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = (req, res) => res.render('user/body/shop', { pageName: 'Shop' });

// shop-details
exports.shopDetails = (req, res) => res.render('user/body/shop-details', { pageName: 'Shop-details' });

// cart
exports.cart = (req, res) => res.render('user/body/cart', { pageName: 'Cart' });

// checkout
exports.checkout = (req, res) => res.render('user/body/checkout', { pageName: 'Checkout' });

// my account
exports.myAccount = (req, res) => res.render('user/body/myAccount', { pageName: 'My Account' })