require("dotenv").config({path: "../.env"});
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URI;

main()
.then(() => {
    console.log("connected to db");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj) => ({
        ...obj, 
        owner: "6ae1ed96a8cfde84e322ad8f"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();
