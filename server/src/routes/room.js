const express = require('express');
const db = require('../config/db');
const roomRoutes = express.Router();
const crypto = require('crypto');
const bycrypt = require('bcryptjs');

//AES Encryption Key
const Algorithm = 'aes-256-cbc';
const AES_KEY = Buffer.from(process.env.AES_KEY, 'hex'); 
const IV = Buffer.from(process.env.IV, 'hex');


//Create Room

function InsertRoom(roomCode, userId,role) {
    return new Promise((resolve, reject) => {

            // TODO: Assign a QRCODE for MAP ID
    
    db.query("INSERT INTO Room (RoomId, MapId) VALUE (?, ?)", [roomCode, 'Map001'], (error2) => {
        if (error2) {
            return reject({ success: false, message: "Database error while creating room.", roomCoded: error2.sqlState });
        }
        
        db.query("INSERT INTO RoomParticipant (UserId,RoomId, Roles) VALUE (?,?, ?)", [userId,roomCode,role], (error, res) => {
            if (error) {
                return reject({ success: false, message: "Database error while adding participant.", roomCoded: error.sqlState });
            }

            return resolve({ success: true, message: "Room created successfully.", roomCoded: roomCode });
        });
                
    });



    });
}






roomRoutes.post("/createRoom", async (req,res)=>{
    const {roomCode, Owner} = req.body;
    
    //Encrypt Owner Username
    const cipher = crypto.createCipheriv(Algorithm, AES_KEY, IV);
    let encryptUsername = cipher.update(Owner, 'utf8', 'hex');
    encryptUsername += cipher.final('hex');

    db.query("Select UserId from UserData where Username=?", [Owner], async (error, result)=>{
        if (error){
            return res.status(500).json({success:false, message:"Database error while fetching user ID."});
        }
        if(result.length===0){
            return res.status(404).json({success:false, message:"User not found."});
        }
        const userId = result[0].UserId;
        
        try{
             const {success, message, roomCoded} = await InsertRoom(roomCode, userId,'Owner');
            if(success){
            return res.status(200).json({success:success, message:message, roomCode:roomCoded, encryptUsername: encryptUsername});
                } 
        } catch (err){
            return res.status(500).json(err, {success:false, message:"Error creating room.", roomCoded: err.roomCoded});
        }
      

    })



    
})



roomRoutes.post("/joinRoom", async (req,res)=>{

    const {roomCode, username} = req.body;
        const cipher = crypto.createCipheriv(Algorithm, AES_KEY, IV);
        let encryptUsername = cipher.update(username, 'utf8', 'hex');
        encryptUsername += cipher.final('hex');
    
    db.query("Select UserId from UserData where Username=?", [username], async (error, result)=>{
        if (error){
            return res.status(500).json({success:false, message:"Database error while fetching user ID."});
        }

        if(result.length===0){
            return res.status(404).json({success:false, message:"User not found."});
        }
        const userId = result[0].UserId;

        db.query("Select * from Room where RoomId=? AND Availability='Open'", [roomCode], async (error2, result2)=>{

            if (error2){
                return res.status(500).json({success:false, message:`Error: ${error2}`});
            }
            if(result2.length===0){
                return res.status(404).json({success:false, message:"Room not found or is closed."});
            }
            
             db.query("INSERT INTO RoomParticipant (UserId,RoomId, Roles) VALUE (?,?, ?)", [userId,roomCode,'Player'], (error, result3) => {
                if (error || result3.affectedRows === 0) 
                {
                    return res.status(500).json({ success: false, message: "Database error while adding participant.", roomCoded: error.sqlState });
                }
                return res.status(200).json({ success: true, message: "Joined room successfully.", roomCoded: roomCode, encryptUsername: encryptUsername});
            });
            
            
        });
      
    });
});


roomRoutes.get('/RoomParticipant', async (req,res)=>{
    const {roomCode} = req.query;

    if(!roomCode){ 
        return res.status(400).json({success:false, message:"Room code is required."});
    }

    db.query(`Select Username,Roles from UserData UD 
              Inner join RoomParticipant RP on UD.UserId= RP.UserId
              Where RP.RoomId=?`, [roomCode], async (error,result)=>{

                if(error){
                    return res.status(500).json({success:false, message:`Error: ${error}`});
                }

                if (result.length===0){
                    return res.status(404).json({success:false, message:"Room not found."})
                }
                
                return res.status(200).json({success:true, participants:result});
    });

})


module.exports = roomRoutes;
