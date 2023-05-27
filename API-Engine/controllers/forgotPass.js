const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// forgot pass endpoint
const forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "email not found" })
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_TOKEN, { expiresIn: '1h' });

        user.resetToken = resetToken;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

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
            subject: 'Reset Password Link',
            text: `Dear ${email},\n\nYour reset password link below: .\n\n${resetLink},\nYour Company Name`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });

    }
};

const changing_password = async (req, res) => {
    const { password, resetToken } = req.body;

    try {
        const user = await User.findOne({
            resetToken: resetToken
        });

        if (!user) {
            return res.status(400).json({ message: "token not found" })
        }
        console.log(" pass ", password)
        const salt = await bcrypt.genSalt(10);
        const encryptedPass = await bcrypt.hash(password, salt)
        console.log("hashed pass ", encryptedPass)
        await User.updateOne({
            _id: user._id
        },
            { password: encryptedPass, }

        );

        // user.password = encryptedPass
        user.resetToken = undefined
        await user.save()

        res.json({ message: "password changed" })


        var transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'flyhotelbooking@hotmail.com',
                pass: 'T12345678.'
            }
        });

        var mailOptions = {
            from: 'flyhotelbooking@hotmail.com',
            to: user.email,
            subject: 'Password changed Succesfully',
            text: `Dear user,\n\nYour password has changed Succesfully: .\n\n,\nFly Hotels`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });

    }
};

module.exports = { forgot_password, changing_password };