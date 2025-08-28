// app.js

const express = require('express');
const cors = require('cors');
const parser = require('cookie-parser');
const authMiddleWare = require("./middleware/authToken");



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

app.use("/auth", authRoutes);
app.use("/map", mapRoutes);


app.get("/authCookie", authMiddleWare, (req, res)=>{
    res.json({user: req.user.username});
})


app.listen(3000, ()=>{
    console.log("Server running on port 3000, http://localhost:3000");
});

