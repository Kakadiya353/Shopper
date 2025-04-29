const mongoose = require('mongoose');

const OfferSchema = mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Discount: {
        type: Number,
        required: true,
    },
    MinDiscount: {
        type: Number,
        required: true,
    },
    MaxDiscount: {
        type: Number,
        required: true,
    },
    Status: {
        type: String,
        required: true,
    },
    Offer_Discription: {
        type: String,
        required: true,
    },
    ImageURI: {
        type: String,
        required: false,
    }

})

module.exports = mongoose.model('Offer', OfferSchema);