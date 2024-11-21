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
const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/userModel')
const Address = require('../models/address')
const ContactController = require('../controller/user/contact')
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
      amount: amount * 100, 
      currency: 'INR',
      receipt: 'receipt#1',
    };
  
    try {
      const order = await razorpay.orders.create(options);
      res.json({
        key: process.env.RAZORPAY_SECRET, 
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, data } = req.body;
  console.log('Received data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, data });

  const key_secret = process.env.RAZORPAY_SECRET;
  const userEmail = req.session.user.email;

  try {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      const cart = await Cart.findOne({ userId: user._id })
          .populate({
              path: 'products.productId',
              model: 'Product',
              strictPopulate: false,
          })
          .exec();

      console.log('>>>>>>>>>>>>>>>>>>>>>', cart);

      if (!cart) {
          return res.status(400).json({ message: 'Cart is empty' });
      }

      const generated_signature = crypto
          .createHmac('sha256', key_secret)
          .update(razorpay_order_id + '|' + razorpay_payment_id)
          .digest('hex');

      if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ status: 'failed', message: 'Invalid signature' });
      }

      let totalAmount = 0;
      const orderItems = [];

      // Calculate total amount and populate orderItems
      for (let i = 0; i < cart.products.length; i++) {
          const product = cart.products[i].productId;
          const quantity = cart.products[i].quantity;
          const subtotal = product.salePrice * quantity;
          totalAmount += subtotal;

          orderItems.push({
              productId: product._id,
              quantity,
              price: product.salePrice,
              subtotal,
              image: product.images,
              productName: product.productName
          });
      }
      console.log('order items', orderItems);

      // Fetch the user's address
      const address = await Address.findOne({ userId: user._id });

      console.log('the address', address);

      const generatedOid = uuidv4(); 

      // Create the order
      const order = new Order({
          razorpay_order_id,
          razorpay_payment_id,
          total: totalAmount,
          products: orderItems,
          userId: user._id,
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          address: {
              street: address.street,
              city: address.city,
              state: address.state,
              pin: address.pin,
              country: address.country,
              Firstname: address.Firstname,  // Ensure Firstname is included
              Lastname: address.Lastname,    // Ensure Lastname is included
          },
          oid: generatedOid,  // Assign the generated Order ID
      });

      console.log('the order is ', order);

      // Save the order to the database
      await order.save();
      
      console.log('Order placed successfully:', order);

      // Clear cart after successful order
      await Cart.findOneAndUpdate({ userId: user._id }, { $set: { products: [] } });

      res.json({ status: 'success', message: 'Payment verified and order placed successfully' });

  } catch (error) {
      console.error('Error during payment verification or order processing:', error);
      res.status(500).json({ status: 'failed', message: 'Error during payment verification or order processing' });
  }
});



router.post('/verify', async (req, res) => {
  console.log('Verifying Razorpay payment...');

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, data } = req.body;
  console.log('Received data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, data });

  const key_secret = process.env.RAZORPAY_SECRET;
  const userEmail = req.session.user.email;

  try {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      const cart = await Cart.findOne({ userId: user._id })
          .populate({
              path: 'products.productId',
              model: 'Product',
              strictPopulate: false,
          })
          .exec();

      console.log('>>>>>>>>>>>>>>>>>>>>>', cart);

      if (!cart) {
          return res.status(400).json({ message: 'Cart is empty' });
      }

      const generated_signature = crypto
          .createHmac('sha256', key_secret)
          .update(razorpay_order_id + '|' + razorpay_payment_id)
          .digest('hex');

      if (generated_signature !== razorpay_signature) {
          return res.status(400).json({ status: 'failed', message: 'Invalid signature' });
      }

      let totalAmount = 0;
      const orderItems = [];

      // Calculate total amount and populate orderItems
      for (let i = 0; i < cart.products.length; i++) {
          const product = cart.products[i].productId;
          const quantity = cart.products[i].quantity;
          const subtotal = product.salePrice * quantity;
          totalAmount += subtotal;

          orderItems.push({
              productId: product._id,
              quantity,
              price: product.salePrice,
              subtotal,
              image: product.images,
              productName: product.productName
          });
      }
      console.log('order items', orderItems);

      // Fetch the user's address
      const address = await Address.findOne({ userId: user._id });

      console.log('the address', address);

      const generatedOid = uuidv4(); 

      // Create the order
      const order = new Order({
          razorpay_order_id,
          razorpay_payment_id,
          total: totalAmount,
          products: orderItems,
          userId: user._id,
          paymentStatus: 'failure',
          paymentMethod: 'razorpay',
          address: {
              street: address.street,
              city: address.city,
              state: address.state,
              pin: address.pin,
              country: address.country,
              Firstname: address.Firstname,  // Ensure Firstname is included
              Lastname: address.Lastname,    // Ensure Lastname is included
          },
          oid: generatedOid,  // Assign the generated Order ID
      });

      console.log('the order is ', order);

      // Save the order to the database
      await order.save();
      
      console.log('Order placed successfully:', order);

      // Clear cart after successful order
      await Cart.findOneAndUpdate({ userId: user._id }, { $set: { products: [] } });

      res.json({ status: 'success', message: 'Payment verified and order placed successfully' });

  } catch (error) {
      console.error('Error during payment verification or order processing:', error);
      res.status(500).json({ status: 'failed', message: 'Error during payment verification or order processing' });
  }
});

///return route 

router.post('/return-order', userControler.returnOrder)

router.get('/contact',ContactController.ContactPage)
router.get('/about', ContactController.about)
module.exports = router