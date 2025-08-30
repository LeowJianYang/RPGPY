// app.js

const express = require('express');
const cors = require('cors');
const parser = require('cookie-parser');
const authMiddleWare = require("./middleware/authToken");
const dotenv = require('dotenv');
dotenv.config();




const app= express();
app.use(express.json());
app.use(parser());


const allowedOrigin = "http://localhost:5173";  

const corsOptions={
    origin:allowedOrigin,
    credentials:true,
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type"],
}


app.use(cors({
    origin:allowedOrigin,
    credentials:true,
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type"],
}))






const authRoutes= require("./routes/auth");
const mapRoutes = require("./routes/mapVer");
const roomRoutes = require("./routes/room");

app.use("/auth", authRoutes);
app.use("/map", mapRoutes);
app.use("/join", roomRoutes);


app.get("/authCookie", authMiddleWare, (req, res)=>{
    res.json({user: req.user.Email, Username: req.user.Username});
})


app.listen(3000, ()=>{
    console.log("Server running on port 3000, http://localhost:3000");
});

