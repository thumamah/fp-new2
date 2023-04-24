const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },

    image: {
        type: String,
    },

    price: {
        type: Number,
        required:true
    },

    amount: {
        type: Number,
        required: true
    },

    info: {
        type: String,
    },

    reserved:{
        type:Boolean
    },

    hotel: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hotel',
        required: true
     }]
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;