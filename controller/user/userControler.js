const app = require("../../app");
const User = require("../../models/userModel");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bcrypt = require("bcrypt");

const HomePage = async (req, res) => {
  try {
    // console.log('rendering')
    return res.render("home");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
const PageNotFound = async (req, res) => {
  try {
    return res.render("PageNotfound");
  } catch (error) {
    res.redirect("PageNotfound");
  }
};

const homePage = async (req, res) => {
  try {
    res.render("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const SignUp = async (req, res) => {
  try {
    return res.render("register");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
};

// creating transport
const transport = nodemailer.createTransport({
  service: "gmail",
  host: process.env.MAIL_HOST,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

//transport for email service


const sendOtp = async (email, otp) => {
  const SendOTOption = {
    from: `ClutchShoe <${process.env.NODEMAILER_EMAIL}>`,
    to: email,
    subject: "ClutchShoe OTP Verification",
    text: `Your OTP is ${otp}`,
    html: `<b>Your OTP is ${otp}</b>`,
  };

  try {
    await transport.sendMail(SendOTOption);
    console.log(`OTP sent successfully to ${email}: ${otp}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

const Registration = async (req, res) => {

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("otpppppp:",otp)
  req.session.otp = otp;
  console.log("session otpppppp:", req.session.otp)

  try {
    const { email, password, name } = req.body;

    if (!email || email.trim() === "") {
      return res
        .status(400)
        .render("register", { message: "Email is required" });
    }

    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.render("register", { message: "Email already exists" });
    }

    // Generate OTP and store in session

    req.session.Tempuser = { email, password, name };
    console.log(req.session, "first otp");

    console.log("calling ", req.session.Tempuser);
    await sendOtp(email, otp);
    return res.redirect("/verify-otp");
  } catch (error) {
    console.log("Error during registration:", error);
    return res.render("register", { message: "Internal server error" });
  }
};

const getOtp = async (req, res) => {
  try {
    res.render("verify-otp");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    // Check if the session has expired
    if (!req.session.otp || !req.session.Tempuser) {
      return res.status(400).render("verify-otp", {
        message: "Session expired, please try again.",
      });
    }

    // Log the entered and stored OTP for debugging
    console.log("Entered OTP:", otp);
    console.log("Stored OTP:", req.session.otp);

    // Convert both OTPs to strings and trim any whitespace for accurate comparison
    if (String(otp).trim() === String(req.session.otp).trim()) {
      const { email, password, name } = req.session.Tempuser;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
      });

      console.log("Creating new user:", newUser);

      // Save the new user and handle errors
      try {
        await newUser.save();
      } catch (saveError) {
        console.error("Error saving new user:", saveError);
        return res.render("verify-otp", {
          message: "User registration failed.",
        });
      }

      // Clear stored session data
      // req.session.otp = null;
      // req.session.Tempuser = null;

      // Redirect to login page after successful registration

      return res.redirect("/login"); // Use redirect here
    } else {
      console.log("Invalid OTP entered.");
      return res.render("verify-otp", {
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.log("Error during OTP verification:", error);
    return res.render("verify-otp", { message: "Internal server error." });
  }
};

///resend otp

const resendOtp = async (req, res) => {
  console.log("OTP is:", req.session.otp);
  console.log("the main session", req.session.Tempuser);
  try {
    console.log(req.session); // Log the entire session object
    // console.log('FETCHINGGGG')

    if (!req.session.Tempuser) {
      return res.status(400).render("verify-otp", {

        message: "Session expired, please try again.",
      });
    }
;
    console.log("main", req.session.Tempuser);
  
    const newOtp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = newOtp; 
console.log(newOtp ,"new otp")
    console.log(req.session, "after otp");
    console.log("main", req.session.Tempuser);

    const { email } = req.session.Tempuser;
    console.log(email, "email");

    const SendOTOption = {
      from: `ClutchShoe <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "ClutchShoe OTP Verification",
      text: `Your resend OTP is ${newOtp}`,
      html: `<b>Your resend OTP is ${newOtp}</b>`,
    };

    await transport.sendMail(SendOTOption);

    console.log(`OTP sent successfully to ${email}: ${newOtp}`);

    return res.render("verify-otp", {
      message: "A new OTP has been sent to your email.",
    });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    return res.render("verify-otp", { message: "Internal server error" });
  }
  //
};
const VerifyResOtp = async (req,res)=>{
if(newOtp === req.session.newOtp){
  res.render('home').send({success:true,message:"registered successfully"})


}else{
  res.render('resend-otp').send({success:false,message:"Invalid OTP"})
}
}

const GetLogin = async (req, res) => {
  try {
    return res.render("login");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

module.exports = {
  HomePage,
  PageNotFound,
  homePage,
  SignUp,
  Registration,
  verifyOtp,
  getOtp,
  GetLogin,
  resendOtp,
  VerifyResOtp,
};
