require("dotenv").config();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../../models/userModel");

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
  

    if (!user) {

      return res.render('forgetPassword', { errorMessage: 'User not found.' });
    }

    const resetPas = crypto.randomBytes(3).toString("hex");
    const ExpireIn = Date.now() + 30 * 60 * 1000;

    req.session.resetCode = resetPas;
    req.session.resetCodeExpires = ExpireIn;
    req.session.userEmail = email;

    const transport = nodemailer.createTransport({
      service: "gmail",
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: `ClutchShoe <${process.env.NODEMAILER_EMAIL}>`,
      subject: "Password Reset Code",
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n
        Your password reset code is: ${resetPas}\n\n
        This code will expire in 1 hour. If you did not request this, please ignore this email.\n`,
    };

    await transport.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}: ${resetPas}`);

   
    res.render('verification', { successMessage: 'OTP sent successfully! Please check your email.' });
    
  } catch (error) {
    console.log("error while doing this ", error);
    res.status(500).send("!oops server error ");
  }
};

const verify = async (req, res) => {
  try {
    res.render("verification");
  } catch (error) {
    res.status(500).send("Oops, server error!");
  }
};

const codeVerification = async (req, res) => {
  try {
    const { resetCode } = req.body;

    if (
      req.session.resetCode !== resetCode ||
      Date.now() > req.session.resetCodeExpires) {
      return res.redirect("/verification");
    }

    res.redirect("/resetpass");
  } catch (error) {
    console.error("Error during code verification:", error);
    return res.status(500).send("Oops! A server issue occurred.");
  }
};

const  ResetPass = async (req,res)=>{
    try{
        res.render('resetpass')
    }catch (error){
        console.log(error)
        return res.status(500).send('oops server error')

    }
}

const resetpassword = async (req, res) => {
  try {

    const { password, confirmPassword } = req.body;

 
    if (!password || !confirmPassword) {
      return res.status(400).send("Both password fields are required.");
    }
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    }

    const userEmail = req.session.userEmail; 
    if (!req.session.resetCode || Date.now() > req.session.resetCodeExpires) {
      return res.status(404).send("Password reset session has expired. Please request a new reset.");
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send("User not found.");
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();


    req.session.resetCode = null;
    req.session.resetCodeExpires = null;
    req.session.userEmail = null;

    res.redirect("/login");
  } catch (error) {
    console.error("Error while resetting password:", error);
    return res.status(500).send("Oops! Server error occurred.");
  }
};



module.exports = {
  forgetPassword,
  verify,
  codeVerification,
  ResetPass,
  resetpassword
};
