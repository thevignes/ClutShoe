const mongoose = require("mongoose");
const app = require("../../app");
const Category = require("../../models/categoryModel");
const Product = require("../../models/product");
require("dotenv").config();
const  User = require('../../models/userModel')
const Coupon = require('../../models/couponModels')



const ApplyOffer = async (req, res) => {
    console.log('hellooooooo');
    
    try {
        const { productId } = req.params;
        const { type, value } = req.body; 

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' }); 
        }

        let salePrice;

 
        if (type === 'percentage') {
            salePrice = product.regularPrice * (1 - value / 100);
        } else if (type === 'flat') {
            salePrice = product.regularPrice - value;
        }

        salePrice = salePrice > 0 ? salePrice : 0;
            
        console.log('Regular Price:', product.regularPrice, 'Sale Price:', salePrice);

   
        product.offer = {
            type: type || 'percentage', 
            value: parseFloat(value),  
        };
        product.salePrice = salePrice;

   
        await product.save();
        console.log('Updated Product:', product);

        
        res.status(200).json({
            message: 'Offer added successfully',
            product: product 
        });
    } catch (error) {
        console.error(error);

    
        res.status(500).json({
            message: 'Server error',
            error: error.message || error 
        });
    }
};

const CateOffer = async (req,res) =>{
    try {
        const {CateId} = req.params;
        const{type, value} = req.body;

        const products = await Product.findById({'category_id': CateId})
        .populate('category_id')

        if(!products){
            return res.status(404).json({message: 'the product is not found !'})
        }

        products.forEach(product =>{
            let salePrice;

            if(type === 'percentage'){
        
                salePrice = product.regularPrice * (1 - value / 100);
            }else if (type === 'flat'){
                salePrice = product.regularPrice - value;
            }
            salePrice = salePrice > 0 ? salePrice : 0;

            product.offer = {
                type: type || 'percentage',
                value: parseFloat(value),
            }
            updatedProducts.push(product);
        })

        await Promise.all(updatedProducts.map(product => product.save()));

        res.status(200).json({
            message: 'Offer applied successfully to category',
            updatedProducts,
        });

    } catch (error) {

        console.log(error)
        return res.status(500).json({message:'server error'})
        
    }
}



module.exports = {
    ApplyOffer,
    CateOffer
}