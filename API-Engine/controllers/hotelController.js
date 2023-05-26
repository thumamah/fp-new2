const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const addHotel = async (req, res) => {
  upload.any()(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const { name, location, info } = req.body;
    const image = req.files ? req.files[0].filename : undefined;
    console.log(req.files)

    try {
      const hotel = new Hotel({
        name,
        location,
        info,
        image
      });
      await hotel.save();
      res.status(201).send(hotel);
    } catch (error) {
      res.status(400).send(error);
    }
  });
};

const findHotel = async (req, res) => {
  const location = req.params.location;

  try {
    const hotels = await Hotel.find({ location });

    const hotelsWithUrls = hotels.map(hotel => ({
      _id: hotel._id,
      rooms: hotel.rooms,
      name: hotel.name,
      location: hotel.location,
      info: hotel.info,
      image: `http://localhost:3001/uploads/${hotel.image}`
    }));
    console.log(hotelsWithUrls)

    res.status(200).json(hotelsWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const findAllHotel = async (req, res) => {

  try {
    const hotels = await Hotel.find();

    const hotelsWithUrls = hotels.map(hotel => ({
      _id: hotel._id,
      name: hotel.name,
      location: hotel.location
    }));
    console.log(hotelsWithUrls)

    res.status(200).json(hotelsWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const findBooking = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId)
    //console.log(req)
    const bookings = await Booking.find({ userId });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// find all bookings
const findAllBooking = async (req, res) => {
  try {

    //console.log(req)
    
    ///////////////////////
    const bookings = await Booking.find();
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const addRoom = async (req, res) => {
  upload.any()(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const image = req.files ? req.files[0].filename : undefined;
    console.log(req.files)
    try {
      const hotel = await Hotel.findById(req.params.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      const { number, price, amount, info } = req.body;
      const room = new Room({
        number,
        price,
        amount,
        info,
        hotel: hotel._id,
        image: image,
      });
      await room.save();
      await Hotel.findByIdAndUpdate(req.params.hotelId, { $push: { rooms: room._id }, });
      res.status(201).json(room);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

const reserveRoom = async (req, res) => {
  //res.set('Access-Control-Allow-Credentials', 'true');
  const { roomId, startDate, endDate, totalPrice, numAdults, email, hotelName, HotelId } = req.body;
  console.log(email)
  try {
    const existingBooking = await Booking.findOne({
      roomId,
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'Room already booked for the selected dates' });
    }
    const room = await Room.findById(roomId);
    console.log(room)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    //const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmVkYWE5MGIyOWM1ZDMzZTlkMjZkMCIsIm5hbWUiOiJ0aHVtYW1haCIsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE2ODE4MjQ1NzIsImV4cCI6MTY4MTg2MDU3Mn0.U0_PqG22ugdkL3WCpjIXdgTjfFxL1xu_AS5oiHCwjSk';
    // const token = req.cookies.token
    // console.log(req.withcredentials)
    const token = req.headers['x-auth-token'];
    //console.log(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const userId = decoded.id;
    const booking = new Booking({
      roomId,
      startDate,
      endDate,
      totalPrice,
      numAdults,
      userId,
      hotelName,
      HotelId
    });
    console.log(booking)
    await booking.save();
    res.status(201).json({ booking });
    // send registration email
    var transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: 'thumamah50@hotmail.com',
        pass: 'Thumamah123'
      }
    });

    var mailOptions = {
      from: 'thumamah50@hotmail.com',
      to: email,
      subject: 'Registration Successful',
      text: `Dear ${email},\n\nThank you for Booking Hotel: ${booking} with our service.\n\nBest regards,\nYour Company Name`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const findRoom = async (req, res) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Find all bookings that overlap with the selected dates
    const overlappingBookings = await Booking.find({
      roomId: { $in: await Room.find({ hotel: hotelId }) },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
    console.log(hotelId)
    console.log(startDate)
    console.log(endDate)
    console.log("over", overlappingBookings)

    // Get a list of booked room IDs
    const bookedRoomIds = overlappingBookings.map((booking) => booking.roomId);
    console.log("booked", bookedRoomIds)

    // Find all available rooms for the selected dates
    const availableRooms = await Room.find({
      hotel: hotelId,
      _id: { $nin: bookedRoomIds },
    });

    // find room including the images
    const roomsWithImages = availableRooms.map(room => ({
      _id: room._id,
      number: room.number,
      price: room.price,
      info: room.info,
      image: `http://localhost:3001/uploads/${room.image}`
    }));
    console.log("availableRooms", roomsWithImages)

    res.status(200).json({ roomsWithImages });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { addHotel, addRoom, findHotel, findAllBooking, findRoom, reserveRoom, findBooking, findAllHotel };
