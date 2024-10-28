const mongoose = require('mongoose')
const { Schema } = mongoose

const OrderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: false  
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
        required: true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',

        },
        quantity:Number,
        subtotal:Number
    }],
    PaymentMethod:{type:String,require:true},
    total:{type:Number,require:false},
    status: { type: String, default: 'Pending' }, 
    orderDate: { type: Date, default: Date.now }
})

const Order = mongoose.model('Order',OrderSchema)

module.exports = Order
