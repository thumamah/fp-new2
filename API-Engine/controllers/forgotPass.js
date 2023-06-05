const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// forgot pass endpoint
// so when user request for reset pass link
const forgot_password = async (req, res) => {
    // extract user provided email
    const { email } = req.body;

    try {
        // check if thaty user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "email not found" })
        }

        // create reset token using jwt
        // and setting expiry date after 1 hour for security reasons
        const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_TOKEN, { expiresIn: '1h' });

        // setting it to user model for later retreival
        user.resetToken = resetToken;
        // save the user model
        await user.save();

        // preparing the link to send to user through email
        // appedning it to end of site link
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        console.log(resetLink)

        // using node mailor to send password reset link
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
                console.log('Email sent, Check your Email ');
                return res.status(200).json({ message: "Email sent, Check your Email" })
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });

    }
};

// when user changes password
const changing_password = async (req, res) => {
    // get the password and reset token form request body
    const { password, resetToken } = req.body;

    try {
        // check if token exists
        const user = await User.findOne({
            resetToken: resetToken
        });

        // if not then user cannot change password
        if (!user) {
            return res.status(400).json({ message: "token not found" })
        }

        // checking for strong pasword
        const strongPass = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        if (!strongPass.test(password)) {
            return res.status(400).json({ message: 'Password should be strong enough: 1 uppercase, lowercase, 1 special char' })
        }
        console.log(" pass ", password)
        // salting and hashing the password
        const salt = await bcrypt.genSalt(10);
        const encryptedPass = await bcrypt.hash(password, salt)
        console.log("hashed pass ", encryptedPass)
        // updating the user password with the new one
        await User.updateOne({
            _id: user._id
        },
            { password: encryptedPass, }

        );

        // removing the reset token and saving user model state
        user.resetToken = undefined
        await user.save()

        res.json({ message: "Password Changed Successfully" })

        // using node mailer to send pass change confirmation email
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
        // handling error
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });

    }
};

module.exports = { forgot_password, changing_password };