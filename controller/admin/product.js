const { MongoDBCollectionNamespace } = require('mongodb')
const Product = require ('../../models/product')
const User = require('../../models/userModel')
const fs = require ('fs')
const Sharp = require('sharp')
const path = require('path')
const Category = require('../../models/category')



const ProductList = async (req,res)=>{
    try {
        res.render('product')
    } catch (error) {
         console.log(error)
         res.status(500).send('Server Error')
    }
    
}

const AddProduct = async (req,res) => {
   
        try {
            const category = await Category.find({isListed:true})
            res.render('addProduct',{
                cate:category
            })
        } catch (error) {
             console.log(error)
             res.status(500).send('Server Error')
            
        }
    
}
const addProduct = async (req, res) => {
    try {
        const product = req.body;
        const ProductExist = await Product.findOne({ name: product.productName }); // Check 'name', not 'productName'

        if (!ProductExist) {
            const images = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;
                    const resizedImagesPath = path.join('public', 'uploads', 'product-images', req.files[i].filename);

                    // Resize and save image using Sharp
                    await Sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagesPath);

                    images.push(req.files[i].filename);
                }
            }

            const categoryId = await Category.findOne({ name: product.category });
            if (!categoryId) {
                return res.status(404).send('Category not found');
            }

            const newProduct = new Product({
                name: product.productName, // Changed to 'name'
                price: product.price,
                description: product.description,
                images,
                category: categoryId._id,
                regularPrice: product.regularPrice,
                salePrice: product.salesPrice, // Changed to 'salePrice'
                quantity: product.quantity,
                createdAt: new Date(),
                size: product.size,
                colors: product.color, // Changed to 'colors'
                review: product.reviews, // Changed to 'review'
                status: "Available",
                isListed: product.isListed
            });

            await newProduct.save();
            console.log(newProduct, "Product added successfully");
            return res.redirect('/admin/addProduct');
        } else {
            return res.status(400).json({ error: 'Product already exists' });
        }
    } catch (error) {
        console.log('Error saving product:', error); // Logs detailed error
        return res.status(500).json({ error: 'An error occurred while saving the product' });
    }
};


module.exports = {
    ProductList,
    AddProduct,
    addProduct
 
}