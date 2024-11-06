const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler');
const passport = require('passport');
const ForgetController = require('../controller/user/forgetController')
// const checkBlockedStatus = require('../middlewares/checkBlockedStatus');
// const { UserAuth} = require('../middlewares/auth')
// router.get('/',userControler.HomePage)

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
    const userEmail = req.user.email; // Assuming email is a string
    req.session.user = {
      name: req.user.name,
      email: userEmail,
    };
    res.redirect('/');
  } else {
    console.error("User information is incomplete or undefined");
    res.redirect('/register');
  }
});

  
router.post('/resend-otp',userControler.resendOtp)

router.get('/ProducDetial/:id',userControler.ProducDetial)

router.get('/userLogout' , userControler.userLogout )

// router.get(`/productDetails/${productId}`,userControler.ProducDetial)
// profile routes//
router.get('/profile',userControler.profile)

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

router.get('/cart',userControler.cartPage)

router.post('/add-cart-cart/:id',userControler.shopPage)


router.post('/add-to-cart/:id', userControler.AddToCart);


// Assuming your route is defined as follows:
router.get('/remove-from-cart/:id',  userControler.removeFromCart);

//shop route 
router.get('/shop',userControler.shopPage)

router.get('/ProducDetial/:id',userControler.shopPage)
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

router.get('/forgetPassword', userControler.ForgetPas)

router.post('/forgetPassword',ForgetController.forgetPassword)

router.get('/verification',ForgetController.verify)


router.get('/resetpass', ForgetController.ResetPass);



router.post('/resetCode', ForgetController.codeVerification)

 router.post('/Resetpassword', ForgetController.resetpassword)

module.exports = router