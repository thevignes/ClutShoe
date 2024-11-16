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

const CateOffer = async (req, res) => {
    console.log('Starting offer application...');
    try {
      const CateId = req.params.CateId;
      console.log('Category ID:', CateId);
  
      const { type, value } = req.body;
      console.log('Request body:', req.body);
  
      if (!CateId) {
        return res.status(400).json({ message: 'Category ID is required' });
      }
  
   
      const offerValue = Number(value);

      // console.log('///////', offerValue)

      if (isNaN(offerValue)) {
        return res.status(400).json({ message: 'Offer value must be a valid number' });
      }
        const category = await Category.findOne({name:CateId})

      const products = await Product.find({category: category._id});
      console.log('Products found:', products);
  
      if (!products || products.length === 0) {
        return res.status(404).json({ message: 'No products found for this category' });
      }
  
      const updatedProducts = [];
      products.forEach(product => {

        let salePrice;
        console.log('Product regular price:', product.regularPrice); 
   
          salePrice = product.regularPrice * (1 - offerValue / 100);
          console.log('Applying percentage discount: salePrice =', salePrice, 'offerValue =', offerValue);

    
        salePrice = salePrice > 0 ? salePrice : 0;
        console.log('Final calculated salePrice (after applying min 0):', salePrice);
      
     
        product.offer = {
          type: type || 'percentage',
          value: offerValue,  
        };
        product.salePrice = salePrice;
      
        
        updatedProducts.push(product);
      });
      
      await Promise.all(updatedProducts.map(product => product.save()));
      
      res.status(200).json({
        message: 'Offer applied successfully to category',
        updatedProducts,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const removeOffer = async (req, res) => {
    console.log('Request received to remove offer');

    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        console.log(productId);
        const product = await Product.findById(productId);
        console.log(product, '>>>>>>>>>>>>>>>>>>>>>');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!product.offer) {
            return res.status(404).json({ message: 'No active offer found for this product' });
        }

        // Retain the original sale price if necessary
        product.offer = null; // Clear the offer details
        product.salePrice = product.salePrice || product.finalPrice; // Retain salePrice if it exists
        product.finalPrice = product.salePrice || product.regularPrice; // Default to salePrice or regularPrice

        await product.save();

        return res.status(200).json({ message: 'Offer removed successfully', product });
    } catch (error) {
        console.error('Error while removing offer:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    ApplyOffer,
    CateOffer,
    removeOffer
}