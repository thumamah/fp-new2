const mongoose = require('mongoose');
const BookingSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
      numAdults: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
