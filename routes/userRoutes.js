const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler');
const passport = require('passport');
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

router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/register' },userControler.checksession,(req,res)=>{

    res.redirect('/home')
}));

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

router.get('/add-to-cart',userControler.AddToCart)

// Assuming your route is defined as follows:
router.get('/remove-from-cart/:id',  userControler.removeFromCart);

//shop route 
router.get('/shop',userControler.shopPage)

//checkout page 
router.get('/checkOut',userControler.checkout)  

//order placing //
router.post('/order',userControler.PlaceOrder)

router.get('/success',userControler.successpage)
///order route

router.get('/order',userControler.myOrders)


module.exports = router