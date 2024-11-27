const mongoose = require("mongoose");
const app = require("../../app");
const Category = require("../../models/categoryModel");
const Product = require("../../models/product");
require("dotenv").config();
const  User = require('../../models/userModel')
const Coupon = require('../../models/couponModels')
const Cart = require('../../models/cart')
const order = require('../../models/order')
const ApplyCoupon = async (req, res) => {
    try {
  
      const { couponCode, orderValue } = req.body;
      const userEmail = req.session.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({ message: "You must be logged in to apply a coupon" });
      }
  
      const user = await User.findOne({ email: userEmail });
      const cart = await Cart.findOne({ userId: user._id });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const coupon = await Coupon.findOne({ couponCode: couponCode, isActive: true });
  
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
  
      const currentDate = new Date();
  
      if (coupon.expiryDate < currentDate) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
  
      if (orderValue < coupon.minOrderValue) {
        return res.status(400).json({ message: `Minimum order value of ${coupon.minOrderValue} is required to apply this coupon` });
      }
  
      const userUsage = coupon.usersUsed.find(us => us.userId.toString() === user._id.toString());
  
      if (userUsage && userUsage.usageCount >= coupon.userLimit) {
        return res.status(400).json({ message: 'You have reached the limit for using this coupon' });
      }
  
      let discount = 0;

      if (coupon.discountType === 'percentage') {
        discount = orderValue * (coupon.amount / 100);
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.amount;
      }
      

      if (discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
      
      let remainingDiscount = discount; 
      
  
      cart.products.forEach((product) => {
        let productDiscount = 0;
      
        if (remainingDiscount > 0) {
       
          if (coupon.discountType === 'percentage') {
            productDiscount = product.price * (coupon.amount / 100);
          } else if (coupon.discountType === 'fixed') {
            productDiscount = coupon.amount / cart.products.length;
          }
      
          if (productDiscount > remainingDiscount) {
            productDiscount = remainingDiscount;
          }
      
          remainingDiscount -= productDiscount;
        }
      
        product.offerPrice = product.price - productDiscount;
        if (product.offerPrice < 0) {
          product.offerPrice = 0;
        } 
      

      });
      
      cart.totalAmount = cart.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
      cart.discountAmount = cart.products.reduce((acc, product) => acc + ((product.price - product.offerPrice) * product.quantity), 0);
      
      cart.couponCode = couponCode;
      

      console.log('Total Cart Amount:', cart.totalAmount);
      console.log('Total Discount Amount:', cart.discountAmount);
      
      await cart.save();
      
  
      const finalPrice = orderValue - discount;
  
      console.log(`Final Price after discount: ₹${finalPrice}`);
      console.log(`Coupon ${couponCode} applied successfully, discount: ₹${discount}, final price: ₹${finalPrice}`);
  
      res.status(200).json({ finalPrice, discount });
  
    } catch (error) {
      console.error("Error applying coupon:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  


  const removeCoupon = async (req,res)=>{


    try {
        const {userId} = req.body;


const user = await User.findOne({email:userId});

        const cart = await Cart.findOne({userId:user._id});

        if(!cart.couponCode){
            return res.status(400).json({message: 'No coupon code found in cart'});
        }
     

        const AppliedCoupon = await Coupon.findOne({couponCode:cart.couponCode})

        cart.discountAmount =0;
       
    cart.totalAmount = cart.products.reduce((acc, product) => acc + (product.price * product.quantity), 0);

    cart.couponCode = null;
    await cart.save();


    return res.status(200).json({
        message: 'Coupon removed successfully',
        newTotal : cart.totalAmount

    })


    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'severe error'})
        
    }
  }
module.exports = {
    ApplyCoupon,
    removeCoupon
};
