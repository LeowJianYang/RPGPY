//routes/auth.js
const express = require('express');
const {connection:db} = require('../config/db');
const encrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const {IdecryptUsername} = require('../utils/dec');

const router = express.Router();
//AES Encryption Key
const Algorithm = 'aes-256-cbc';
const AES_KEY = Buffer.from(process.env.AES_KEY, 'hex'); 
const IV = Buffer.from(process.env.IV, 'hex');

//Login Authentication

router.post("/login", async (req, res)=>{

    const {email, password} = req.body;
    console.log(req.body);


    db.query("SELECT * FROM userdata WHERE Email=?", [email], async (err, result)=>{

        if(err){
             console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error-E01" });
        }

        if(!result || result.length===0){
            return res.status(401).json({ success: false, message: "Invalid Password or Username !" });
        }

            try{
            //console.log(result);
            const user = result[0];
            //Compare the Hashed Password
            const isMatch = await encrypt.compare(password, user.Passwords);
            if(isMatch){
                
                const token = jwt.sign({Email:user.Email, Username:user.Username, UID: user.UserId}, "secretkey", {expiresIn:

                    req.body.remember ? "7h" : "1h"
                });

                res.cookie("jwtAuthToken", token, {
                    httpOnly:true, 
                    maxAge: 36000000, 
                    secure:true,
                    sameSite:'none' //none for deploy~
                });
                return res.status(200).json({success:true, message:"Successfully Login !"})




            } else{
                return res.status(401).json({success:false, message:"Invalid Password or Username !"})
            }
        } catch(err){
            return res.status(500).json({ success: false, message: "Internal Server Error-E02" });
        }
    


    })

   

    

    
});

router.get('/checkSession', async (req,res)=>{
    
    const {ssid,userid,roomId} = req.query;
    console.log("[DEBUG]",ssid,"\n",userid,"\n",roomId);


    db.query("Select * from roomparticipant where userId = ? AND ssid = ? AND roomId=?", [userid, ssid, roomId], async (err,result)=>{
        if(err){
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Internal Server Error", sqlState: err.sqlState });
        }

        if(!result || result.length===0){
            return res.status(401).json({ success: false, message: "Invalid session"});
        }

        return res.status(200).json({ success: true, message: "Session valid" });
    })
});



router.post('/register', async (req, res)=>{

    const {newemail, newusername, newpassword} = req.body;

    console.log(req.body);
    //Encryption
    const salt = await encrypt.genSalt(10);
    const hashedPassword =  await encrypt.hash(newpassword, salt);


    db.query("INSERT INTO userdata (Email,Username, Passwords) VALUES (?,?,?)",[newemail,newusername, hashedPassword], (err,result)=>{

        if(err){
            console.error("Error executing query: ", err);
            return res.status(500).json({err: "Internal server error"});
        } 
        
        if(result.affectedRows!==0)
        {
            return res.status(200).json({success: true, message: "Registration successful"})
        } else{
            return res.status(400).json({success:false, message:"Failed to register !"})
        }



    })
})


router.post("/logout", async (req,res)=>{
    res.clearCookie("jwtAuthToken",{
        httpOnly:true,
        secure:true,
        sameSite:'none'
    })

    return res.status(200).json({success:true, message:"Successfully Logged Out !"})
})



router.post("/validateRoom", async (req,res)=>{

    const {roomCode,participant,Owner} = req.body; //Owner = username

    if (Owner !=="NONE_AVAILABLE".trim()){

        const decryptUsername = IdecryptUsername(Owner);
        

        db.query(`Select RP.*, UD.* 
            from roomparticipant RP
            Inner Join userdata UD on RP.UserId = UD.UserId
            Where RP.RoomId =? AND RP.Roles='Owner' AND UD.Username=?`,[roomCode,decryptUsername], async (error,result)=>{
            if(error){
                return res.status(500).json({success:false, message:"Database error while validating room.", roomCoded: error.sqlState });
            }

            if(result.length===0){
                return res.status(404).json({success:false, message:"Room not found or you are not the owner."});
            }

            return res.status(200).json({success:true, message:"Room validated successfully.", roomCoded: roomCode, owner:decryptUsername});
        })
    } else if (participant !=="NONE_AVAILABLE".trim()){

        db.query('Select Roles from roomparticipant where RoomId=? And Roles=?',[roomCode,'Player'] ,async(error,result)=>{

            if(error || result.length===0){
                return res.status(404).json({success:false,message:"Validate Failed"});
            }
            
            if(result.length>=3){
                return res.status(400).json({success:false, message:"Room is full."});
            }
            return res.status(200).json({success:true, message:"Room validated successfully.", roomCoded: roomCode});
        })
    }
    



});


router.post ('/authMap', async(req,res)=>{
    const {mapDet} = req.query;
    if (!mapDet){
        return res.status(400).json({success:false, message:"Map details are required."});
    }

    const decryptedMap= IdecryptUsername(mapDet);

    db.query('Select * from map where MapId = ?', [decryptedMap], (err,result)=>{
        if(err){
            return res.status(500).json({success:false, message:"Map Error !"});
        }

        if(result.length === 0){
            return res.status(404).json({success:false, message:"Map not found."});
        }

        return res.status(200).json({success:true, message:"Authenticated", SelectedMap:result})

    })
})



module.exports = router;
