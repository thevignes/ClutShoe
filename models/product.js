const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    productName:{
        type:String,
        required: false,
        unique: false,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    quantity:{
        type: Number,
        required: true
    },
    images: {
        type: [String],  
        required: true,
    },
    stock:{
        type:Number,
        required: true,
        default:0  
    },
    category:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        required:true
    },
    size:{
        type:Number,
        required:false
    },
    status:{
        type: String,
        required: true,
        default:"Available",
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
        default:true
    },
    colors:{
        type: String,
        required: false
    },
    review:{
        type:String,
        required: false
    }



},{timestamps:true})                                    
                                                                                                                                    
const Product = mongoose.model('Product',ProductSchema)

module.exports = Product;
