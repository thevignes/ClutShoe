const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  
  isListed:{
    type: Boolean,
    default: true
  },
  isDelete:{
    type:Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    required: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  offer: {
    type: {
        type: String,
        enum: ['percentage', 'flat'], 
        default: 'percentage'
    },
    value: {
        type: Number,
        required: false
    }
  },
productId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:'Product'
}
},{timestamps:true});

const Category =  mongoose.model ('Category',categorySchema)
module.exports = Category

