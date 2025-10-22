// routes/achievements.js

const express = require('express');
const achievements = express.Router();
const {connection: db} = require('../config/db');

// Get All Achievements

achievements.get('/all', async( req,res)=>{
    db.query("Select * from acheivement", (error, results)=>{

        if(error){
            return res.status(500).json({message: "Database error while fetching achievements."});
        }
        if(!results || results.length ===0){
            return res.status(404).json({message: "No achievements found."});
        }
        res.status(200).json({details: results});
    });
});

// Get User Achievements

achievements.get('/user', (req, res) => {
    const { uid } = req.query;

    if (!uid) {
        return res.status(400).json({ message: "User ID is required." });
    }

    db.query(
        `SELECT A.achievement_id, A.achievement_name, A.achievement_details, A.achievement_conditions,
                CASE WHEN UA.achievement_id IS NULL THEN false ELSE true END AS earned
         FROM acheivement A
         LEFT JOIN user_acheive UA 
            ON A.achievement_id = UA.achievement_id 
           AND UA.UserId = ?`,
        [uid],
        (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Database error while fetching achievements." });
            }

            const achievements = results.map(row => ({
                id: row.achievement_id,
                name: row.achievement_name,
                details: row.achievement_details,
                conditions: row.achievement_conditions,
                earned: !!row.earned
            }));

            res.status(200).json({ userId: uid, achievements });
        }
    );
});

achievements.post('/check', async(req, res) => {
    const { userId, condition } = req.body;

    if(!userId || !condition){
        return res.status(400).json({message:"UserId and condition are required."});
    }

    db.query(`Select * from acheivement where achievement_conditions = ?`, [condition], (error,results)=>{
        if(error){
            return res.status(500).json({message:"Database error while checking achievement.", sqlState: error.sqlState});
        }
        if(results.length ===0){
            return res.status(404).json({message:"No achievement found for the given condition.", sqlState: error.sqlState});
        }
        const achievementId= results[0];

        db.query(`Select * from user_acheive where UserId = ? and achievement_id = ?`, [userId, achievementId.achievement_id], (error,results2)=>{
            if(error){
                return res.status(500).json({message:"Database error while checking user achievement.", sqlState: error.sqlState});
            }
            // res.status(200).json({message:"Achievement check successful.", achievementId});

            db.query(`Insert into user_acheive (UserId, achievement_id) values (?, ?)`, [userId, achievementId.achievement_id], (error,results3)=>{
                if(error){
                    return res.status(500).json({message:"Database error while awarding achievement.", sqlState: error.sqlState});
                }
                
                return res.status(200).json({success:true,message:"Achievement awarded successfully.", achievementName: achievementId.achievement_name});
            });
        });
    });

});


module.exports = achievements;