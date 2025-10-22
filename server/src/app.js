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
const gameRoutes = require("./routes/game");
const achievements = require("./routes/achievements");
const shopRoutes = require("./routes/shop");
const userRoutes = require("./routes/user");
const { roomState } = require('./config/roomState');



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
app.use('/game', gameRoutes);
app.use('/achievements', achievements);
app.use('/shop', authMiddleWare ,shopRoutes);
app.use('/user', authMiddleWare, userRoutes);

io.on('connection', (socket)=>{
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on('join-room',(data)=>{
        // // Handle both old format (just roomCode string) and new format ({roomCode, user})
        // const { roomCode, user } = typeof data === 'string' 
        //     ? { roomCode: data, user: 'Anonymous' } 
        //     : { roomCode: data.roomCode, user: data.user || 'Anonymous' };
        const { roomCode, user } = data;
        console.log("JOIN ROOM DATA:", JSON.stringify({roomCode, user}));
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room: ${roomCode}`);

        if(!roomState[roomCode]){
            roomState[roomCode]={
                players:[],
                turnOrder: [],
                playersName:[],
                turn:0,
                round:1,
                penalty:'None'
            }
        }


        if (!roomState[roomCode].players.includes(socket.id)) {
            roomState[roomCode].players.push(socket.id);
            roomState[roomCode].playersName.push(user); 

            // update turnOrder
            const { shuffle } = require('./config/roomState');
            roomState[roomCode].turnOrder = shuffle([...roomState[roomCode].players]);

            console.log("Room state after join:", JSON.stringify(roomState, null, 2));
            
            // Broadcast the updated turn
            io.to(roomCode).emit('turn-order', {
                players: roomState[roomCode].players,
                turnOrder: roomState[roomCode].turnOrder,
                currentTurn: roomState[roomCode].turn,
                currentPlayer: roomState[roomCode].turnOrder[roomState[roomCode].turn],
                round: roomState[roomCode].round,
                playersName: roomState[roomCode].playersName
            });
        }
        
        // Send confirmation back to client
        socket.emit('room-joined', { roomCode, socketId: socket.id });
    })
    
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        
        // Delete player from all rooms
        for (const roomCode in roomState) {
            const room = roomState[roomCode];
            const playerIndex = room.players.indexOf(socket.id);
            
            if (playerIndex !== -1) {
                // remove from list
                room.players.splice(playerIndex, 1);
                room.playersName.splice(playerIndex, 1);

                if (room.players.length > 0) {
                    const { shuffle } = require('./config/roomState');
                    room.turnOrder = shuffle([...room.players]);
                    
                    // adjust round 
                    if (room.turn >= room.turnOrder.length) {
                        room.turn = 0;
                    }
                    
                    // Broadcast updated info
                    io.to(roomCode).emit('turn-order', {
                        players: room.players,
                        turnOrder: room.turnOrder,
                        currentTurn: room.turn,
                        currentPlayer: room.turnOrder[room.turn],
                        round: room.round,
                        playersName: room.playersName
                    });
                } else {
                    console.log(`Room ${roomCode} is empty, deleting room`);
                    delete roomState[roomCode];
                }
                
                console.log(`Player ${socket.id} removed from room ${roomCode}`);
                break;
            }
        }
    });



})


app.get("/authCookie", authMiddleWare, (req, res)=>{
    res.json({email: req.user.Email, Username: req.user.Username, uid: req.user.UID});
});




server.listen(3000, ()=>{
    console.log("Server running on port 3000, http://localhost:3000");
    console.log("Socket.IO server is ready for connections");
});

module.exports = { io, app, server };

