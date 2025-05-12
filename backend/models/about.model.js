const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    mission: {
        type: String,
        required: true
    },
    vision: {
        type: String,
        required: true
    },
    values: {
        type: String,
        required: true
    },
    copyright: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('About', aboutSchema); 