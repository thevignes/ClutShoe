const express = require("express");

const app = express();

const dotenv = require("dotenv");
const path = require("path");
const mongoose = require('mongoose')
// const env = require ('dotenv').config();

dotenv.config();






const userRoutes = require ('./routes/userRoutes')
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// /connect to mongodb//
mongoose.connect('mongodb://127.0.0.1:27017/ClutchShoe', {
})


.then(() => console.log('MongoDB Connected....'))
.catch(err => console.error('MongoDB connection error:', err));

// // public connecting
app.set("view engine", "ejs");

app.set("views",[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')]);

app.use(express.static(path.join(__dirname, "public/public")));

app.use('/',userRoutes)


// server running

app.listen(process.env.PORT , () => {

  console.log(`Server running `);
});

module.exports = app;