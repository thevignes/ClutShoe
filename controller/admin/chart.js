const Product = require ('../../models/product')
const Order = require ('../../models/order')
const Category = require('../../models/categoryModel')
const User = require('../../models/userModel')

const GetOrder = async (req,res)=>{
    try {

  
        const orders = await Order.find(dateFilter)
        .populate('products.productId', 'productName')
        .sort({ createdAt: -1 });


   

    return res.render('dashboard',
        {
            orders,
       

    });
        
    } catch (error) {
        console.log(error)
        
    }
}


module.exports = {
    GetOrder
}