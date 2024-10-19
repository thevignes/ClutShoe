const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false 
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

},{timestamps:true});

const Category =  mongoose.model ('Category',categorySchema)
module.exports = Category

