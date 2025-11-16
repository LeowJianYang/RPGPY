const express = require('express');
const utilsRoute=   express.Router();
const path = require('path');

utilsRoute.get("/v1/download/:utils", (req,res)=>{
  const { utils } = req.params;
  res.sendFile(path.join(__dirname,'../utils',`${utils}.pdf`));
})

module.exports= utilsRoute;