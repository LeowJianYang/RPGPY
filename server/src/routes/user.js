const express = require('express');
const userRoutes = express.Router();
const {connection}= require("../config/db");

// Fetch user coins
userRoutes.get('/v1/coins/:userId', async (req,res)=>{
    const { userId } = req.params;

    connection.query("Select Coin from userdata where UserId =?", [userId], async (error,result)=>{
        if(error){
            console.log(error);
            return res.status(500).json({error: "Database error", sqlState: error.sqlState});
        };
        if(result.length ===0){
            return res.status(404).json({error: "User not found"});
        };
        res.status(200).json({Coin: result[0].Coin});
    });
});

module.exports = userRoutes;