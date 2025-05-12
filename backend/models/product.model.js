const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Price: {
    type: Number,
    required: true,
  },
  Old_Price: {
    type: Number,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  ImageURI: {
    type: String,
    required: false,
  },
  Status: {
    type: String,
    required: true,
    default: 'active',
  },
});

module.exports = mongoose.model("Product", ProductSchema);
