const express = require('express');
const cors = require('cors');
const db = require('../config/db');
const encrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Algorithm = 'aes-256-cbc';
const crypto = require('crypto');

const AES_KEY = Buffer.from(process.env.AES_KEY, 'hex'); 
const IV = Buffer.from(process.env.IV, 'hex');

//Login Authentication

router.post("/login", async (req, res)=>{

    const {email, password} = req.body;
    console.log(req.body);


    db.query("SELECT * FROM UserData WHERE Email=?", [email], async (err, result)=>{

        if(result.length!==0){
            //console.log(result);
            const user = result[0];
            //Compare the Hashed Password
            const isMatch = await encrypt.compare(password, user.Passwords);
            if(isMatch){
                
                const token = jwt.sign({Email:user.Email, Username:user.Username}, "secretkey", {expiresIn:

                    req.body.remember ? "7h" : "1h"
                });

                res.cookie("jwtAuthToken", token, {httpOnly:true, maxAge: 3600000, secure:false});
                return res.status(200).json({success:true, message:"Successfully Login !"})




            } else{
                return res.status(401).json({success:false, message:"Invalid Password or Username !"})
            }
        }else{
            return res.status(401).json({success:false,message:"Invalid Password or Username !"});
        }


    })

   

    

    
})



router.post('/register', async (req, res)=>{

    const {newemail, newusername, newpassword} = req.body;

    console.log(req.body);
    //Encryption
    const salt = await encrypt.genSalt(10);
    const hashedPassword =  await encrypt.hash(newpassword, salt);


    db.query("INSERT INTO UserData (Email,Username, Passwords) VALUES (?,?,?)",[newemail,newusername, hashedPassword], (err,result)=>{

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
        secure:false
    })

    return res.status(200).json({success:true, message:"Successfully Logged Out !"})
})

function IdecryptUsername(encryptedUsername){
    const decipher = crypto.createDecipheriv(Algorithm, AES_KEY, IV);
    let decrypted = decipher.update(encryptedUsername, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}



router.post("/validateRoom", async (req,res)=>{

    const {roomCode,participant,Owner} = req.body; //Owner = username

    if (Owner !=="NONE_AVAILABLE".trim()){

        const decryptUsername = IdecryptUsername(Owner);
        

        db.query(`Select RP.*, UD.* 
            from RoomParticipant RP
            Inner Join UserData UD on RP.UserId = UD.UserId
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

        db.query('Select Roles from RoomParticipant where RoomId=? And Roles="Player"',[roomCode] ,async(error,result)=>{

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

module.exports = router;
