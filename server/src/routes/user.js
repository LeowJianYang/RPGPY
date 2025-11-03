const express = require('express');
const userRoutes = express.Router();
const {connection}= require("../config/db");
const path = require('path');
const fs = require('fs');

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

// Get User header
userRoutes.get('/v1/inventory/:itemType/:userId', async (req,res)=>{
    const { itemType, userId } = req.params;

    let sql;
    let params;


    if (itemType === 'nametag' || itemType === 'background') {
        sql = `
      SELECT inventory.prod_id, shop.prod_name 
      FROM inventory
      INNER JOIN shop ON inventory.prod_id = shop.prod_id
      WHERE shop.prod_cat = ? 
        AND inventory.userId = ?;
    `;
    params = [itemType, userId];

  } else {
    sql = `
      SELECT inventory.prod_id, shop.prod_name, shop.prod_cat, inventory.counts
      FROM inventory
      INNER JOIN shop ON inventory.prod_id = shop.prod_id
      WHERE shop.prod_cat NOT IN ('nametag', 'background')
        AND inventory.userId = ?;
    `;
    params = [userId];
  }

    connection.query(sql, params, async (error,result)=>{

            if(error){
                console.log(error);
                return res.status(500).json({error: "Database error", sqlState: error.sqlState});
            };
            if(result.length ===0){
                return res.status(404).json({error: "No decorations found for this user"});
            }

            return res.status(200).json(
                result.map((item) => ({
                    id: item.prod_id,
                    name: item.prod_name,
                    category: item.prod_cat,
                    quantity: item.counts
                }))
            );
        })

});

userRoutes.post('/v1/:decorationType/:headId/:userId', async (req,res)=>{
    const {decorationType, headId, userId} = req.params;

    connection.query(`Select prod_id from inventory where userId = ? and prod_id = ?`, [userId, headId], async (error,result)=>{
        if(error){
            console.log(error);
            return res.status(500).json({error: "error", sqlState: error.sqlState});
        };

        if(result.length > 0){

            connection.query(`Update userdata set ${decorationType} =? where UserId = ?`, [headId, userId], async (error, result)=>{
                if(error){
                    console.log(error);
                    return res.status(500).json({error: "error", sqlState: error.sqlState});
                }

                return res.status(200).json({message: `${decorationType} updated successfully`});
            });
        } else {

            return res.status(400).json({error: `Cannot find this ${decorationType} in inventory !`});
        }

    });
        
});

userRoutes.get('/v1/:decorationType/style/:userId', async (req,res)=>{
    const { decorationType, userId } = req.params;
    connection.query(`Select ${decorationType} from userdata where UserId = ?`, [userId], async (error,result)=>{

            if(error){
                console.log(error);
                return res.status(500).json({error: "Database error", sqlState: error.sqlState});
            };
            if(result.length ===0){
                return res.status(404).json({error: "User not found"});
            }
            const backgroundId = result[0].background;

            const fileImagePath = path.join(process.cwd(),"usercontent",`${decorationType}`, `${backgroundId}.png`);
            if (fs.existsSync(fileImagePath)) {
                res.type('image/png').sendFile(fileImagePath);
            } else {
                res.type('image/png').sendFile(path.join(process.cwd(),"usercontent",`${decorationType}`, `default.png`));
            };
    });
});

userRoutes.post('/v1/inventory/deductItems/:userId/:items', async (req,res)=>{
    const {userId, items} = req.params;
    connection.query(`Select prod_id from shop where prod_name = ?`, [items], async(error, result)=>{
        if(error){
            return res.status(500).json({error: "error", sqlState: error.sqlState});
        };
        if(result.length ===0){
            return res.status(404).json({error: "Item not found in shop"});
        };

        const prod_id = result[0].prod_id;
        connection.query(`Update inventory set counts = counts - 1 where userId = ? and prod_id = ? and counts > 0`, [userId, prod_id], async(error, result)=>{
            if(error){
                return res.status(500).json({error: "error", sqlState: error.sqlState});
            };
            if(result.affectedRows === 0){
                return res.status(404).json({error: "Item not found in inventory"});
            }
            return res.status(200).json({message: "Item deducted from inventory"});
        });
    });
});




module.exports = userRoutes;