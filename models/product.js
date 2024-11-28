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
        required: false,
        default: 0
    },
    sizeQuantities: {
        type: Map,
        of: Number,
        required: true,
        default: () => new Map()
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    size: { type: Map, of: Number },
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
    },

    offer: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            type: String,
            enum: ['percentage', 'flat'], 
            default: 'percentage'
        },
        value: {
            type: Number,
        required: false
        },
        startDate: {
            type: Date,
            required: false
        },
        endDate: {
            type: Date,
            required: false
        }
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category'
      }


},{timestamps:true})                                    
                                                                                                                                        
const Product = mongoose.model('Product',ProductSchema)

module.exports = Product;
