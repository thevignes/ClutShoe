const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler');
const passport = require('passport');

// router.get('/',userControler.HomePage)

router.get('/PageNotfound',userControler.PageNotFound)

router.get('/',userControler.homePage)

router.get('/register',userControler.SignUp)

router.post('/register',userControler.Registration)

router.get('/verify-otp',userControler.getOtp)

router.post('/verify-otp', userControler.verifyOtp);

router.get('/login',userControler.GetLogin)

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/register' }));

router.post('/resend-otp',userControler.resendOtp)

router.get('/ProducDetial/:id',userControler.ProducDetial)

module.exports = router