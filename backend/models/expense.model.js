const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    },
    PaymentMethod: {
        type: String,
        required: true,
        enum: ['cash', 'card', 'bank', 'upi']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema); 