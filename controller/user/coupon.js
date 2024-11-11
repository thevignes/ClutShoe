const mongoose = require("mongoose");
const app = require("../../app");
const Category = require("../../models/categoryModel");
const Product = require("../../models/product");
require("dotenv").config();
const  User = require('../../models/userModel')
const Coupon = require('../../models/couponModels')



const ApplyCoupon = async (req, res) => {
    try {
        console.log('Starting coupon application...');

        const { couponCode, orderValue } = req.body;
        const userEmail = req.session.user?.email;

        if (!userEmail) {
            console.log("User is not logged in");
            return res.status(401).json({ message: "You must be logged in to apply a coupon" });
        }

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        const coupon = await Coupon.findOne({ couponCode: couponCode, isActive: true });

        if (!coupon) {
            console.log(`Coupon ${couponCode} not found or inactive`);
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const currentDate = new Date();

        if (coupon.expiryDate < currentDate) {
            console.log(`Coupon ${couponCode} is expired`);
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (orderValue < coupon.minOrderValue) {
            console.log(`Order value ${orderValue} is below minimum required ${coupon.minOrderValue}`);
            return res.status(400).json({ message: `Minimum order value of ${coupon.minOrderValue} is required to apply this coupon` });
        }

       
        const userUsage = coupon.usersUsed.find(us => us.userId.toString() === user._id.toString());

        if (userUsage && userUsage.usageCount >= coupon.userLimit) {
            console.log(`User ${user._id} has reached the usage limit for coupon ${couponCode}`);
            return res.status(400).json({ message: 'You have reached the limit for using this coupon' });
        }

        let discount = 0;

        if (coupon.discountType === 'percentage') {
            // Calculate the discount as a percentage of the order value
            discount = orderValue * (coupon.amount / 100);
        

        
            console.log(`Percentage discount calculated: ₹${discount}`);
        } else if (coupon.discountType === 'fixed') {
            // For a fixed discount, apply the lesser of the fixed amount and max discount
            discount = Math.min(coupon.amount, coupon.maxDiscount);
        
            console.log(`Fixed discount calculated: ₹${discount}`);
        }
        
        // Calculate the final price after applying the discount
 
        const finalPrice = orderValue - discount;
        
        console.log(`Final Price after discount: ₹${finalPrice}`);
        
        
        console.log('The coupon amount is', coupon.amount, 'The max discount is', coupon.maxDiscount);

        if (userUsage) {
            userUsage.usageCount += 1;
        } else {
            coupon.usersUsed.push({ userId: user._id, usageCount: 1 }); 
        }

        await coupon.save();

        console.log(`Coupon ${couponCode} applied successfully, discount: ${discount}, final price: ${finalPrice}`);
        res.status(200).json({ finalPrice, discount });

    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    ApplyCoupon
};
