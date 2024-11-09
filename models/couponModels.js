const  mongoose = require('mongoose')


const CouponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    couponCode:{
        type: String,
        required:true,
        unique:true

    },
    amount:{
        type:Number,
        required:true

    },
    maxDiscount :{
        type:Number,
        required:true

    },
    limit:{
        type:Number,
        required:true,
        min:1
    },
    expiryDate:{
        type:Date,
        required:true
         
    },
    isActive :{
        type:Boolean,
        default:true
    },
     description :{
        type:String,
        default:""
     },
     createdAt:{
        type:Date,
        default:Date.now

     },
     updatedAt:{
        type:Date,
        default:Date.now
     },

     userLimit:{

        type:Number,
        default:1
     }
},{timestamps: true})

const Coupon= mongoose.model('Coupon', CouponSchema);

module.exports  =  Coupon