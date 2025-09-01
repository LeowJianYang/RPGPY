// app.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables first!

const express = require('express');
const cors = require('cors');
const parser = require('cookie-parser');
const authMiddleWare = require('./middleware/authToken');

const { Server } = require('socket.io');
const http = require('http');
const authRoutes = require("./routes/auth");
const mapRoutes = require("./routes/mapVer");
const roomRoutes = require("./routes/room");




const app= express();
app.use(express.json());
app.use(parser());
const server= http.createServer(app);



const allowedOrigin = process.env.WEB_URL;  

const io = new Server(server,{
    cors:{origin:allowedOrigin,credentials:true}
})

app.use((req,res,next)=>{
    req.io= io;  
    next();
})



const corsOptions={
    origin:allowedOrigin,
    credentials:true,
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization", "Cookie"],
}


app.use(cors({
    origin:allowedOrigin,
    credentials:true,
    methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization", "Cookie"],
}))

app.use("/auth", authRoutes);
app.use("/map", mapRoutes);
app.use("/room", roomRoutes);

io.on('connection', (socket)=>{
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('join-room',(roomCode)=>{
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room: ${roomCode}`);
        
        // Send confirmation back to client
        socket.emit('room-joined', { roomCode, socketId: socket.id });
    })
    
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });



})


app.get("/authCookie", authMiddleWare, (req, res)=>{
    res.json({user: req.user.Email, Username: req.user.Username});
})


server.listen(3000, ()=>{
    console.log("Server running on port 3000, http://localhost:3000");
    console.log("Socket.IO server is ready for connections");
});

module.exports = { io, app, server };

