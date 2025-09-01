const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const mapRouter = express.Router();


// 读取地图
mapRouter.get('/:mapid', (req, res) => {
  const file = path.join(__dirname, '../maps', `${req.params.mapid}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ message: 'Map not found' });
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  res.json(json);
});


//const progress = new Map(); // key: userId(or session), val: { mapId, position }
mapRouter.post('/progress-update', (req, res) => {
  const { userId , mapId, score } = req.body;

  db.query('UPDATE progress SET Score=? WHERE UserId=?', [score, userId], async(error,result)=>{

    if(error){
      return res.status(500).json({message:"Database error while updating progress."});
    };

    if(result.affectedRows === 0){
      return res.status(404).json({message:"No-rows Change Made"});
    };

    return res.status(200).json({message:"Progress updated successfully."});
  })

  // progress.set(userid, { mapId: mapid, score, updatedAt: Date.now() });
  // res.json({ ok: true });
});



module.exports = mapRouter;