const mongoose = require("mongoose");

const productSchema =  new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter Product name!"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Add product's description!"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Enter Product's Price!"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  Stock: {
    type: Number,
    required: [true, "Please Enter Product's Stock"],
    default: 1,
  },
  category: {
    type: String,
    required: [true, "Enter Product Category"],
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

const productmodel = mongoose.model("product", productSchema);
module.exports = productmodel;
