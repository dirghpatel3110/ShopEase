const express = require('express');
const Store = require("../models/Store");

const router = express.Router();

router.post("/store", async(req,res)=>{
    try{
        const store  = req.body.stores;

        const savedStore = await Store.insertMany(store);

        res.status(201).json({message:'Store saved Successfully' , savedStore});   
    }catch(error){
        console.log("error adding store", error);
        res.status(500).json({message:"Internal server error", error});
    }
});

router.get("/store", async (req,res) => {

    try {
        const stores = await Store.find();
        res.status(200).json(stores);
    } catch (error) {
        console.log("error fetching Store", error);
        res.status(500).json({message : 'Inter sever error', error});
    }
});

module.exports = router;