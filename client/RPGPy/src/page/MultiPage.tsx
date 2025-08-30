import { useState } from "react";
import "../css/MultiHall.css";
import axios from "axios";
import { useUserStore } from "../../components/UserStore";
import { ModalForm,SelfButton } from "../components/ErrorModal";
import type { ModalPropsType } from '../components/ButtonCompo';
import LoadingObject from "../components/LoadingObject";

export default function MultiPage() {
  const [roomCode, setRoomCode] = useState("");
  const {user} = useUserStore();
  const [ModalProp, setModalProp] = useState<ModalPropsType>();
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () =>{

    const chars= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code ="";
    console.log(user);
    for (let i=0; i<6; i++){
      code += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    setRoomCode(code);
    console.log("Room Created with code: ", code);
    
    axios.post('http://localhost:3000/join/createRoom', {roomCode: code, Owner:user}, {withCredentials:true}).then((res)=>{
      
      const {encryptUsername}= res.data;
       setModalProp({title:"Room Created", content:`Room created successfully! Share the room code: ${code} with your friends to join.`, buttonContent:[{buttonContent:"OK", buttonType:"primary" ,onClick:()=> {setOpenForm(false),window.location.href = `/Lobby?roomCode=${code}&Owner=${encryptUsername}`}}]})
       setLoading(false);
       setOpenForm(true);
     
      
    }). catch((err)=>{
      setModalProp({title:"Error", content: err.response?.data?.message || "Failed to create room. Please try again.", buttonContent:[{buttonContent:"OK", buttonType:"primary", onClick:()=> setOpenForm(false)}]})
      setLoading(false);
      setOpenForm(true);
      console.error("Error creating room: ", err, "\n", err.response?.data?.message);
    })
  }

  const handleJoinRoom = async () =>{
    axios.post('http://localhost:3000/join/joinRoom', {username:user,roomCode: roomCode}, {withCredentials:true}).then((res)=>{

      setModalProp({title:"Joined Room", content:`Successfully joined room: ${roomCode}.`, buttonContent:[{buttonContent:"OK", buttonType:"primary" ,onClick:()=> {setOpenForm(false), window.location.href = `/Lobby?roomCode=${roomCode}&participant=${res.data.encryptUsername}`}}]})
      setLoading(false);
      setOpenForm(true);
    }). catch ((err)=>{
      setModalProp({title:"Error", content: err.response?.data?.message || "Failed to join room. Please check the room code and try again.", buttonContent:[{buttonContent:"OK", buttonType:"primary", onClick:()=> {setOpenForm(false)}}]})
      setLoading(false);
      setOpenForm(true);
      console.error("Error joining room: ", err, "\n", err.response?.data?.message);
    })
  }



  return (
    <div className="multiplayer-hall"> 
    <h1 className="hall-title">Multiplayer Hall</h1>
      <div className="hall-content">
        <h1 className="hall-title">Create or Join a Room</h1>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter Room Code"
            className="room-code-input"
            onChange={(e) => {
              setRoomCode(e.target.value);
            }}
          />
        </div>
        <div className="button-group">
          <button className="btn-multi create-room-btn" onClick={()=>{handleCreateRoom(), setLoading(true)}}>Create Room</button>
          <button className="btn-multi join-room-btn" onClick={()=>{handleJoinRoom(), setLoading(true)}}>Join Room</button>
        </div>
      </div>
   
          
          <ModalForm 
          title={(ModalProp?.title) ?? ""} 
          open={openForm} 
          onOk={()=>{setOpenForm(false)}} 
          onCancel={()=> setOpenForm(false)}
          footer={ModalProp?.buttonContent?.map((btn, idx)=>(
            <SelfButton key={idx} type={btn.buttonType} onClick={()=>btn?.onClick?.()}>{btn.buttonContent}</SelfButton>
          ))}>
            <p>{ModalProp?.content}</p>
          </ModalForm>

          {loading && (
            <LoadingObject/>
          )}
      
    </div>
  );
}