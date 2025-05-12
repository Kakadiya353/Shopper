const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  ProductName: {
    type: String,
    require: true,
  },
  Category: {
    type: String,
    require: true,
  },
  Price: {
    type: Number,
    require: true,
  },
  Email: {
    type: String,
    require: true,
  },
  Quantity: {
    type: Number,
    require: true,
  },
  Total: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("Cart", CartSchema);
