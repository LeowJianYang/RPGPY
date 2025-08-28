import { useState } from "react";
import "../css/MultiHall.css";

export default function MultiPage() {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="multiplayer-hall"> 
    <h1 className="hall-title">Multiplayer Hall</h1>
      <div className="hall-content">
        <h1 className="hall-title">Create or Join a Room</h1>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode ?? ""}
            className="room-code-input"
            onChange={(e) => {
              setRoomCode(e.target.value);
            }}
          />
        </div>
        <div className="button-group">
          <button className="btn create-room-btn">Create Room</button>
          <button className="btn join-room-btn">Join Room</button>
        </div>
      </div>
    </div>
  );
}