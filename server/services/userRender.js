const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../model/userModel')
const Products = require('../model/products');
const Category = require('../model/category');
const Cart = require('../model/cart');
const Coupon = require('../model/coupon');
const { calculateDiscount, calculateTotalBill } = require('../middlewares/script');
const Order = require('../model/order');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');


// This razorpayInstance will be used to access any resource from razorpay
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_ID,
    key_secret: process.env.RAZORPAY_API_KEY,
})


// signup page
exports.userSigup = (req, res) => res.render('user/body/signup');

exports.otpPage = async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email: email });
   
    // Check if user exists and if emailOtp is defined
    if (!user || !user.emailOtp) {
        return res.redirect('/signup');
    }

    const otpExpiration = user.emailOtp.expiry;

    res.render('user/body/otpVerificationPage', { email: email, expiry: otpExpiration });
};

exports.verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "OTP is expired.Sign up again to get a new OTP" });
        }

       // Check if OTP is expired or not defined
       const otpExpiration = user.emailOtp ? user.emailOtp.expiry : undefined;
       console.log('otpExpiration:', otpExpiration);
       if (otpExpiration && otpExpiration < new Date() || otpExpiration === undefined) {
           // OTP expired, delete user data
           await User.deleteOne({ email });
           console.log('User deleted');
           return res.status(400).json({ error: "OTP is expired" });
       }

        // Check if the OTP matches
        if (user.emailOtp && user.emailOtp.otp !== otp) {
            // OTP does not match
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // If OTP is valid, clear the emailOtp field
        user.isVerified = true;
        await user.save();

        setTimeout(async() =>{
            if (user.isVerified === false){
                await User.deleteOne({ email });
            }
        })

        console.log('OTP verfication completed')
        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send({ error: error.message });
    }
}

// shop
exports.shop = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const productPerPage = 2;
        const searchQuery = req.query.search || ''; // Retrieve search query from request
        const sortBy = req.query.sortBy || ''; // Retrieve sorting parameter from request

        // Define the sorting criteria based on the sortBy parameter
        let sortCriteria = {};
        if (sortBy === 'priceLowToHigh') {
            sortCriteria = { sellingPrice: 1 }; // Sort by price low to high
        } else if (sortBy === 'priceHighToLow') {
            sortCriteria = { sellingPrice: -1 }; // Sort by price high to low
        } else {
            // Default sorting criteria, e.g., no sorting or default database order
            sortCriteria = {};
        }

        const totalProducts = await Products.countDocuments({
            name: { $regex: new RegExp(searchQuery, 'i') } // Case-insensitive search by name
        });
        const totalPages = Math.ceil(totalProducts / productPerPage);

        const products = await Products.find({
            name: { $regex: new RegExp(searchQuery, 'i') } // Case-insensitive search by name
        })
        .sort(sortCriteria) // Apply sorting criteria
        .skip((page - 1) * productPerPage)
        .limit(productPerPage)
        .exec();
        
        console.log(products)
        const categories = await Category.find().exec();
        const featuredProducts = await Products.find({})
            .sort({ discount: -1 })
            .limit(3)
            .exec();

        res.render('user/body/shop', {
            pageName: 'Shop',
            Products: products,
            Categories: categories,
            feauturedProducts: featuredProducts,
            selectedCategories: [], // Initialize selected categories as empty
            currentPage: page, // Pass the current page number
            totalPages: totalPages,
            searchQuery: searchQuery,
            sortBy: sortBy, // Pass the sorting parameter to the view
            req: req // Pass the request object for further processing if needed
        });
    } catch (error) {
        console.error('Error rendering shop page:', error);
        res.status(500).send({ error: error.message });
    }
};


exports.viewMore = async (req, res) => {
    const featuredProducts = await Products.find({})
        .sort({ discount: -1 })
        .skip(3)
        .limit(6)
        .exec();

    res.json({ products: featuredProducts })
}

exports.filterCategory = async (req, res) => {
    let query = {};
    let selectedCategories = [];

    // Check if the request query contains categories
    if (req.query.categories) {
        // Split the categories string into an array
        selectedCategories = req.query.categories.split(',');

        // Construct MongoDB query to find products where the category field matches any of the selected categories
        query.category = { $in: selectedCategories };
        console.log('selected Categories:', selectedCategories)
    }

    try {
        // Fetch products based on the constructed query
        const products = await Products.find(query).exec();
        console.log('Filtered Products:', products.length, products)
        res.json({products});
    } catch (error) {
        console.error('Error filtering categories:', error);
        res.status(500).json({ error: error.message });
    }
};



// shop-details
exports.shopDetails = async (req, res) => {
    const searchQuery = req.query.search || '';
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
        searchQuery: searchQuery,
        feauturedProducts: feauturedProduct
    });
} 

exports.contact = (req, res) => res.render('user/body/contact', { pageName: 'Contact us' });

