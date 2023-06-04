const express = require('express');
require('dotenv').config();
// mongo connection
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// importing neccessary controllers for routes
const userController = require('./controllers/userController');
const hotelController = require('./controllers/hotelController');
const analysisController = require('./controllers/analysisController');
const forgotPass  = require('./controllers/forgotPass');
const app = express();
// importing cookie parser library
const cookieParser = require("cookie-parser");
// importing the cors library
const cors = require('cors');
// importing path to use it to link to files
const path = require('path');
// using cookie parser to make cookies available to the request object.
app.use(cookieParser());
// parsing the request body to make itn available in the request body object
app.use(bodyParser.json());
// enabling cross origin resource sharing to allow client to make request to server
// from different domain
app.use(cors());

// testing endpoint token
app.get('/auth', userController.verifyToken, (req, res, next) => {
  res.send("well done")
})

// registration end point
app.post('/register', userController.register);
// login endpoint
app.post('/login', userController.login);
// logout endpoint
app.post('/logout', userController.logout);
// add hotel endpoint
app.post('/addHotel', hotelController.addHotel);
// add room endpoint
app.post('/addRoom/:hotelId', hotelController.addRoom);
// find hotel endpoint
app.get('/findHotel/:location', hotelController.findHotel);
// find room endpoint
app.get('/findRoom/:hotelId', hotelController.findRoom);

// reserve room endpoint
app.post('/reserve/:roomId', userController.verifyToken, hotelController.reserveRoom);

// reserve room endpoint
app.get('/findBooking/:userId', hotelController.findBooking);

// get all hotels from admin
app.get('/findAllHotel', hotelController.findAllHotel);
// get all bookings for admin
app.get('/findAllBookings', hotelController.findAllBooking);

// get occupancy rate
app.get('/rate/:hotelId', analysisController.findOccupancyRates);

// insert occupancy rate
app.post('/insert', analysisController.updateRate);

// contact message
app.post('/contact', userController.message);

// reset pass link
app.post('/reset', forgotPass.forgot_password);

// user changing pass
app.post('/changePass', forgotPass.changing_password);

// delete booking
app.post('/deleteBooking', hotelController.deleteBooking);

// handles the static files upload to the uploads forlder
// for handling images for hotels and rooms
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// to run the server
app.listen(3001, async () => {
  try {
    await mongoose.connect(process.env.MON, {
      // mongodb configuration option used to ensure latest connection approach is used
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('connected to database');
    console.log('connected');
    // console.log(secret);
  } catch (err) {
    console.error('connection error', err);
  }
});