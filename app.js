const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}
MONGO_URL()
.then(() => {console.log("connected to db")})
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) =>{
    res.send("Hi, I am root");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});