const Occupancy = require('../models/Occupancy')
const Room = require('../models/Room')
const Booking = require('../models/Booking')
const Hotel = require('../models/Hotel')
var cron = require('node-cron');


// calculating occupancy rate
const calculateOccupancy = async () => {
    try {
        // get all the bookings from booking model
        const bookings = await Booking.find();

        // iterate over all bookings
        for (const booking of bookings) {

            // extracting the neccessary values from the booking
            const { roomId, startDate, endDate, HotelId } = booking;

            // getting the total rooms
            const totalRooms = await Room.countDocuments({ hotel: HotelId });

            // getting the occupied rooms
            const roomOccupied = await Booking.countDocuments({
                startDate: { $lte: startDate },
                endDate: { $gte: startDate },
                HotelId: HotelId,
            });
            
            // calculating total occupancy rate
            const occupancyRate = (roomOccupied / totalRooms) * 100;

            // preparing all data to send to the update occupancy rate algorithm
            // the start date is splitted to extract first part of it to compare 
            // later in the update algorithm
            const occupancyData = {
                date: startDate.toISOString().split("T")[0],
                occupancyRate,
                roomOccupied,
                totalRooms,
                hotelId: HotelId,
            };

            // calling the update algorithm and passing in data to update it
            await updateRate(occupancyData);
        }

        console.log('Occupancy');
    } catch (error) {
        console.error('Error ', error);
    }
};

// function to update occupancy model
const updateRate = async (occupancyData) => {
    try {
        // extracting all the occupancy data from the previous algorithm
        const { hotelId, date, occupancyRate, totalRooms, roomOccupied } = occupancyData;

        // using the split method to extract the first part of the date to compare
        const dateOnly = new Date(date).toISOString().split("T")[0];
        console.log("format d ", dateOnly)

        // adding one day to the start date so occupancy rate can be viewed per day
        const nextDay = new Date(dateOnly).setDate(new Date(dateOnly).getDate() + 1)
        console.log("next day ", nextDay)
        // to convert it into date object
        const dateObject = new Date(nextDay);
        console.log("stamp ", dateObject)

        // checking if occupancy data already exists
        // check if the hotel id matches
        // checks if date is greater than or equal to start date and less than then end date which mean it lies within 24 hours
        const existingData = await Occupancy.findOne({ HotelId: hotelId, Date: { $gte: dateOnly, $lt: dateObject.toISOString() } });
        console.log("exist ", existingData)

        console.log(dateObject.toISOString())

        // if it exists then update that else create a new record and save them
        if (existingData) {
            await Occupancy.updateOne({ _id: existingData._id }, { OccupancyRate: occupancyRate });
        } else {
            const newOccupancy = new Occupancy({
                Date: date,
                HotelId: hotelId,
                OccupancyRate: occupancyRate,
                totalRooms: totalRooms,
                occupiedRooms: roomOccupied,
            });
            await newOccupancy.save();
        }

        console.log(`Occupancy `);
    } catch (error) {
        console.error('Error ', error);
    }
};

// endpoint used by admin to fetch occupanbcy records by date and hotel
const findOccupancyRates = async (req, res) => {
    // extracting hotel id and dates
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        // getting the occupancy data of the given date and hotel
        const rates = await Occupancy.find({
            HotelId: hotelId,
            Date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        console.log(rates)

        // if none then send error
        if (!rates) {
            return res.status(404).json({ error: 'No rooms reserved on this day' });
        }

        // iterate over occupancy data and prepare to send
        const occupancyData = rates.map((rate) => ({
            date: rate.Date,
            occupancyRate: rate.OccupancyRate,
            hotelId: rate.HotelId,
        }));

        res.json(occupancyData);

        // handle errors
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// used cron jobs to schedule occupancy algorithm every hour
cron.schedule('0 * * * *', () => {
    console.log('updating occupancy model every hour');
    calculateOccupancy();
});

// export these functions for use in other routes
module.exports = { calculateOccupancy, updateRate, findOccupancyRates };