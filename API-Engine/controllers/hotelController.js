const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// importing multer library
const multer = require('multer');
// creating instance of multer and setting up the
// destination for the images to be stroed
const upload = multer({ dest: 'uploads/' });

// to add hotels
const addHotel = async (req, res) => {
  // up;oad function to upload images and handling errors
  upload.any()(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    // getting the new hotel data
    const { name, location, info } = req.body;
    // checking if file is there else setting to undefined
    const image = req.files ? req.files[0].filename : undefined;
    console.log(req.files)

    try {
      // creating the new hotel document and saving it
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

// find hotel by location
const findHotel = async (req, res) => {
  // getting user provided location from search bar
  const location = req.params.location;

  try {
    // finding all hotels in that location
    const hotels = await Hotel.find({ location });

    // iterating over hotels and assigning their values to send it to front end
    // also assigning the image location
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

// find all hotels
const findAllHotel = async (req, res) => {

  try {
    // finding all hotels to display them in admins drop down menu
    const hotels = await Hotel.find();

    // iteratrting over all hotels and using spread operator
    // to send all hotel data instead of manually defining each
    const hotelsWithUrls = hotels.map(hotel => ({
      ...hotel
    }));
    console.log(hotelsWithUrls)

    res.status(200).json(hotelsWithUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// find reservations by user id
const findBooking = async (req, res) => {
  try {
    // getting the user id
    const userId = req.params.userId;
    console.log(userId)

    // finding all bookings all associated with this user id and sending them
    const bookings = await Booking.find({ userId });
    res.status(200).json({ bookings });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// find all bookings for admin use
const findAllBooking = async (req, res) => {
  try {
    // finds all bookings to show in admin side
    const bookings = await Booking.find();
    res.status(200).json({ bookings });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// to add rooms to a selected hotel
const addRoom = async (req, res) => {
  // used upload.any function to handle images
  // and also handling the multer error if any during file upload
  upload.any()(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    // check if file is recieved from front end
    const image = req.files ? req.files[0].filename : undefined;
    console.log(req.files)
    // getting the hotel id 
    const hotelId = req.params.hotelId;

    try {
      // find hotel according to the hotel id
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      // recieving the new room data to add to room model
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

      // now the rooms array in the hotel model is updated
      await Hotel.findByIdAndUpdate(hotelId, { $push: { rooms: room._id }, });
      res.status(201).json(room);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// room reservation
const reserveRoom = async (req, res) => {

  // recieving all data to reserve the room
  const { roomId, startDate, endDate, totalPrice, numAdults, email, hotelName, HotelId } = req.body;
  // converting the dates into the date object
  const sdate = new Date(startDate);
  const edate = new Date(endDate);
  
  console.log(email)

  try {
    // finding the existing bookings and checking if that rooms is already booked in those dates
    const existingBooking = await Booking.findOne({
      roomId,
      startDate: { $lt: sdate },
      endDate: { $gt: startDate },
    });
    // if so then return error message
    if (existingBooking) {
      return res.status(400).json({ message: 'Room already booked for the selected dates' });
    }
    // fincding the room by its id and checking if it exist to ensure no conflicts are made
    const room = await Room.findById(roomId);
    console.log(room)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // to reserve we need to ensure user is authorised to reserve the room
    const token = req.headers['x-auth-token'];
    
    // decoding the jwt token to assign it with the user id for later use
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const userId = decoded.id;

    // with the data the new reservation is created in the booking model and saved
    const booking = new Booking({
      roomId,
      startDate: sdate,
      endDate: edate,
      totalPrice,
      numAdults,
      userId,
      hotelName,
      HotelId
    });
    console.log(booking)
    await booking.save();
    res.status(201).json({ booking });
    // send room reservation confirmation email
    var transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: 'flyhotelbooking@hotmail.com',
        pass: 'T12345678.'
    }
    });

    var mailOptions = {
      from: 'flyhotelbooking@hotmail.com',
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

// find all available rooms
const findRoom = async (req, res) => {
  // retrieving the relevant parameters and dates from the query
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Find all bookings that overlap
    // using the $in operater it checks if the selected hotel room id is in bookings model
    // then it checks if startdate is less than endDate which means there is conflict
    // similarly it checks if endDate is greater than startDate which also means there is conflict 
    const overlappingBookings = await Booking.find({
      roomId: { $in: await Room.find({ hotel: hotelId }) },
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
    console.log(hotelId)
    console.log(startDate)
    console.log(endDate)
    console.log("over", overlappingBookings)

    // we want all the room ids which have already been booked
    const bookedRoomIds = overlappingBookings.map((booking) => booking.roomId);
    console.log("booked", bookedRoomIds)

    // now we want to find all rooms in that hotel which have not been booked using
    // the $nin operator
    const availableRooms = await Room.find({
      hotel: hotelId,
      _id: { $nin: bookedRoomIds },
    });

    // here we do an additional map operation so we can include the room image
    // which helps in linking to the appropiate room image id in upload folder
    const roomsWithImages = availableRooms.map(room => ({
      _id: room._id,
      number: room.number,
      price: room.price,
      info: room.info,
      image: `http://localhost:3001/uploads/${room.image}`
    }));
    console.log("availableRooms", roomsWithImages)

    res.status(200).json({ roomsWithImages });
    // error handling
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete reservation
const deleteBooking = async (req, res) => {
  try {
    // getting the booking id and end date.
    // end date is needed to check booking is in past and if so user shouldnt be able to delete that
    const bookingId = req.body.bookId;
    const endDate = req.body.endDate;
    console.log("bid ", endDate)

    const current = new Date();

    // checking if booking is in past
    if (endDate.getDate + 1 < current) {
      return res.status(404).json({ meesage: "cannot delete past reservations" })
    }

    // find bookings associated with user 
    const booking = await Booking.findById(bookingId);
    console.log("booking ", booking)
    // checking if booking is there
    if (!booking) {
      return res.status(404).json({ meesage: "booking not found" })

    }
    // then the booking is deleted 
    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: "booking deleted successfully" })
  }
  catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "server error" })
  }
}

module.exports = { addHotel, addRoom, findHotel, findAllBooking, findRoom, reserveRoom, findBooking, findAllHotel, deleteBooking };
