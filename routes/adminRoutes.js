const express = require('express');
const router = express.Router()
const AdminController = require('../controller/admin/adminContrler')
const CategoryController = require ('../controller/admin/category')
const ProductController = require('../controller/admin/product')
const multer = require('multer')
const storage = require('../helpers/multer')
const couponController = require('../controller/admin/couponControler')
const uploads= multer({ storage: storage })
const {UserAuth,AdminAuth} = require('../middlewares/auth')
const OfferController = require('../controller/admin/offerController')
const salesReportController = require('../controller/admin/sales')

router.get('/dashboard',AdminController.Dashboard)

router.get('/signin',AdminController.AdminLogin)

router.post('/signin',AdminController.AdminVerify)

router.get('signin',AdminController.adminLogout)

router.get('/user',AdminController.getUSers)

router.get('/blockUser', AdminController.blockUser)

router.get('/unblockUser', AdminController.UnblockUser)


router.get('/users', AdminController.Userlist)

//category routes 


router.get('/category',CategoryController.CategoryDet)

router.post('/addCategory',CategoryController.addCategory)

router.get('/editCategory/:id', CategoryController.editCatePage);

router.post('/editCategory/:id', CategoryController.editCategory)

// router.post('/CategoryDelete/:id', CategoryController.CategoryDelete)

router.post('/CategoryList/:id',CategoryController.CategoryList)

router.post('/UnCategoryList/:id',CategoryController.UnCategoryList)

// router.get('/editCategory/:id', AdminController.editCategory)

///product routes 

router.get('/product',ProductController.ProductList)

router.get('/addProduct',ProductController.AddProductPage)

router.post('/addProduct',uploads.array("images",4),ProductController.addProduct)

router.get('/editproduct/:id',ProductController.editProductPage )

router.post('/editProduct/:id',ProductController.editProduct)

router.post('/listProduct/:id', (req, res, next) => {
    console.log('Received POST request to /admin/listProduct with id:', req.params.id);
    next();
  },ProductController.productList);
  

router.post('/unListProduct/:id',ProductController.unListProduct)

router.post('/updateProduct/:id',uploads.array('images',4), ProductController.UpdateProduct);

// router.post('/deleteSingleImage' , ProductController.deleteSingleImage)

//route for order list//
router.get('/orderList',AdminController.orderList)

//orderDetails page//

router.get('/OrderDetails/:id',AdminController.OrderDetails)

//update order status//
router.put('/order/:orderId/status',AdminController.updateOrder)

router.post('/removeImage/:id',ProductController.removeImage)


//coupon routes///

router.get('/coupon', couponController.couponPage)


router.post('/coupons/add', couponController.addCoupon)

router.get('/couponList', couponController.couponList)

router.delete('/coupons/delete/:id', couponController.DeleteCoupon)


//offer route 

router.post('/addOffer/:productId',OfferController.ApplyOffer)

router.post('/addCategoryOffer/:CateId', OfferController.CateOffer)

router.get('/sales',salesReportController.salesReport )

router.get('/sales-report', salesReportController.salesReport)
module.exports = router 