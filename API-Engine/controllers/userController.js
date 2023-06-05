const User = require('../models/user');
const Contact = require('../models/Contact');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// register endpoint
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if email already exists
    const checkUniqueEmail = await User.findOne({ email });
    if (checkUniqueEmail) {
      return res.status(400).json({ message: 'Email Already Exists' })
    }

    // checking for strong pasword
    const strongPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[.!@#$%^&*]).{8,}$/;
    if (!strongPass.test(password)) {
      return res.status(400).json({ message: 'Password should be strong enough: 1 uppercase, lowercase, 1 special char' })
    }

    // salting and hashing the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating new user record and saving it
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    // send confirmation email
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
      text: `Dear ${name},\n\nThank you for registering with our service.\n\nBest regards,\nYour Company Name`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// endpoint to login
const login = async (req, res) => {
  // getting the user email and password to verify it
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'user not found' });

    // Check if password is correct by comparing the with hashed password
    console.log(password)
    console.log(user.password)
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("ismatch ", isMatch)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create and sign a JWT token for the user which will be used later for authorisation
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    // Send the token to the client and other info
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000, path: '/' }).json({ id: user._id, name: user.name, email: user.email, token: token, role: user.role });
    console.log(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });

  }
};


// endpoint to logout
const logout = (req, res) => {
  // clearing all cookies
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
};

// endpoint to verify jwt token
const verifyToken = (req, res, next) => {
  // accessing the auth token from the headers
  const token = req.headers['x-auth-token'];
  console.log(req.headers)
  // if no token then let them know
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    // else decode it to extract user info and assign it to user object
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // proceed on with the next function
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

// endpoint to send contact message
const message = async (req, res, next) => {
  // getting the user message info
  const { name, email, message } = req.body;
  try {
    // creating new message records to save them in db
    const contact = new Contact({
      name,
      email,
      message,
    });
    await contact.save();
    // send message confirmation email
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
      subject: 'inquiry recieved',
      text: `Dear ${name},\n\nThank you for your message.\n\nBest regards,\nYour Company Name`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    next(error);
  }
};

// exporting all the functions
module.exports = { register, login, logout, verifyToken, message };
