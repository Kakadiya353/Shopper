const mongoose = require('mongoose')

const ReplySchema = mongoose.Schema({
    UserName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Subject: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    Replied: {
        type: String,
        default: ''
    },
    RepliedSubject: {
        type: String,
        default: ''
    }
},{
    timestamps: true
})

module.exports=mongoose.model('Reply',ReplySchema)