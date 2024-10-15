const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const passport = require('passport')

require('dotenv').config();

require('./config/passport');

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes")

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,  
  resave: false,              
  saveUninitialized: true,    
  cookie: { 
    maxAge: 60000*60000,
    httpOnly: true,         
    cookie: { secure: false } 
  }

}));

app.use((req,res,next)=>{
  res.set('cache-control','no-store')
  next();    
})

// /connect to mongodb//
mongoose
  .connect("mongodb://127.0.0.1:27017/ClutchShoe", {})

  .then(() => console.log("MongoDB Connected...."))
  .catch((err) => console.error("MongoDB connection error:", err));

// // public connecting
app.set("view engine", "ejs");

app.set("views", [
  path.join(__dirname, "views/user"),
    path.join(__dirname, "views/admin"),
  ]);

app.use(express.static(path.join(__dirname, "public/public")));

app.use("/", userRoutes);
app.use('/admin',adminRoutes)


//passport middleware //

app.use(passport.initialize())
app.use(passport.session())

// server running

app.listen(process.env.PORT, () => {
  console.log(`Server running `);
});

module.exports = app;
