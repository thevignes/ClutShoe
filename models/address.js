const mongoose = require('mongoose')

const {Schema} = mongoose

    const AddressSchema = new Schema({
    UserId:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: false
    },
    address:{
    type:[String]
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


    })

    const Address = mongoose.model('Address',AddressSchema)

    module.exports = Address
