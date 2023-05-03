const Occupancy = require('./models/Occupancy')
const Room = require('./models/Room')
const Booking = require('./models/Booking')

// calculate occupancy rate
const calculateOccupancy = async (date, hotelId) =>{
    const bookings = await Booking.find({
        startDate: {$lte: date},
        endDate: {$gte: date},
        hotelId: hotelId,
    }).populate('roomId');

    const roomOccupied = bookings.reduce(
        (accumulator, booking) => accumulator + booking.roomId.length, 0
    );

    
}