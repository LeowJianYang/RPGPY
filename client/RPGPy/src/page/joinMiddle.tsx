
import { useNavigate,useSearchParams } from "react-router-dom";
import LoadingObject from "../components/LoadingObject";
import { useEffect, useState,useRef } from "react";
import axios from "axios";
import { useUserStore } from "../../components/UserStore";
import { socket } from "../socket";

import "../css/TimeOut.css";

export default function JoinMiddlePage(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const roomCode = searchParams.get("roomCode");
    const URL= import.meta.env.VITE_API_URL;
    const {user} = useUserStore();
    const [success, setSuccess] = useState(false);
    const isMounted = useRef(false);
    const [data, setData] = useState<{userId:string, encryptUsername:string}>({userId:'', encryptUsername:''});

    
        if(!roomCode){
            navigate('*', {replace:true});
        };

          useEffect(()=>{
        if(isMounted.current) return;
        isMounted.current = true;
         joinRoom();
        },[user])

        const joinRoom = async() =>{
            console.log("USER",user)
            await axios.post(`${URL}/room/joinRoom`, {username: user, roomCode: roomCode}, {withCredentials:true}).then((res)=>{
                 const {userId,encryptUsername} = res.data;
                setData(()=>{
                    return {
                        userId: userId,
                        encryptUsername: encryptUsername
                    };
                });
                setLoading(()=>{
                    return false;
                });
                setSuccess(()=>{
                    return true;
                });
                console.log("Joined room successfully:", res.data);
                socket.connect();
                socket.emit('join-room', {roomCode, user});
            
            }).catch((err)=>{
                 console.error("Failed to join room:", err);
                    setLoading(false);
                setSuccess(false);
            })


         
            
        }

    useEffect(() => {
        let timeoutId: number;
        
        if (success && data.encryptUsername && data.userId) {
            timeoutId = setTimeout(() => {
                navigate(`/Lobby?roomCode=${roomCode}&participant=${data.encryptUsername}&userId=${data.userId}`, {replace: true});
            }, 1500);
        }
        
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [success, data, roomCode, navigate]);


   


    return (
        <div className="time-container">
            <div className="time-box">
                          {loading && <LoadingObject/>}
            {!loading && success &&
            
                <div className="time-inner-container">
                    <img src="/green-tick-check.png" alt="approve"></img>
                    <h2>Joined Room Successfully!</h2>
                    <h3>Now Redirecting, Please Wait !</h3>
                </div>}

            {!loading && !success &&
                <div className="time-inner-container">
                    <img src="/error-cross.png" alt="denied"></img>
                    <h2>Failed to Join Room!</h2>
                    
                    <div className="error-messages">
                        <p style={{fontWeight:'bold',fontSize:'clamp(0.8rem,4vh,1.25rem)'}}>Now You Can:</p>
                        <h3>Manually Enter Room Code</h3>
                        <h3>Or Check with Owner and Try Again</h3>
                    </div>
                </div>
            }
            </div>
  
        </div>
    )

}