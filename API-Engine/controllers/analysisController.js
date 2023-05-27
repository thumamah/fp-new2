const Occupancy = require('../models/Occupancy')
const Room = require('../models/Room')
const Booking = require('../models/Booking')
const Hotel = require('../models/Hotel')
var cron = require('node-cron');
// calculate occupancy rate
// const calculateOccupancy = async (req, res) => {
//     const { hotelId } = req.params;
//     const { date } = req.query;

//     const today_date = new Date();
//     today_date.setHours(today_date.getHours() - 1);

//     try {
//         const roomOccupied = await Booking.countDocuments({
//             startDate: { $lte: date },
//             endDate: { $gte: date },
//             HotelId: hotelId,
//         })
//         console.log(roomOccupied)

//         console.log('oc' + roomOccupied)

//         const totalRooms = await Room.countDocuments({ hotel: hotelId });
//         console.log('t' + totalRooms)

//         const occupancyRate = (roomOccupied / totalRooms) * 100;
//         console.log('r' + occupancyRate)

//         const occupancyData = [{ date, occupancyRate, roomOccupied, totalRooms, hotelId }];
//         console.log(occupancyData)
//         res.json(occupancyData);
//     }
//     catch (error) {
//         console.error(error)
//         res.status(500).json({ error: 'server error' })
//     }

// }

// // POST /occupancy
// const updateRate = async (req, res) => {
//     try {
//         const { HotelId, Date, OccupancyRate, totalRooms, occupiedRooms } = req.body;

//         // Check if data already exists for this hotel and date
//         const existingData = await Occupancy.findOne({ HotelId, Date });

//         if (existingData) {
//             // Update existing data if it already exists
//             await Occupancy.updateOne({ _id: existingData._id }, { OccupancyRate: OccupancyRate });
//         } else {
//             // Create new data if it doesn't exist
//             const new_occupancy = new Occupancy({
//                 Date: Date,
//                 HotelId: HotelId,
//                 OccupancyRate: OccupancyRate,
//                 totalRooms: totalRooms,
//                 occupiedRooms: occupiedRooms
//             })
//             await new_occupancy.save();
//         }

//         res.status(200).json({ message: 'Occupancy data added successfully.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };

// const calculateOccupancy = async () => {
//     try {
//         const hotels = await Hotel.find();

//         for (const hotel of hotels) {
//             const hotelId = hotel._id;
//             const date = new Date();
//             // date.setHours(date.getHours() - 1);


//             const roomOccupied = await Booking.countDocuments({
//                 startDate: { $lte: date },
//                 endDate: { $gte: date },
//                 HotelId: hotelId,
//             });
//             console.log("room occu", roomOccupied)

           

//             const totalRooms = await Room.countDocuments({ hotel: hotelId });
//             console.log("room total", totalRooms)
//             const occupancyRate = (roomOccupied / totalRooms) * 100;
//             console.log("room rate", occupancyRate)

//             const occupancyData = {
//                 //date: date.toISOString().split('T')[0], // Format the date as "YYYY-MM-DD"
//                 date,
//                 occupancyRate,
//                 roomOccupied,
//                 totalRooms,
//                 hotelId,
//             };
//             console.log("room data", occupancyData)

//             await updateRate(occupancyData);
//         }

//         console.log('Occupancy rates calculated and updated for all hotels.');
//     } catch (error) {
//         console.error('Error calculating and updating occupancy rates:', error);
//     }
// };

const calculateOccupancy = async () => {
    try {
        const bookings = await Booking.find();

        for (const booking of bookings) {
            const { roomId, startDate, endDate, HotelId } = booking;
            const totalRooms = await Room.countDocuments({ hotel: HotelId });
            const roomOccupied = await Booking.countDocuments({
                startDate: { $lte: startDate },
                endDate: { $gte: startDate },
                HotelId: HotelId,
            });
            
            const occupancyRate = (roomOccupied / totalRooms) * 100;

            const occupancyData = {
                date: startDate.toISOString().split("T")[0],
                occupancyRate,
                roomOccupied,
                totalRooms,
                hotelId: HotelId,
            };

            await updateRate(occupancyData);
        }

        console.log('Occupancy');
    } catch (error) {
        console.error('Error ', error);
    }
};


const updateRate = async (occupancyData) => {
    try {
        const { hotelId, date, occupancyRate, totalRooms, roomOccupied } = occupancyData;

        //const existingData = await Occupancy.findOne({ HotelId: hotelId, Date: date });
        const formattedDate = new Date(date).toISOString().split("T")[0];
        console.log("format d ", formattedDate)

        const time = new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1)
        const datestamp = new Date(time);

        const existingData = await Occupancy.findOne({ HotelId: hotelId, Date: { $gte: formattedDate, $lt: datestamp.toISOString() } });
        console.log("exist ", existingData)

        console.log(datestamp.toISOString())

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


// const findOccupancyRates = async (req, res) => {
//     const { hotelId } = req.params;
//     const { date, endDate } = req.query;


//     try {
//         const rates = await Occupancy.findOne({ HotelId: hotelId, Date: date });
//         console.log(rates)
//         if (!rates) {
//             return res.status(404).json({ error: 'not results found' })
//         }

//         // const occupancyData = [{ date, occupancyRate, hotelId }];
//         console.log(rates)
//         const occupancyData = [{ date, occupancyRate: rates.OccupancyRate, hotelId: rates.HotelId }];
//         res.json(occupancyData);
//     }
//     catch (error) {
//         console.log(error)
//         res.status(500).json({ error: 'server error' })
//     }
// }

const findOccupancyRates = async (req, res) => {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const rates = await Occupancy.find({
            HotelId: hotelId,
            Date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        console.log(rates)

        if (!rates) {
            return res.status(404).json({ error: 'No results found' });
        }

        const occupancyData = rates.map((rate) => ({
            date: rate.Date,
            occupancyRate: rate.OccupancyRate,
            hotelId: rate.HotelId,
        }));

        res.json(occupancyData);

        // const occupancyData = [{ date: rates.Date, OccupancyRate: rates.OccupancyRate, hotelId: rates.HotelId }];
        // console.log(occupancyData)
        // res.json(occupancyData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' });
    }
};


cron.schedule('4 * * * *', () => {
    console.log('running a task every hour');
    calculateOccupancy();

});



module.exports = { calculateOccupancy, updateRate, findOccupancyRates };