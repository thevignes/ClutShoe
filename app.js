const express = require("express");

const app = express();

const mongoose = require("mongoose");

const path = require("path");

const env = require ('dotenv').config();

const db = require ('./config/db')
db()

const userRoutes = require ('./routes/userRoutes')
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// public connecting
app.set("view engine", "ejs");

app.set("views",[path.join(__dirname,'views/user'),path.join(__dirname,'views/admin')]);

app.use(express.static(path.join(__dirname, "public/public")));

app.use('/',userRoutes)


// server running

app.listen(process.env.PORT , () => {

  console.log(`Server running `);
});

module.exports = app;