const express = require('express');
const route = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const multer = require('../middlewares/multer');
const cloudinary = require('../middlewares/cloudinary');

// require controller
const controller = require('../controller/adminController');
// require render
const services = require('../services/adminRender');
const upload = require('../middlewares/multer');

// admin dashboard
route.get('/admin/', adminAuth.checkAuth, services.admindashboard);

// admin login
route.get('/login', adminAuth.checkAuthenticated, services.adminLogin);

// category
route.get('/category', adminAuth.checkAuth, services.category)

// orders
route.get('/orders', adminAuth.checkAuth, services.orders);

route.get('/products', adminAuth.checkAuth, services.products);

route.get('/coupons', adminAuth.checkAuth, services.coupons);

route.get('/banners', adminAuth.checkAuth, services.banners);

route.get('/payments', adminAuth.checkAuth, services.payments);

route.get('/vendors', adminAuth.checkAuth, services.vendors);

route.get('/settings', adminAuth.checkAuth, services.settings);

route.get ('/addProducts', services.addProducts);

route.get('/users', adminAuth.checkAuth, services.users);

// route.post('/signup', controller.signup);

route.post('/login', controller.login);

route.get('/logout', controller.logout);

route.post('/addProducts', multer.single('productImage'), controller.addProduct);

route.get('/deleteProduct', services.deleteProduct);

route.get('/editProduct', services.editProduct);

route.post('/admin/updateProduct/:id', multer.single('productImage'), services.updateProduct)

route.get('/viewUser', services.viewUser);

route.post('/addCategory', multer.single('categoryImage'), services.addCategory);
route.get('/editCategory', services.editCategory);
route.post('/updateCategory', multer.single('categoryImage'), services.updatedCategory);

route.get('/deleteCategory', services.deleteCategory);

route.get('/blockUser', services.blockUser);

route.get('/viewVendor', services.viewVendor);
route.get('/toggleVendorAccess', services.toggleVendorAccess);

route.post('/createCoupon', services.createCoupon);
route.post('/delete-coupon/:id', services.deleteCoupon)

module.exports = route;