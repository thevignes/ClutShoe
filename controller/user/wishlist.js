const mongoose = require("mongoose");
const app = require("../../app");
const Category = require("../../models/categoryModel");
const Product = require("../../models/product");
require("dotenv").config();
const  User = require('../../models/userModel')
const Wishlist = require('../../models/wishlist')


const wishlistPage = async (req, res) => {
    try {
        const userEmail = req.session.user?.email;


        if (!userEmail) {
            return res.redirect('/login');
        }


        const userDoc = await User.findOne({ email: userEmail });
        
        if (!userDoc) {
            return res.status(404).send("User not found");
        }


        const wishlist = await Wishlist.findOne({ userId: userDoc._id }).populate('products');

        if (!wishlist || wishlist.products.length === 0) {
            return res.render('wishlist', {
                message: "Add items to your wishlist to buy your favorite shoes!",
                products: [],
                user: userDoc
            });
        }


        return res.render('wishlist', {
            products: wishlist.products,
            user: userDoc
        });

    } catch (error) {
        console.error("Error loading wishlist:", error);
        return res.status(500).send('An error occurred while loading the wishlist. Please try again later.');
    }
};

const addToWishlist = async (req, res) => {
    try {
        const userEmail = req.session.user.email;
        const productId = req.body.productId;
     
        if (!userEmail) {
            return res.status(401).json({ message: 'User not logged in' });
        }

        const userDoc = await User.findOne({ email: userEmail });
        let wishlist = await Wishlist.findOne({ userId: userDoc._id });
        
        if (!wishlist) {
            wishlist = new Wishlist({ userId: userDoc._id, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }
            
        return res.json({ message: 'Product added to wishlist!' });

    } catch (error) {
        console.log('cannot add product into the wis adding to wishlist:', error);
        res.status(500).json({ message: 'plaese login and add product' });
    }
};

const removeFromWish = async (req, res) => {
    try {
        const productId = req.params.id || req.body.productId;

        if (!productId) {
            return res.status(404).send('This product is not found');
        }

        const userEmail = req.session.user ? req.session.user.email : null;
        if (!userEmail) {
            return res.redirect('/login');
        }

        const userDoc = await User.findOne({ email: userEmail });
        if (!userDoc) {
            return res.status(404).send('User not found');
        }

        const updateWishlist = await Wishlist.findOneAndUpdate(
            { userId: userDoc._id },
            { $pull: { products: productId } },
            { new: true }
        );

        if (!updateWishlist) {
            return res.status(404).send('Wishlist or product not found');
        }

        return res.json({ success: true, message: 'Product removed from wishlist successfully' });
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        return res.status(500).send('Server error occurred while removing product');
    }
};

module.exports = {
    wishlistPage,
    addToWishlist,
    removeFromWish
};
