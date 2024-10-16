const express = require('express');
const router = express.Router()
const AdminController = require('../controller/admin/adminContrler')
const CategoryController = require ('../controller/admin/category')
router.get('/dashboard',AdminController.Dashboard)

router.get('/signin',AdminController.AdminLogin)

router.post('/signin',AdminController.AdminVerify)

router.get('signin',AdminController.adminLogout)

router.get('/user',AdminController.getUSers)

router.post('/blockUser/:id', AdminController.blockUser)

router.post('/unblockUser/:id', AdminController.UnblockUser)


//category routes 

router.get('/category',CategoryController.CategoryDet)

router.post('/addCategory',CategoryController.addCategory)

// router.get('/editCategory/:id', AdminController.editCategory)
module.exports = router