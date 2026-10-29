const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URI;
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const OWNER_ID = "6ae1ed96a8cfde84e322ad8f";

const categoryByTitle = {
  "Cozy Beachfront Cottage": "Trending",
  "Modern Loft in Downtown": "Iconic Cities",
  "Mountain Retreat": "Mountains",
  "Historic Villa in Tuscany": "Farms",
  "Secluded Treehouse Getaway": "Camping",
  "Beachfront Paradise": "Amazing Pools",
  "Rustic Cabin by the Lake": "Camping",
  "Luxury Penthouse with City Views": "Iconic Cities",
  "Ski-In/Ski-Out Chalet": "Arctic",
  "Safari Lodge in the Serengeti": "Camping",
  "Historic Canal House": "Iconic Cities",
  "Private Island Retreat": "Trending",
  "Charming Cottage in the Cotswolds": "Rooms",
  "Historic Brownstone in Boston": "Iconic Cities",
  "Beachfront Bungalow in Bali": "Amazing Pools",
  "Mountain View Cabin in Banff": "Mountains",
  "Art Deco Apartment in Miami": "Rooms",
  "Tropical Villa in Phuket": "Amazing Pools",
  "Historic Castle in Scotland": "Castles",
  "Desert Oasis in Dubai": "Amazing Pools",
  "Rustic Log Cabin in Montana": "Mountains",
  "Beachfront Villa in Greece": "Trending",
  "Eco-Friendly Treehouse Retreat": "Camping",
  "Historic Cottage in Charleston": "Rooms",
  "Modern Apartment in Tokyo": "Iconic Cities",
  "Lakefront Cabin in New Hampshire": "Mountains",
  "Luxury Villa in the Maldives": "Trending",
  "Ski Chalet in Aspen": "Arctic",
  "Secluded Beach House in Costa Rica": "Trending",
};

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to db");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const listings = [];
  for (const obj of initData.data) {
    // location aur country same ho to dobara mat jodo
    const query =
      obj.location === obj.country
        ? obj.location
        : `${obj.location}, ${obj.country}`;

    const response = await geocoder.forwardGeocode({ query, limit: 1 }).send();
    const feature = response.body.features[0];

    if (!feature) {
      console.log(`SKIPPED (no geocode result): ${obj.title} -> "${query}"`);
      continue;
    }

    if (!feature.place_name.includes(obj.country)) {
      console.log(`CHECK: ${obj.title} -> "${query}" gave "${feature.place_name}"`);
    }

    const category = categoryByTitle[obj.title];
    if (!category) {
      console.log(`NO CATEGORY: ${obj.title}`);
    }

    listings.push({
      ...obj,
      category,
      owner: OWNER_ID,
      geometry: feature.geometry,
    });
    console.log(`OK: ${obj.title} -> ${feature.geometry.coordinates}`);
    await sleep(300);
  }

  await Listing.insertMany(listings);
  console.log(`data was initialized: ${listings.length} listings`);
};

main()
  .then(initDB)
  .catch((err) => console.log(err))
  .finally(() => mongoose.connection.close());