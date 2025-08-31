import { useState } from "react";
import "../css/MultiHall.css";
import axios from "axios";
import { useUserStore } from "../../components/UserStore";
import { ModalForm,SelfButton } from "../components/ErrorModal";
import type { ModalPropsType } from '../components/ButtonCompo';
import LoadingObject from "../components/LoadingObject"; 
import {Scanner} from '@yudiel/react-qr-scanner';





export default function MultiPage() {
  const [roomCode, setRoomCode] = useState("");
  const {user} = useUserStore();
  const [ModalProp, setModalProp] = useState<ModalPropsType>();
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [MapSelector, setMapSelector] = useState(false);
  const [MapDet, setMapDet] = useState('');
  const [isScanning,setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [MapDetails, setMapDetails] = useState<{MapId:string, MapName:string, MapDetails:string}[]>([]);



  const handleCreateRoom = async () =>{

    const chars= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code ="";
    console.log(user);
    for (let i=0; i<6; i++){
      code += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    setRoomCode(code);
    console.log("Room Created with code: ", code);

    setMapSelector(true);

  }


  const handleAuthMap = async ()=>{

    await axios.post('https://rpgpyapi.onrender.com/auth/authMap', {mapDet: MapDet}, {withCredentials:true}).then((res)=>{

      const {success, SelectedMap} = res.data;

      if (success) {
        setMapDetails(()=>{
          return SelectedMap.map((map:any)=>{
            return{
              MapId: map.MapId,
              MapName: map.MapName,
              MapDetails: map.MapDetails ?? "NO DETAILS AVAILABLE"
            }
          })
        })
        console.log("Map authenticated successfully:", SelectedMap[0].MapId, SelectedMap[0].MapName);
      } else {
        console.error("Failed to authenticate map:", res.data.message);
      };

    }).catch((err)=>{
      console.error("Error authenticating map: ", err);
    });
  }



  const handleAfterJoin = async ()=>{
      
    await axios.post('https://rpgpyapi.onrender.com/join/createRoom', {roomCode: roomCode, Owner:user, MapDetails:MapDetails[0].MapId}, {withCredentials:true}).then((res)=>{
      
      const {encryptUsername}= res.data;
       setModalProp({title:"Room Created", content:`Room created successfully! Share the room code: ${roomCode} with your friends to join.`, buttonContent:[{buttonContent:"OK", buttonType:"primary" ,onClick:()=> {setOpenForm(false),window.location.href = `/Lobby?roomCode=${roomCode}&Owner=${encryptUsername}`}}]})
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
    axios.post('https://rpgpyapi.onrender.com/join/joinRoom', {username:user,roomCode: roomCode}, {withCredentials:true}).then((res)=>{

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


           <ModalForm 
          title={(ModalProp?.title) ?? ""} 
          open={openForm} 
          onOk={()=>{setOpenForm(false)}} 
          onCancel={()=> {setOpenForm(false)}}
          footer={ModalProp?.buttonContent?.map((btn, idx)=>(
            <SelfButton key={idx} type={btn.buttonType} onClick={()=>btn?.onClick?.()}>{btn.buttonContent}</SelfButton>
          ))}>
            <p>{ModalProp?.content}</p>
          </ModalForm>

          <ModalForm
            title={"Map Selector"}
            open={MapSelector}
            onOk={() => { setMapSelector(false) }}
            onCancel={() => { setMapSelector(false), setIsScanning(false),setMapDet(""),setLoading(false)}}
            footer={<SelfButton  onClick={() => { setMapSelector(false), setIsScanning(false),setMapDet(""),setLoading(false),setScanSuccess(false) }} type="danger">Close</SelfButton>}
            multi={true}
          >
            <ModalForm.Page>
               <div className="map-selector">
                  <h3>Please Scan QR to Select Map</h3>

                  {isScanning && <Scanner onScan={async (result)=>{        
                    {
                      const MapData = result[0].rawValue;
                      setMapDet(()=>{
                        console.log("MapDet: ", MapData);
                        return MapData;
                      });
                    setIsScanning(false);
                    setScanSuccess(true);
                    handleAuthMap();
                  }}}></Scanner>}



                  {!isScanning &&(
                    <button onClick={()=>{
                      setIsScanning(true);
                      setScanSuccess(false);
                    }}>
                      Scan QR Code
                    </button>
                  )}
                  {scanSuccess && (
                    <div>
                      <h4>Scanned Success !</h4>
                    </div>
                  )}
               </div>
            </ModalForm.Page>

            <ModalForm.Page>
                  <div>
                    <h4>Room Details {roomCode}</h4>
                    {!MapDetails || MapDetails.length === 0 ? (
                      
                        <div className='map-display no-map'>
                          <p>No Map Details Available </p>
                          <p>Please Select Scan QR to Select</p>
                        </div>
                      
                    ) : (
                      <ul>
                        {MapDetails.map((item, idx) => (
                          <li key={idx} className="map-display mapdet">
                            <p className="mapid">{item.MapId}</p>
                            <p className="mapname">{item.MapName}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                  </div>

                  <div>
                      <SelfButton onClick={() => {handleAfterJoin} } disabled={scanSuccess===false}>Finished</SelfButton>
                  </div>
            </ModalForm.Page>

          </ModalForm>
      
    </div>
  );
}