require("dotenv").config();

const express = require("express");

const cors = require("cors");

const connectToDb = require("./db/db");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

connectToDb();

app.get("/", (req, res) => {
  res.send("Hello World");
});


const route = require("./routes/index")

app.use("/",route)


module.exports = app;
