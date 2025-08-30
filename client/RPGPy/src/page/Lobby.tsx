
import { useEffect, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import "../css/Lobby.css"



export default function Lobby(){
    const [searchParams] = useSearchParams();
    const roomCode = searchParams.get("roomCode");
    const Owner = searchParams.get("Owner") ?? "NONE_AVAILABLE";
    const participant = searchParams.get("participant") ?? "NONE_AVAILABLE";
    const [isError, setIsError] = useState<boolean>(false)
    const [RoomParticipants, setRoomParticipants] = useState<{Username:string, Roles:string}[]>([]);
    const [CurrentUser, setCurrentUser] = useState("");



    useEffect(()=>{
       
        axios.post("https://rpgpyapi.onrender.com/auth/validateRoom", {roomCode, Owner, participant}, {withCredentials:true}).then((res)=>{
            console.log("Room validated: ", res.data);
            setCurrentUser(res.data.owner);
            setIsError(false);
            handleRefList();
        }).catch((err)=>{
            console.error("Error validating room: ", err, "\n", err.response?.data?.message);
            setIsError(true);
        })
    },[])    


    const handleRefList= async ()=>{
           
        await axios.get(`http://localhost:3000/join/RoomParticipant?roomCode=${roomCode}` ,{withCredentials:true}).then((res)=>{
           const {participants}= res.data
           setRoomParticipants(participants);

        }).catch((err)=>{
            console.error("Error getting room participants: ", err, "\n", err.response?.data?.message);
        })
        
        
    }

     
    
    
    if (!roomCode && (participant === "NONE_AVAILABLE" || Owner === "NONE_AVAILABLE") || isError){
          
        return <Navigate to="*" replace/>
          
        }
    
    
      

    return (
        <div className="LobbyContainer">
            <div className="LobbyTitle">
                <h1>Welcome to Game Lobby</h1>
            </div>
            
            <div className="LobbyContent">
                {/* Room Details Card */}
                <div className="RoomBox">
                    <p id="RoomHead">Room Details</p>
                    <div className="TextRom">
                        <span>Room Code:</span>
                        <span className="roomcode-value">{roomCode}</span>
                    </div>
                    <button className="QRbun">
                        <span>Generate QR Code</span>
                    </button>
                </div>

                {/* Players List Card */}
                <div className="RoomBox">
                    <p id="RoomHead">Current Players</p>
                    <div className="ParticipantList">
                        <ul>
                            {RoomParticipants.map((participant, index) => (
                                <li key={index} className="ParticipantBox">
                                    <div className="ParticipantInfoBox">
                                        <p>{participant.Username}</p>
                                        <span className={`RoleBadge ${participant.Roles.toLowerCase()}`}>
                                            {participant.Roles}
                                        </span>
                                        {RoomParticipants.find(p => p.Username === CurrentUser)?.Roles === 'Owner' && (
                                            <button 
                                                className="KickButton"
                                                disabled={participant.Roles.toLowerCase() === "owner"}
                                                aria-label={`Kick ${participant.Username}`}
                                            >
                                                Kick
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}