// checkout
exports.checkout = async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
    const cart = await Cart.findOne({ user: userId })
    res.render('user/body/checkout', {
        pageName: 'Checkout',
        Cart: cart,
        User: user,
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

        // Check if userId is not present
        if (!userId) {
            return res.status(401).json({ error: "User is not logged in." });
        }

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
                    productImage: product.imageUrl,
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

        console.log('coupon:', coupon.minCartValue)
        // Decrement the usage limit of the coupon
        // coupon.usageLimit -= 1;
        // await coupon.save();

        // // find the user's cart 
        const cart = await Cart.findById(cartId);

        let { bill, couponDiscount } = cart // (const bill = cart.bill) destructurnig

        // Check if the cart bill is greater than the minimum cart value
        if (bill <= coupon.minCartValue) {
            return res.status(400).json({ error: `Minimum cart value of ${coupon.minCartValue} not met for this coupon` });
        }

        // Calculate the discount based on the coupon type
        let finalDiscount = 0;
        if (coupon.couponType === 'Fixed') {
            finalDiscount = Math.min(coupon.discountPrice, bill);
        } else if (coupon.couponType === 'Percentage') {
            const discountAmount = (bill * coupon.discount) / 100;
            finalDiscount = Math.min(discountAmount, coupon.maxPriceOffer);
        }

        if (cart.couponDiscount === 0){
            cart.coupon = couponCode;
            cart.couponDiscount = finalDiscount;
            await cart.save();
        }

        console.log('couponDiscount:', cart.couponDiscount)
        res.status(200).json({ couponDiscount, bill });
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

exports.removeCoupon = async (req, res) => {
    try {
        const cartId = req.body.cartId;
        console.log('cart id:', cartId);

        // Find the cart by its ID
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Remove the coupon and set couponDiscount to 0
        cart.coupon = undefined;
        cart.couponDiscount = 0;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Coupon removed successfully', cart });
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

exports.placeOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod } = req.body;
        const userId = req.user._id;

        // Decode the JWT token to extract finalDiscount
        // const token = req.cookies.jwt;
        // const decodedToken = jwt.verify(token, process.env.AUTH_STR);
        // const couponDiscount = decodedToken.finalDiscount;
        // let orderId = decodedToken.orderId || 5000; // Default orderId if not present in the token

        // Find the maximum orderId currently in the Order collection and increment it
        let orderId = 5000;
        const maxOrderIdOrder = await Order.findOne().sort({ orderId: -1 });
        orderId = maxOrderIdOrder ? maxOrderIdOrder.orderId + 1 : orderId;

        // Retrieve user's cart and address
        const cart = await Cart.findOne({ user: userId });
        const user = await User.findById(userId);
        const address = user.addresses.find(item => item._id == addressId);
        const couponDiscount = cart.couponDiscount;

        // Calculate total amount and final amount
        const totalAmount = cart.bill >= 300 ? cart.bill : cart.bill + 30;
        const finalAmount = totalAmount - couponDiscount;

         // Construct the new order object
         const newOrder = new Order({
            orderId,
            userId,
            user: user.name,
            items: cart.items.map(item => ({
                product: item.itemId,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            subTotal: cart.bill,
            couponDiscount,
            finalAmount,
            shippingAddress: address,
            paymentMethod
        })

        // if the payment method is razorpay proceed to razorpay
        if (paymentMethod === 'Razorpay') {
            const amountInPaisa = finalAmount * 100; // Assuming finalAmount is in rupees
        
            const options = {
                amount: amountInPaisa,
                currency: 'INR',
                receipt: orderId.toString()
            };
        
            let isOrderCreated = false; // Flag to track if the Razorpay order is created
        
            razorpayInstance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Failed to create Razorpay order' });
                }
                console.log('new order:', order);
        
                // Update the flag to indicate that the Razorpay order is created
                isOrderCreated = true;
        
                // Send the response with paymentMethod and order details
                return res.json({
                    paymentMethod: paymentMethod,
                    order: order
                });
            });
        
            // If the Razorpay order creation is not completed yet, return from the route
            if (!isOrderCreated) {
                return;
            }
        } 
        
        // Update the orderId in the decoded token
        // decodedToken.orderId = orderId;

        // Sign the updated token with the new orderId
        // const newToken = jwt.sign(decodedToken, process.env.AUTH_STR);

        console.log('cart:');

        // Increment the sales count in Product and update the stocks
        for (const item of cart.items) {
            const product = await Products.findById(item.itemId)
            product.salesCount += item.quantity;
            product.stock -= item.quantity;
            await product.save()
        }

        // Clear the user's cart after successful order creation
        await Cart.findOneAndDelete({ user: userId });
        
        // before saving newOrder update the status to Placed.
        newOrder.status = 'Placed'
        const saveOrder = await newOrder.save(); 

        const emailContent = `
            <p>Dear ${user.name},</p>

            <p>Thank you for choosing TryNutritions! We are pleased to inform you that your order has been successfully placed and is now being processed. Below are the details of your order:</p>
            
            <ul>
                <li><strong>Order ID:</strong> ${saveOrder.orderId}</li>
                <li><strong>Order Date:</strong> ${saveOrder.createdAt}</li>
            </ul>
            
            <h3>Order Summary:</h3>
            
            <p><strong>Total Amount:</strong> ${finalAmount}</p>
            <p><strong>Payment Method:</strong> ${saveOrder.paymentMethod}</p>
            
            <p>Thank you for shopping with us. We appreciate your business and hope you enjoy your purchase!</p>
            
            <p>Best regards,<br>
            Admin<br>
            TryNutritions</p>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use `true` for port 465, `false` for all other ports
            auth: {
              user: process.env.APP_EMAIL,
              pass: process.env.APP_PASSWORD,
            },
        });
                    
            // send mail with defined transport object
            const mailOptions = {
              from: process.env.APP_EMAIL, // sender address
              to: user.email, // list of receivers
              subject: "Order Placed", // Subject line
              text: "Your order is placed!", // plain text body
              html: emailContent, // html body
            };
          
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return console.log('err:', err)
                }
                
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            })
                     

        
        res.status(200).json({ saveOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}


exports.orderSuccess = async (req, res) => {
    const orderId = req.query.id;

    console.log('orderId:token', orderId)

    const order = await Order.findOne({ orderId }).populate('items.product')
    console.log(order)

    res.render('user/body/orderCompletion', {
        pageName: '',
        Order: order
    });
} 