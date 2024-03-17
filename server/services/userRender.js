const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../model/userModel')
const Products = require('../model/products');
const Category = require('../model/category');
const Cart = require('../model/cart');
const Coupon = require('../model/coupon');
const { calculateDiscount, calculateTotalBill } = require('../middlewares/script');

// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

// shop
exports.shop = async (req, res) => {
    const product = await Products.find(req.query).exec();
    const category = await Category.find().exec();
    
    const feauturedProduct = await Products.find({})
                                            .sort({ discount: -1 })
                                            .limit(3)
                                            .exec()

    res.render('user/body/shop', {
        pageName: 'Shop',
        Products: product,
        Categories: category,
        feauturedProducts: feauturedProduct
    });
} 

// shop-details
exports.shopDetails = async (req, res) => {
    const productId = req.query.id;
    const product = await Products.findById(productId);
    const category = await Category.find({}).exec();
    const relatedProduct = await Products.find({ category: product.category }).limit(6);
    const feauturedProduct = await Products.find({})
                                            .sort({ discount: -1 })
                                            .limit(4)
                                            .exec()

    res.render('user/body/shop-details', {
        pageName: 'Shop-details',
        Product: product,
        Categories: category,
        relatedProducts: relatedProduct,
        feauturedProducts: feauturedProduct
    });
} 

exports.contact = (req, res) => res.render('user/body/contact', { pageName: 'Contact us' });

// checkout
exports.checkout = async (req, res) => {
    const userId = req.user._id;
    const token = req.cookies.jwt;

    // Decode the JWT token
    const decodedToken = jwt.verify(token, process.env.AUTH_STR);
    console.log('decodedToken:', decodedToken)
    // Extract the totalValue from the decoded payload
    const finalDiscount = decodedToken.finalDiscount;
    console.log('finalDiscount:', finalDiscount)

    const user = await User.findById(userId)
    const cart = await Cart.findOne({ user: userId })
    res.render('user/body/checkout', {
        pageName: 'Checkout',
        Cart: cart,
        User: user,
        finalDiscount: finalDiscount
     })
};

// Error Messages
exports.errorMessage = (req, res) => res.render('user/body/error');
    
// my account
exports.myAccount = (req, res) => {
    const verify = jwt.verify(req.cookies.jwt, process.env.AUTH_STR);
    res.status(201).render('user/body/myAccount', { pageName: 'My Account', userName: verify.name });
}

// cart
exports.cart = async (req, res) => {
    try {
        const user = req.user._id;
        const cart = await Cart.findOne({ user });

        // console.log('User: ', user);
        // console.log('Cart: ', cart);

        res.render('user/body/cart', {
            pageName: 'Cart',
            cart: cart,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
} 

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const userId = req.user._id;

        // Get the user's cart
        let cart = await Cart.findOne({ user: userId });

        // If the cart doesn't exist, create a new one
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        // Check if the product already exists in the cart
        const existingProductIndex = cart.items.findIndex(val => String(val.itemId) === productId);

        if (existingProductIndex !== -1) {
            // Product exists, increment quantity
            cart.items[existingProductIndex].quantity += 1;
        } else {
            // Product doesn't exist, add it to the cart
            const product = await Products.findById(productId);

            if (product) {
                cart.items.push({
                    itemId: product._id,
                    name: product.name,
                    price: product.sellingPrice,
                    quantity: 1
                });
            } else {
                return res.status(404).send({ error: 'Product not found' });
            }
        }

        // Update the total bill in the cart (assuming calculateTotalBill is implemented correctly)
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();

        // Redirect to the current page
        res.status(200).redirect('back');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Delete Cart
exports.deleteCart = async (req, res) => {
    try {
        const itemID = req.query.id;
        const userID = req.user._id;

        // Find the user's cart
        const cart = await Cart.findOne({ user: userID });

        // Remove the item from the cart based on the itemId
        cart.items = cart.items.filter(item => String(item.itemId) !== itemID);

        // Recalculate the total bill
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();

        console.log('Item removed from the cart successfully', cart);
        res.status(200).redirect('/cart');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

// increment and decrement products
exports.changeQuantity = async (req, res) => {
    const userId = req.user._id;
    const itemId = req.query.id;
    const action = req.query.action;

    // Get the user's cart
    let cart = await Cart.findOne({ user: userId });

    // Find the item in the cart
    const itemIndex = cart.items.findIndex(val => String(val.itemId) === itemId);

    if (itemIndex !== -1) {
        // Update the quantity based on the action
        if (action === 'increment') {
            cart.items[itemIndex].quantity += 1;
        } else if (action === 'decrement' && cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        }

        // Update the total bill in the cart
        cart.bill = calculateTotalBill(cart.items);

        // Save the updated cart
        await cart.save();
        console.log('product added succesfully')
        res.status(200).redirect('/cart');
    } else {
        res.status(404).send({ error: 'Item not found in the cart' });
    }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
    try {
        const { couponCode, cartId } = req.body;
        console.log('couponCode:', req.body);

        // Find the coupon in the database by its code
        const coupon = await Coupon.findOne({ couponCode });
        if (!coupon) {
            return res.status(404).json({ error: 'Write a valid Coupon code' }); // Include error message in the response
        }

        // Check if the coupon has reached its usage limit
        // if (coupon.usageLimit <= 0) {
        //     return res.status(400).json({ error: 'Coupon has already been used' });
        // }

        // Check if the current date is before the start date
        const currentDate = new Date();
        if (currentDate < coupon.startDate) {
            return res.status(400).json({ error: 'Coupon is not yet valid' });
        }

        // Check if the current date is after the end date
        if (currentDate > coupon.endDate) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }

        // Decrement the usage limit of the coupon
        // coupon.usageLimit -= 1;
        // await coupon.save();

        const { discount, maxPriceOffer } = coupon; // Destructuring coupon object

        // // find the user's cart 
        const cart = await Cart.findById(cartId);

        let { bill } = cart // (const bill = cart.bill) destructurnig
        
        const discountAmount = (bill * discount) / 100;

        // // check if the discount amount is greater than maxPriceOffer
        const finalDiscount = Math.min(discountAmount, maxPriceOffer);

        res.status(200).json({ finalDiscount, bill });
        // // Apply the discount to the bill
        // bill -= finalDiscount;

        // // Update the user's cart with the new bill
        // await Cart.findByIdAndUpdate(cart._id, { bill });

        // console.log('userBill:', finalDiscount);
        // res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

// Checkout
exports.proceedToCheckout = async (req, res) => {
    try {
        // Check if the JWT token exists in the cookie
        if (!req.cookies.jwt) {
            return res.status(401).json({ error: 'Unauthorized: No JWT token provided' });
        }

        // Get the existing JWT token from the Authorization header.
        const existingToken = req.cookies.jwt;

        try {
            // Decode the existing token.
            const decodedToken = jwt.verify(existingToken, process.env.AUTH_STR);

            // Add the new value to the decoded payload.
            decodedToken.finalDiscount = req.body.finalDiscount;

            // Create a new token with the updated payload.
            const newToken = jwt.sign(decodedToken, process.env.AUTH_STR);

            // Send the new token in the response
            res.cookie('jwt', newToken, { httpOnly: true });
            res.status(200).json({ newToken });
        } catch (err) {
            // Handle token verification errors
            return res.status(401).json({ error: 'Unauthorized: Invalid JWT token' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

exports.addNewAddress = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Push the new address object into the addresses array of the user document
        user.addresses.push(data);

        // Save the updated user document
        await user.save();

        res.status(200).redirect('back');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}