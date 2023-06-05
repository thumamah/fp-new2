const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
    // model for messages
    name: {
        type: String,
        required: true,

    },

    email: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },


});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
