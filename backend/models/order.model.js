const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  Email: { type: String, required: true },
  DeliveryAddress: { type: String, required: true },
  OrderDateTime: { type: String, required: true },
  TotalAmount: { type: Number, required: true },
  OfferName: { type: String, required: true },
  DiscountAmount: { type: Number, required: true },
  ActualAmount: { type: Number, required: true },
  Products: [{
    ProductID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    Quantity: { type: Number, required: true },
    Total: { type: Number, required: true }
  }],
});

module.exports = mongoose.model('Order', orderSchema);
