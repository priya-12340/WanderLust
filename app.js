const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");

const MONGO_URL = async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}
MONGO_URL()
.then(() => {console.log("connected to db")})
.catch(err => console.log(err));

app.get("/", (req, res) =>{
    res.send("Hi, I am root");
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});