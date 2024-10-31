const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  
    },
    oid: {
        type: String,
        unique: true,
        required: true  
    },
    address: {
        Firstname:{type:String,required: true},
        Lastname:{type:String,required: true},

        city: { type: String, required: true },
        state: { type: String, required: true },
        pin: { type: String, required: true },
        country: { type: String, required: true }
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'shipped', 'delivered','Returned','Cancelled'],
            default: 'pending'
        }
    }],
    paymentMethod: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
},{timestamps:true});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
