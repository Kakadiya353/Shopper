const mongoose = require('mongoose')

const ContactSchema = mongoose.Schema({
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    SocialMedia: {
        type: String,
        required: true
    },
    CopyRight: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('contact', ContactSchema)