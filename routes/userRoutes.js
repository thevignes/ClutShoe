const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler');
const passport = require('passport');
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

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/register' }));

router.post('/resend-otp',userControler.resendOtp)

router.get('/ProducDetial/:id',userControler.ProducDetial)

router.get('/userLogout' , userControler.userLogout )

// profile routes//
router.get('/profile',userControler.profile)

router.post('/profile/edit',userControler.editProfile)

router.get('/manageAddress',userControler.ManageAddress)

router.post('/address/addAddress', userControler.addAddress)

router.get('/ViewAddress',userControler.ViewAddress)

router.get('/editAddressPage/:id',userControler.EditAddress)

router.post('/delete-address/:id',userControler.deletingAddress)


///cart routes ///

router.get('/cart',userControler.cartPage)

module.exports = router