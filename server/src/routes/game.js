//routes/game.js

const express = require('express');
const gameRoutes = express.Router();
const { roomState,shuffle } = require('../config/roomState');


gameRoutes.post('/turn', async (req,res)=>{


    const {roomCode,user} =req.body;
    if(!roomState[roomCode]){
        return res.status(404).json({error: "Room not found"});
    };

    roomState[roomCode].turnOrder = shuffle([...roomState[roomCode].players]);
    roomState[roomCode].turn = 0;
    roomState[roomCode].penalty = 'None';
    roomState[roomCode].playersName = user;
    roomState[roomCode].round = 1; // Track rounds for reshuffling

    req.io.to(roomCode).emit('turn-order',{
        players: roomState[roomCode].players,
        playersName: roomState[roomCode].playersName,
        turnOrder: roomState[roomCode].turnOrder,
        currentTurn: roomState[roomCode].turn,
        currentPlayer: roomState[roomCode].turnOrder[0],
        round: roomState[roomCode].round
    })

    return res.status(200).json({message: "Turn order initialized", turnOrder: roomState[roomCode].turnOrder});
});

//next turn
gameRoutes.post('/next-turn', async (req, res) => {
    const { roomCode } = req.body;
    
    if (!roomState[roomCode]) {
        return res.status(404).json({ error: "Room not found" });
    }

    const room = roomState[roomCode];
    
    // next player on the room
    room.turn = (room.turn + 1) % room.turnOrder.length;
    
    // fallback to first player - round finished
    if (room.turn === 0) {
        room.round = (room.round || 1) + 1;
        
        // Three times reshuffle again
        if (room.round >= 3) {
            room.turnOrder = shuffle([...room.players]);
            room.round = 1; // Reset round count
            console.log(`Room ${roomCode}: Reshuffled turn order after 3 rounds`);
        }
    }
    
    const currentPlayer = room.turnOrder[room.turn];
    
    // Broadcast the info 
    req.io.to(roomCode).emit('turn-order', {
        players: room.players,
        playersName: room.playersName,
        turnOrder: room.turnOrder,
        currentTurn: room.turn,
        currentPlayer: currentPlayer,
        round: room.round
    });
    
    return res.status(200).json({
        message: "Turn advanced",
        currentTurn: room.turn,
        currentPlayer: currentPlayer,
        playersName: room.playersName,
        round: room.round,
        reshuffled: room.round === 1 && room.turn === 0
    });
});


module.exports = gameRoutes;
