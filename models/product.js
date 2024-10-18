const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    price:{
        type: Number,
        required: true
    },
    quantity:{
        type: Number,
        required: true
    },
    images:{
        type:String,
        required: true,

    },
    stock:{
        type:Number,
        required: true,
        default:0  
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'category',
        required:true
    },
    size:{
        type:String,
        required:true
    },
    status:{
        type: String,
        required: true,
        enum:['Available','Out of Stock']
    },
    regularPrice:{
        type: Number,
        required: true
    },
    salePrice:{
        type: Number,
        required: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    isListed:{
        type: Boolean,
        default: false
    },
    colors:{
        type: String,
        required: false
    },
    review:{
        type:String,
        required: false
    }



})                                    
                                                                                                                                    
const Product = mongoose.model('Product',ProductSchema)

module.exports = Product;
