const express = require('express');
const route = express.Router();

const authentication = require('../middlewares/userAuth');

// require rendering page of user
const services = require('../services/userRender');
// require controller
const controller = require('../controller/userController')

// home route (home page)
route.get('/', authentication.getCartInNotAuthorizedPage, authentication.fetchCartItems, controller.homeRoutes);

// login
route.get('/login', controller.userLogin);

// Forgot Password
route.get('/forgot-password', services.forgottenPassword);
route.post('/generate-otp', controller.generateOtp);
route.post('/verify-Otp', controller.verifyPasswordOtp);

// logout
route.get('/logout', controller.logout);

// signup
route.get('/signup', services.userSigup);
route.post('/signup', controller.create);

// otp verification page
route.get('/otp-page', services.otpPage);
route.post('/verify-otp-for-signup', services.verifyOtp);

// shop
route.get('/shop' || '/shop/shop', authentication.getCartInNotAuthorizedPage, authentication.fetchCartItems, services.shop);
route.post('/update-featured-products-limit', services.viewMore)

// shop-details
route.get('/shop-details', authentication.getCartInNotAuthorizedPage, authentication.fetchCartItems, services.shopDetails);

// cart
route.get('/cart', authentication.checkAuth, authentication.fetchCartItems, services.cart);

// checkout
route.get('/checkout', authentication.checkAuth, authentication.fetchCartItems, services.checkout);

// Error
route.get('/error', authentication.getCartInNotAuthorizedPage, authentication.fetchCartItems, services.errorMessage)

// Order
route.get('/order-completed', authentication.fetchCartItems, services.orderSuccess);

// my account
route.get('/myAccount', authentication.checkAuth, authentication.fetchCartItems, services.myAccount);

// contact us
route.get('/contact', authentication.getCartInNotAuthorizedPage, authentication.fetchCartItems, services.contact);
route.post('/message-from-user', authentication.checkAuth, services.messageFromUser)

// Category filtering in shop page
// route.get('/filter-category', services.filterCategory)


route.post('/api/login', controller.login);


route.post('/add-to-cart', authentication.checkAuth, services.addToCart);
route.post('/delete-cart', authentication.checkAuth, services.deleteCart);
route.post('/update-cart-quantity', authentication.checkAuth, services.changeQuantity);

route.post('/applyCoupon', authentication.checkAuth, services.applyCoupon);
route.post('/removeCoupon', authentication.checkAuth, services.removeCoupon);

// route.post('/proceed-to-checkout', authentication.checkAuth, services.proceedToCheckout);
route.post('/add-address', authentication.checkAuth, services.addNewAddress);
route.post('/place-order', authentication.checkAuth, services.placeOrder);
route.post('/save-payment-details', authentication.checkAuth, services.paymentSuccess);

route.post('/update-profile', authentication.checkAuth, controller.updateProfile);
route.post('/update-address', authentication.checkAuth, controller.updateAddress);
route.delete('/delete-address', authentication.checkAuth, controller.deleteAddress);
route.post('/change-password', authentication.checkAuth, controller.changePassword);
route.post('/cancel-order', authentication.checkAuth, controller.cancelOrder);

module.exports = route;