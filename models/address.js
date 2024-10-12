import mongoose from 'mongoose'

const {Schema} = mongoose

const AddressSchema = new Schema({
UserId:{
    type: Schema.Types.ObjectId,
    ref:'User',
    required: true
},
address:[{
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
Mobile:{
    type: Number,
    required: true
}

}]
})

const Address = mongoose.model('Address',AddressSchema)

export default Address;
