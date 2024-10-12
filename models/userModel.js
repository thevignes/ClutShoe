const mongoose = require('mongoose')
const {Schema} = mongoose

// User Database connection//

const UserSchema = new Schema({
    name:{
        type:String,
        required: true,
       
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required: true,
      
    },

    IsBlocked:{
        type:Boolean,
        default: false
    },
    IsAdmin:{
        type:Boolean,
        default: false
    },
    cart:[{
        type:Schema.Types.ObjectId,
        ref:'Product'
    }],
    orders:[{
        type:Schema.Types.ObjectId,
        ref:'Product'
    }],
    wishlist:[{
        type:Schema.Types.ObjectId,
        ref:'Transactions'
    }],
    
    review:[{

        type:Schema.Types.ObjectId,
        ref:'Product'
    }],
    wallet:[{
        type:Schema.Types.ObjectId,
        ref:'Transaction'
    }]
 


})

// UserSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
// });

const User = mongoose.model('User',UserSchema)

module.exports  = User;