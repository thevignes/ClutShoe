const express = require("express");

const app = express();

const mongoose = require("mongoose");

const path = require("path");

const env = require ('dotenv').config();

const db = require ('./config/db')
db()
app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// public connecting
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {

  res.send("hello this from server side");
});
// server running

app.listen(process.env.PORT , () => {

  console.log(`Server running `);
});

module.exports = app;