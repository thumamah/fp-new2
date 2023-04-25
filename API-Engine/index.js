const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userController = require('./controllers/userController');
const hotelController = require('./controllers/hotelController');
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require('path');

// const crypto = require('crypto');

// const secret = crypto.randomBytes(64).toString('hex');



app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());


// testing endpoint token
app.get('/auth', userController.verifyToken,(req, res, next)=>{
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
app.post('/reserve/:roomId', hotelController.reserveRoom);
// reserve room endpoint
app.get('/findBooking/:userId', hotelController.findBooking);

// get all hotels fro admin
app.get('/findAllHotel', hotelController.findAllHotel);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// to run the server
app.listen(3001, async () => {
    try {
      await mongoose.connect(process.env.MON, {
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
  
