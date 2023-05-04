const Occupancy = require('../models/Occupancy')
const Room = require('../models/Room')
const Booking = require('../models/Booking')

// calculate occupancy rate
const calculateOccupancy = async (req, res) =>{
    const { hotelId } = req.params;
    const { date } = req.query;

    const today_date = new Date();
    today_date.setHours(today_date.getHours() - 1);

    try{
    const roomOccupied = await Booking.countDocuments({
      startDate: { $lte: date },
      endDate: { $gte: date },
      HotelId: hotelId,
    })
    console.log(roomOccupied)

    console.log('oc' + roomOccupied)

    const totalRooms = await Room.countDocuments({ hotel: hotelId });
    console.log('t' + totalRooms)

    const occupancyRate = (roomOccupied / totalRooms) * 100;
    console.log('r' + occupancyRate)

    // const new_occupancy = new Occupancy({
    //     Date: date,
    //     HotelId: hotelId,
    //     OccupancyRate: occupancyRate,
    //     totalRooms: totalRooms,
    //     occupiedRooms: roomOccupied
    // })
    // await new_occupancy.save();

    const occupancyData = [{ date, occupancyRate }];
    console.log(occupancyData)
    res.json(occupancyData);
    }
    catch(error){
        console.error(error)
        res.status(500).json({error: 'server error'})
    }

}

module.exports = { calculateOccupancy };