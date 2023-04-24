const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');



const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();
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
      text: `Dear ${name},\n\nThank you for registering with our service.\n\nBest regards,\nYour Company Name`
    };

    transporter.sendMail(mailOptions, function(error, info){
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



const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create and sign a JWT token for the user
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    // Send the token to the client
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000, path: '/' }).json({ id: user._id, name: user.name, email: user.email, token: token, role: user.role });
    console.log(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });

  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
  //res.redirect('/');
};

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

module.exports = { register, login, logout, verifyToken };
