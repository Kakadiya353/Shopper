const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  ProductName: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  Location: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  LastUpdated: {
    type: Date,
    default: Date.now,
  },
  MinimumStock: {
    type: Number,
    required: true,
    default: 10,
  },
  MaximumStock: {
    type: Number,
    required: true,
    default: 100,
  },
  ReorderPoint: {
    type: Number,
    required: true,
    default: 20,
  },
  Notes: {
    type: String,
    required: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Inventory", InventorySchema); 