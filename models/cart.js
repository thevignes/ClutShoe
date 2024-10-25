const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
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

      price: {
        type: Number,

        required: false,
      },
    },
  ],
  totalAmount: {
    type: Number,

    default: 0,
  },
  isCompleted: {
    type: Boolean,

    default: false,
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart