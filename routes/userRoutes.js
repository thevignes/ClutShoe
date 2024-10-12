const express = require('express')
const router = express.Router();
const userControler = require('../controller/user/userControler')

router.get('/',userControler.HomePage)

router.get('/PageNotfound',userControler.PageNotFound)

router.get('/',userControler.homePage)

router.get('/register',userControler.SignUp)

router.post('/register',userControler.Registration)

module.exports = router