const express = require('express');
const cors = require('cors');
const db = require('../config/db');
const encrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();


//Login Authentication

router.post("/login", async (req, res)=>{

    const {username, password} = req.body;
    console.log(req.body);


    db.query("SELECT * FROM Users WHERE username=?", [username], async (err, result)=>{

        if(result.length!==0){
            console.log(result);
            const user = result[0];
            //Compare the Hashed Password
            const isMatch = await encrypt.compare(password, user.passkey);
            if(isMatch){
                
                const token = jwt.sign({username:user.username}, "secretkey", {expiresIn:

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

    const {newusername, newpassword} = req.body;

    console.log(req.body);
    //Encryption
    const salt = await encrypt.genSalt(10);
    const hashedPassword =  await encrypt.hash(newpassword, salt);


    db.query("INSERT INTO Users (username, passkey) VALUES (?,?)",[newusername, hashedPassword], (err,result)=>{

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


module.exports = router;
