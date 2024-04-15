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
route.get('/admin/show-line-chart', adminAuth.checkAuth, services.showLineChart);

// admin login
route.get('/login', adminAuth.checkAuthenticated, services.adminLogin);

// category
route.get('/category', adminAuth.checkAuth, services.category)

route.get('/products', adminAuth.checkAuth, services.products);

route.get('/coupons', adminAuth.checkAuth, services.coupons);

route.get('/banners', adminAuth.checkAuth, services.report);
route.post('/add-banner', multer.single('bannerImage'), services.addBanner);

route.get('/payments', adminAuth.checkAuth, services.payments);

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
route.delete('/delete-coupon/:id', services.deleteCoupon);
route.post('/updateCoupon', services.updateCoupon);

// orders
route.get('/orders', adminAuth.checkAuth, services.orders);
route.get('/order-details', adminAuth.checkAuth, services.orderDetails);
route.post('/update-order-status', adminAuth.checkAuth, services.updateOrderStatus);
// route.get('/delete-order', adminAuth.checkAuth, services.deleteOrder);
route.get('/download-excel', controller.downloadExcel);

module.exports = route;