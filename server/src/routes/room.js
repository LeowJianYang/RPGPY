const express = require('express');
const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const e = require('express');

const roomRoutes = express.Router();

//AES Encryption Key
const Algorithm = 'aes-256-cbc';
const AES_KEY = Buffer.from(process.env.AES_KEY, 'hex'); 
const IV = Buffer.from(process.env.IV, 'hex');


//Create Room

function InsertRoom(roomCode, userId,role,MapId) {
    return new Promise((resolve, reject) => {

    // TODO: Assign a QRCODE for MAP ID
    
    db.query("INSERT INTO room (RoomId, MapId) VALUE (?, ?)", [roomCode, MapId], (error2) => {
        if (error2) {
            return reject({ success: false, message: "Database error while creating room.", roomCoded: error2.sqlState });
        }
        
        db.query("INSERT INTO roomparticipant (UserId,RoomId, Roles) VALUE (?,?, ?)", [userId,roomCode,role], (error, res) => {
            if (error) {
                return reject({ success: false, message: "Database error while adding participant.", roomCoded: error.sqlState });
            }

            return resolve({ success: true, message: "Room created successfully.", roomCoded: roomCode });
        });
                
    });



    });
}






roomRoutes.post("/createRoom", async (req,res)=>{
    const {roomCode, Owner,MapDetails} = req.body;
    
    //Encrypt Owner Username
    const cipher = crypto.createCipheriv(Algorithm, AES_KEY, IV);
    let encryptUsername = cipher.update(Owner, 'utf8', 'hex');
    encryptUsername += cipher.final('hex');

    db.query("Select UserId from userdata where Username=?", [Owner], async (error, result)=>{
        if (error){
            return res.status(500).json({success:false, message:"Database error while fetching user ID."});
        }
        if(result.length===0){
            return res.status(404).json({success:false, message:"User not found."});
        }
        const userId = result[0].UserId;
        
        try{
             const {success, message, roomCoded} = await InsertRoom(roomCode, userId,'Owner',MapDetails);
            if(success){
            return res.status(200).json({success:success, message:message, roomCode:roomCoded, encryptUsername: encryptUsername, userId:userId});
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
    
    db.query("Select UserId from userdata where Username=?", [username], async (error, result)=>{
        if (error){
            return res.status(500).json({success:false, message:"Database error while fetching user ID."});
        }

        if(result.length===0){
            return res.status(404).json({success:false, message:"User not found."});
        }
        const userId = result[0].UserId;

        db.query("Select * from room where RoomId=? AND Availability='Open'", [roomCode], async (error2, result2)=>{

            if (error2){
                return res.status(500).json({success:false, message:`Error: ${error2}`});
            }
            if(result2.length===0){
                return res.status(404).json({success:false, message:"Room not found or is closed."});
            }
            
             db.query("INSERT INTO roomparticipant (UserId,RoomId, Roles) VALUE (?,?, ?)", [userId,roomCode,'Player'], (error, result3) => {
                if (error || result3.affectedRows === 0) 
                {
                    return res.status(500).json({ success: false, message: "Database error while adding participant.", roomCoded: error.sqlState });
                }

                


                return res.status(200).json({ success: true, message: "Joined room successfully.", roomCoded: roomCode, encryptUsername: encryptUsername,userId:userId});
            });
            
            
        });
      
    });
});


roomRoutes.get('/RoomParticipant', async (req,res)=>{
    const {roomCode} = req.query;

    if(!roomCode){ 
        return res.status(400).json({success:false, message:"Room code is required."});
    }

    db.query(`Select Username,Roles from userdata UD 
              Inner join roomparticipant RP on UD.UserId= RP.UserId
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

roomRoutes.post('/ownerLeave', async (req,res)=>{
    const {roomCode} = req.body;

    console.log(`Owner leaving room: ${roomCode}, emitting 'owner-left' event BEFORE database deletion`);
    
    // Send the socket message BEFORE deleting the room
    req.io.to(roomCode).emit('owner-left',{
        roomCode,
        message:'Owner has left the room.'
    });
    
    console.log(`Event 'owner-left' emitted to room: ${roomCode}, now deleting room from database`);

    // Small delay to ensure message is sent 100MS
    setTimeout(async () => {
        db.query('Delete from room WHERE RoomId=?',[roomCode], async(error,result)=>{
            if(error){
                console.error("Error deleting room: ", error);
                return res.status(500).json({success:false, message:"Error deleting room."});
            }

            if(result.affectedRows === 0){
                return res.status(404).json({success:false, message:"Room not found."});
            }

            console.log(`Room ${roomCode} deleted from database successfully`);
        });
    }, 100); 
    
   
    return res.status(200).json({status:'ok', message:'Owner HAS LEFT THE ROOM'});
});

roomRoutes.post('/startGame', async (req,res)=>{
    const {roomCode,MapId} = req.body;
    

    req.io.to(roomCode).emit('game-started',{roomCode,MapId,
        message:'Game has started!'
    });


    db.query('Select UserId from roomparticipant where RoomId=?',[roomCode], async(error,result)=>{
        if (error){
            return res.status(500).json({success:false, message:"Database error while fetching participants."});
        }

        if (result.length === 0){
            return res.status(404).json({success:false, message:"No participants found."});
        }

        const userIds = result.map(row => row.UserId); // [1,2,3,4]

        userIds.forEach(userId => {
            db.query('Insert into progress (RoomId, Score, UserId) value (?,?,?)',[roomCode,0,userId],async (error2,result2)=>{

                if (error2){
                    return res.status(500).json({success:false, message:"Database error while inserting progress."});
                };

                if(result2.affectedRows === 0){
                    return res.status(404).json({success:false, message:"Progress not found."});
                };

               
            });
        });
        
        db.query('Update room set Availability=? where RoomId=?',['Playing', roomCode], async(error3,result3)=>{

            if (error3){
                return res.status(500).json({success:false, message:"Database error while updating room availability."});
            }

            if(result3.affectedRows === 0){
                return res.status(404).json({success:false, message:"Room not found."});
            }

            return res.status(200).json({success:true, message:"Game started and room availability updated."});
        });

    });
    
});





module.exports = roomRoutes;
