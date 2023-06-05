const mongoose = require('mongoose');
const HotelSchema = new mongoose.Schema({
    // model for saving all hotels
    name: {
        type: String,
        required: true,
    },
    
    location: {
        type: String,
        required: true,
    },

    image: {
        type: String,
    },
    info: {
        type: String,
    },
    rooms: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Room'
     }]
});

const Hotel = mongoose.model('Hotel', HotelSchema);

module.exports = Hotel;
