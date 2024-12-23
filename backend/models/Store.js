const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
    street : {
        type: String,
        require :true,
    },
    city : {
        type: String,
        require :true,
    },
    state : {
        type: String,
        require :true,
    },
    zipCode : {
        type: String,
        require :true,
    },
});

module.exports = mongoose.model("Store",storeSchema);