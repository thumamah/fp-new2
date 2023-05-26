const mongoose = require('mongoose');
const OccupancySchema = new mongoose.Schema({
    Date: {
        type: Date,
        required: true,
    },
    
    occupiedRooms: {
        type: Number,
        required: true,
    },

    totalRooms: {
        type: Number, 
        required: true
    },

    OccupancyRate: {
        type: Number, 
        required: true
    },

    HotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
      },
});

const Occupancy = mongoose.model('Occupancy', OccupancySchema);

module.exports = Occupancy;
