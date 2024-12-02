const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      offerPrice: {
        type: Number,
        default: 0,
      },
    },
  ],
  
  totalAmount: {
    type: Number,
    default: 0,
  },
  discountAmount:{
    type:Number,
    set: val => parseFloat(val) || 0
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  couponCode: { 
    type: String,
    default: null,
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart