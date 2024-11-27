const { v4: uuidv4 } = require('uuid');
const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler');
const passport = require('passport');
const ForgetController = require('../controller/user/forgetController')
const checkBlockedStatus = require('../middlewares/checkBlockedStatus');
const wishlistController = require('../controller/user/wishlist')
const CouponController = require('../controller/user/coupon')
const WalletController = require('../controller/user/wallet')
const ContactController = require('../controller/user/contact')
const invoiceController = require('../controller/user/invoice')
const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/userModel')
const Address = require('../models/address')

// const { UserAuth} = require('../middlewares/auth')
// router.get('/',userControler.HomePage)
const crypto = require("crypto")
router.get('/PageNotfound',userControler.PageNotFound)

router.get('/',userControler.homePage)

router.get('/register',userControler.SignUp)


router.post('/register',userControler.Registration)

router.get('/verify-otp',userControler.getOtp)

router.post('/verify-otp', userControler.verifyOtp);


router.get('/login',userControler.GetLogin)

router.post('/login',userControler.userLogin)

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email'],prompt:"select_account"}))


router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/register',
}), (req, res) => {

  if (req.user && req.user.email) {
    const userEmail = req.user.email; 
    req.session.user = {
      name: req.user.name,
      email: userEmail,
    };
    res.redirect('/');
  } else {
 
    res.redirect('/register');
  }
});

  
router.post('/resend-otp',userControler.resendOtp)

router.get('/ProducDetial/:id',userControler.ProducDetial)

router.get('/ProductDetail/:productId', userControler.ProducDetial);

router.get('/products/:id',userControler.ProducDetial)

router.get('/userLogout' , userControler.userLogout )

// router.get(`/productDetails/${productId}`,userControler.ProducDetial)
// profile routes//
router.get('/profile',checkBlockedStatus,userControler.profile)

router.post('/profile/edit',userControler.editProfile)

router.get('/manageAddress',userControler.ManageAddress)

router.post('/address/addAddress', userControler.addAddress)

router.get('/ViewAddress',userControler.ViewAddress)

router.get('/editAddressPage/:id',userControler.EditAddress)

router.get('/delete-address',userControler.deletingAddress)

router.post('/edit-address/:id',userControler.EditAddress)
///BLOCKED USER
// router.use(checkBlockedStatus);
///cart routes ///

///related product //

router.get('/shop',userControler.shopPage)
router.get('/cart',userControler.cartPage)

// router.post('/add-cart-cart/:id',userControler.shopPage)


router.post('/add-to-cart', userControler.AddToCart);


// Assuming your route is defined as follows:
router.get('/remove-from-cart/:id',  userControler.removeFromCart);

//shop route 
router.get('/shop',checkBlockedStatus,userControler.shopPage)

router.get('/ProducDetial/:id',checkBlockedStatus,userControler.shopPage)
//checkout page 
router.get('/checkOut',userControler.checkout)  

//order placing //
router.post('/order',userControler.PlaceOrder)

router.get('/success',userControler.successpage)
///order route

router.get('/order',userControler.myOrders)

//cancelOrder//



// Route to handle order cancellation
// router.post('/order/cancel', userControler.cancelOrder);
router.post('/order/cancel',userControler.cancelOrder);

///filtering route 
router.get('/search', userControler.searchProducts);


// router.post('/cart/update-quantity', userControler.updateQuantity);
//forget password routes  

router.get('/forgetPassword', userControler.ForgetPas)

router.post('/forgetPassword',ForgetController.forgetPassword)

router.get('/verification',ForgetController.verify)


router.get('/resetpass', ForgetController.ResetPass);



router.post('/resetCode', ForgetController.codeVerification)

 router.post('/Resetpassword', ForgetController.resetpassword)

 router.patch('/updateQuantity', userControler.updateQuantity);

 ///wishlist routes

 router.get('/wishlist', wishlistController.wishlistPage)

router.post('/wishlist/add', wishlistController.addToWishlist)

router.post('/wishlist/remove/:productId',  wishlistController.removeFromWish);

///coupon applying route//

router.post('/apply-coupon',CouponController.ApplyCoupon )


//wallet routes//
router.get('/wallet', WalletController.LoadWallet );

router.post('/delete-coupon', CouponController.removeCoupon)

const Razorpay = require('razorpay')

