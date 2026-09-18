const mongoose = require("mongoose");
const initData=require("./data.js");
const Listing =require("../models/listing.js");


const MONGO_URL="mongodb://127.0.0.1:27017/luxnest";
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}
const initDB = async()=>{
    await Listing.deleteMany({});
   const mongoose = require("mongoose");
   initData.data= initData.data.map((obj)=>({...obj,owner:"68f39a6edb71987082c2e1b1"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized")
};

initDB();