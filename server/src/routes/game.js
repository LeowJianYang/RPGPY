//routes/game.js

const express = require('express');
const gameRoutes = express.Router();
const { roomState,shuffle } = require('../config/roomState');
const db = require('../config/db');
const { error } = require('console');


gameRoutes.post('/turn', async (req,res)=>{


    const {roomCode} =req.body;
    if(!roomState[roomCode]){
        return res.status(404).json({error: "Room not found"});
    };

    roomState[roomCode].turnOrder = shuffle([...roomState[roomCode].players]);
    roomState[roomCode].turn = 0;
    roomState[roomCode].penalty = 'None';
    roomState[roomCode].round = 1; // Track rounds for reshuffling

    req.io.to(roomCode).emit('turn-order',{
        players: roomState[roomCode].players,
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
        turnOrder: room.turnOrder,
        currentTurn: room.turn,
        currentPlayer: currentPlayer,
        round: room.round,
        playersName: room.playersName
    });
    
    return res.status(200).json({
        message: "Turn advanced",
        currentTurn: room.turn,
        currentPlayer: currentPlayer,
        round: room.round,
        reshuffled: room.round === 1 && room.turn === 0
    });
});

gameRoutes.post('/complete-map', async (req,res)=>{
    //Winner Stats
    const {mapId,userId,score,roomCode,username} = req.body;
    
    if(!mapId || !userId || !roomCode){
        return res.status(400).json({error: "Missing parameters"});
    }

    db.query("Update room set Availability = 'Closed' where RoomId =?",[roomCode],async (error,results)=>{

        if(error){
            console.log(error);
            return res.status(500).json({error: "Database error",sqlState: error.sqlState});
        };



        db.query("Update progress set Prog_status= 'victory', Score = ? where UserId =? ",[score,userId], async(error2,results2)=>{
            if(error2){
                console.log(error2);
                return res.status(500).json({error: "Database error"});
            };

            db.query(`Select u.username, p.Score from progress p
                Inner join roomparticipant rp on p.UserId = rp.UserId
                AND p.RoomId = rp.RoomId
                Inner Join userdata u on rp.UserId = u.UserId
                Inner Join room r on rp.RoomId = r.RoomId
                where r.RoomId =? order by p.Score desc`,[roomCode], async(error,results3)=>{
                    if(error){
                        console.log(error);
                        return res.status(500).json({error: "Database error"});
                    };
                    console.log("RESULTS3", JSON.stringify(results3));
                    req.io.to(roomCode).emit('game-over',{results3, winner: username})
                    return res.status(200).json({message: "Map completed", results: results3});
                }
                )

        })
    })

})

gameRoutes.get('/leaderboard', async (req,res)=>{

    const {uid} = req.query;
    console.log("Leaderboard request for uid:", Number(uid));

    db.query(`Select p.RoomId, p.Score, p.UserId, p.prog_status, u.Username
        from progress p
        JOIN userdata u on p.UserId= u.UserId
        JOIN (
             Select DISTINCT RoomId
             from progress
             where UserId = ?
        ) r on p.RoomId = r.RoomId
         order by p.RoomId, p.Score DESC
             `, [uid], async (error, results)=>{

                if (error){
                    console.log(error);
                    return res.status(500).json({error: " error fetching data", sqlState: error.sqlState});
                }
                if (results.length === 0){
                    return res.status(404).json({error: "No data found"});
                }

                const grpData= results.reduce((acc,row)=>{
                    if(!acc[row.RoomId]){
                        acc[row.RoomId] = [];
                    }
                    acc[row.RoomId].push({
                        uid: row.UserId,
                        username: row.Username,
                        score: row.Score,
                        status: row.prog_status
                    });

                    return acc;
                },{});

                return res.status(200).json({queryLeaderboard: grpData});
             });
});

module.exports = gameRoutes;
