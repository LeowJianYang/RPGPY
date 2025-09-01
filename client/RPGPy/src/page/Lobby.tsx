
import { useEffect, useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import axios from "axios"
import "../css/Lobby.css"
import { useMapDetailsStore } from "../../components/MapDetailsStore"
import { SelfButton,ModalForm } from "../components/ErrorModal"
import type { ModalPropsType } from '../components/ButtonCompo';
import { socket } from '../socket';
import { useNavigate } from "react-router-dom"
import  { ReloadOutlined } from "@ant-design/icons"




export default function Lobby(){
    const [searchParams] = useSearchParams();
    const roomCode = searchParams.get("roomCode");
    const Owner = searchParams.get("Owner") ?? "NONE_AVAILABLE";
    const participant = searchParams.get("participant") ?? "NONE_AVAILABLE";
    const userId= searchParams.get("userId") ?? "NONE_AVAILABLE";
    const [isError, setIsError] = useState<boolean>(false)
    const [RoomParticipants, setRoomParticipants] = useState<{Username:string, Roles:string}[]>([]);
    const [CurrentUser, setCurrentUser] = useState("");
    const URL= import.meta.env.VITE_API_URL;
    const [userListLoading, setUserlistLoading] = useState<boolean>(true);
    const {MapDetails} = useMapDetailsStore();
    const [ModalProps, setModalProps] = useState<ModalPropsType>();
    const [ModalOpen, setModalOpen] = useState<boolean>(false);
    const navigate= useNavigate();
    const MapId= MapDetails[0]?.MapId ?? "No Map Selected";

    useEffect(()=>{
        socket.connect();

        console.log(JSON.stringify(MapDetails));
        
        
        // Wait for socket to connect before joining room
        socket.on('connect', () => {
            console.log('Socket connected, joining room:', roomCode);
            socket.emit('join-room', roomCode);
        });
        
        
        // Listen for room joined confirmation
        socket.on('room-joined', (data) => {
            console.log('Room joined confirmation:', data);
        });

        
        // If already connected, join immediately
        if (socket.connected) {
            console.log('Socket already connected, joining room:', roomCode);
            socket.emit('join-room', roomCode);
        }
        
        axios.post(`${URL}/auth/validateRoom`, {roomCode, Owner, participant}, {withCredentials:true}).then((res)=>{
            console.log("Room validated: ", res.data);
            setCurrentUser(res.data.owner);
            setIsError(false);
            handleRefList();
        }).catch((err)=>{
            console.error("Error validating room: ", err, "\n", err.response?.data?.message);
            setIsError(true);
        })
        
        // Cleanup function
        return () => {
            socket.off('connect');
            socket.off('room-joined');
            socket.disconnect();
        };
    },[])    


    const handleRefList= async ()=>{

        await axios.get(`${URL}/room/RoomParticipant?roomCode=${roomCode}` ,{withCredentials:true}).then((res)=>{
           const {participants}= res.data
           setRoomParticipants(participants);
           setUserlistLoading(false);

        }).catch((err)=>{
            console.error("Error getting room participants: ", err, "\n", err.response?.data?.message);
            
        })
        
        
    }

    const handleStartGame = async ()=>{
        await axios.post(`${URL}/room/startGame`, {roomCode,MapId},{withCredentials:true}).then((res)=>{
            console.log("Game started: ", res.data);
           
        })
    }

    useEffect(()=>{
        socket.on('game-started', (data)=>{
            console.log("Game started: ", data);
            navigate(`/Game?roomCode=${data.roomCode}&mapid=${data.MapId}&userid=${userId}`, {replace:true});
        })

        return ()=>{
            socket.off('game-started');
        }
    },[socket])

    useEffect(()=>{
        socket.on( 'owner-left', (data)=>{
                console.log("Owner Left",data);    
                setModalProps({title:"Room Closed", content:'Owner Has Left the Room', buttonContent:[{buttonContent:'OK',buttonType:'secondary',
                onClick:()=>{
                    navigate("/dashboard", {replace:true});
                }}]});
                setModalOpen(true);
            });
        
            return ()=>{
                socket.off('owner-left'); //CLEAN the SOCKET!!
            };
    },[socket])

    const handleOwnerLeave = async ()=>{
        await axios.post(`${URL}/room/ownerLeave`, {roomCode},{withCredentials:true}).then((res)=>{
            console.log("Owner left the room: ", res.data);
        
        })
    };

    const handleParticipantLeave = async ()=>{
        await axios.post(`${URL}/room/participantLeave`, {roomCode},{withCredentials:true}).then((res)=>{
            console.log("Participant left the room: ", res.data);
            socket.on( 'participant-left', (data)=>{
                console.log("Participant Left",data);    
                setModalProps({title:"Room Closed", content:'Participant Has Left the Room', buttonContent:[{buttonContent:'OK',buttonType:'secondary',
                onClick:()=>{<Navigate to="/dashboard" replace/>}}]});
                setModalOpen(true);
            }

            )
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
                    <div className="TextRom">
                        <span>Map Details:</span>
                        <span className="mapdetails-value">{MapDetails[0]?.MapName ?? "No Map Selected"}</span>
                    </div>
                    <button className="QRbun">
                        <span>Generate QR Code</span>
                    </button>
                </div>

                {/* Players List Card */}
                <div className="RoomBox">
                    <div className="RoomBxHeader">
                        <p id="RoomHead">Current Players</p>
                        <div className="ReloadIcon">
                            <ReloadOutlined onClick={()=>{handleRefList(), setUserlistLoading(true)}}/>
                        </div>
                    </div>
                    
                    <div className="ParticipantList">

                        <ul>
                            {userListLoading ? Array.from({length:3}).map((_,index)=>(
                                <li key={index} className="ParticipantBox skeleton">
                                    <div className="ParticipantInfoBox">
                                        <div className="skeleton-text"></div>
                                    </div>
                                </li>
                            ))
                            :RoomParticipants.map((participant, index) => (
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
                           <SelfButton type="danger" onClick={ RoomParticipants.find(p=>p.Username === CurrentUser)?.Roles === 'Owner' ? ()=> {handleOwnerLeave()}: ()=>{handleParticipantLeave()}}> Leave Room </SelfButton>
                          
                    </div>
                </div>

                <div className="RoomBox">
                    <p id="RoomHead">Ready To Start Game ?</p>
                    <button className="startGameButton" onClick={()=>{handleStartGame()}} disabled={RoomParticipants.find(p=>p.Username === CurrentUser)?.Roles === 'Owner' ?false :true}>Start Game</button>
                    {RoomParticipants.find(p=>p.Username === CurrentUser)?.Roles !== 'Owner' && (
                        <p className="DisabledDetails">Only Owner Can Start the Game</p>
                    )

                    }
                </div>

                
            </div>
            <ModalForm
                title={ModalProps?.title ?? " "}
                onCancel={() => setModalOpen(false)}
                open={ModalOpen}
                onOk={() => setModalOpen(false)}
                footer={
                    ModalProps?.buttonContent?.map((itm,idx)=>(
                        <SelfButton key={idx} type={itm.buttonType} onClick={itm.onClick}>
                            {itm.buttonContent}
                        </SelfButton>
                    ))
                }
            >
                <p>{ModalProps?.content ?? ""}</p>
            </ModalForm>
        </div>
    )
}