require('dotenv').config()



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });
  
  // Route to create a Razorpay order
  router.post('/create-order', async (req, res) => {
    console.log('helloooo')
    const { amount } = req.body;
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: 'receipt#1',
    };
  
    try {
      const order = await razorpay.orders.create(options);
      res.json({
        key: process.env.RAZORPAY_SECRET, // Do not expose your key to users
        amount: order.amount,
        currency: order.currency,
        id: order.id
      });
    } catch (error) {
      res.status(500).send(error);
    }
  });

   
router.post('/verify', async (req, res) => {
    console.log('Verifying Razorpay payment...');

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    console.log('Received data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId });

    const key_secret = process.env.RAZORPAY_SECRET;

    try {
        // Verify Razorpay signature
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            // Update order status to failed if signature verification fails
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'failed';
                order.razorpay_order_id = razorpay_order_id;
                order.razorpay_payment_id = razorpay_payment_id;
                order.razorpay_signature = razorpay_signature;
                await order.save();
            }
            return res.status(400).json({ status: 'failed', message: 'Invalid signature' });
        }

        // Find and update the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: 'failed', message: 'Order not found' });
        }

        // Update order with payment details
        order.razorpay_order_id = razorpay_order_id;
        order.razorpay_payment_id = razorpay_payment_id;
        order.razorpay_signature = razorpay_signature;
        order.paymentStatus = 'paid';
        await order.save();

        // Clear the user's cart
        const user = await User.findById(order.userId);
        if (user) {
            await Cart.findOneAndUpdate({ userId: user._id }, { $set: { products: [] } });
        }

        res.json({ status: 'success', message: 'Payment verified successfully' });

    } catch (error) {
        console.error('Error during payment verification:', error);
        // Update order status to failed on error
        try {
            const order = await Order.findById(orderId);
            if (order) {
                order.paymentStatus = 'failed';
                order.razorpay_order_id = razorpay_order_id;
                order.razorpay_payment_id = razorpay_payment_id;
                order.razorpay_signature = razorpay_signature;
                await order.save();
            }
        } catch (saveError) {
            console.error('Error updating order status:', saveError);
        }
        res.status(500).json({ status: 'failed', message: 'Error during payment verification' });
    }
});

// Create pending order
router.post('/create-pending-order', async (req, res) => {
    try {
        const { amount, addressId } = req.body;
        const userEmail = req.session.user.email;

        // Find user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const cart = await Cart.findOne({ userId: user._id })
            .populate({
                path: 'products.productId',
                model: 'Product',
                strictPopulate: false,
            })
            .exec();

        if (!cart || !cart.products.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

    
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(400).json({ success: false, message: 'Address not found' });
        }

       
        const orderItems = cart.products.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.salePrice,
            subtotal: item.productId.salePrice * item.quantity,
            image: item.productId.images,
            productName: item.productId.productName
        }));

        const generatedOid = uuidv4();

     
        const order = new Order({
            oid: generatedOid,
            total: amount,
            products: orderItems,
            userId: user._id,
            paymentStatus: 'failed',
            paymentMethod: 'razorpay',
            orderStatus: 'pending',
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                pin: address.pin,
                country: address.country,
                Firstname: address.Firstname,
                Lastname: address.Lastname,
            }
        });

        await order.save();
        
        return res.status(200).json({ 
            success: true, 
            orderId: order._id,
            message: 'Pending order created successfully' 
        });

    } catch (error) {
        console.error('Error creating pending order:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error creating pending order' 
        });
    }
});

// Update order status
router.post('/update-order-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        order.paymentStatus = status;
        await order.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Order status updated successfully' 
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error updating order status' 
        });
    }
});


router.post('/retry-payment', async (req, res) => {
    try {
        const { orderId, total } = req.body;
        
 
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

   
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.total * 100),
            currency: 'INR',
            receipt: `retry_${order.oid.slice(-30)}`, 
            notes: {
                order_id: order._id.toString()
            }
        });

   
        order.razorpay_order_id = razorpayOrder.id;
        order.paymentStatus = 'pending';
        await order.save();

        return res.status(200).json({
            success: true,
            key: process.env.RAZORPAY_ID,
            order: razorpayOrder
        });

    } catch (error) {
        console.error('Error retrying payment:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error retrying payment'
        });
    }
});

///return route 

router.post('/return-order', userControler.returnOrder)

router.get('/contact',ContactController.ContactPage)

router.get('/about', ContactController.about)

router.get('/download-invoice/:id',invoiceController.generateInvoice )

module.exports = router