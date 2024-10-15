const express = require('express');
const router = express.Router()
const AdminController = require('../controller/admin/adminContrler')

router.get('/dashboard',AdminController.Dashboard)
router.get('/signin',AdminController.AdminLogin)

module.exports = router