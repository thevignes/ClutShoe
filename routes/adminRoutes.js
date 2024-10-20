const express = require('express');
const router = express.Router()
const AdminController = require('../controller/admin/adminContrler')
const CategoryController = require ('../controller/admin/category')
const ProductController = require('../controller/admin/product')
const multer = require('multer')
const storage = require('../helpers/multer')
// const upload = require("../helpers/multer")
const uploads= multer({ storage: storage })
const {UserAuth,AdminAuth} = require('../middlewares/auth')

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

router.get('/editCategory/:id', CategoryController.editCatePage);

router.post('/editCategory/:id', CategoryController.editCategory)

router.post('/CategoryDelete/:id', CategoryController.CategoryDelete)

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

router.post('/admin/updateProduct/:id', uploads.single('image'), ProductController.UpdateProduct);

router.post('/deleteSingleImage' , ProductController.deleteSingleImage)

module.exports = router 