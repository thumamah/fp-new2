const mongoose = require('mongoose');
const HotelSchema = new mongoose.Schema({
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
