const mongoose = require('mongoose')

const {Schema} = mongoose

    const AddressSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
 
        state:{
        type: String,
        required: true
    },
    pin:{
        type:Number,
        required:true
    },
    district:{
        type:String,
        required: true
    },
    city:{
        type:String,
        required:true

    },
    Firstname:{
        type: String,
        required: true
    },
    Lastname:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    type:{
        type:String,
    },
isDeleted:{
    type:Boolean,
    default:false
},
oid: { type: String, required: true }, 

    },{timestamps:true}) 

    const Address = mongoose.model('Address',AddressSchema)

    module.exports = Address
