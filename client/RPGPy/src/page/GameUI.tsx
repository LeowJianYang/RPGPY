import { useEffect, useMemo, useState, useRef } from 'react';
import type { MapJSON, TileType, LootTypes, SkillsType, inventoryType } from '../GameTypes'
import PythonRunner from '../PythonRunner';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import "../css/game.css";
import { Button, Modal } from 'antd';
import { useUserStore } from '../../components/UserStore';
import  { ModalForm,SelfButton } from '../components/Modal';
import type { ModalPropsType } from '../utils/ButtonCompo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '../socket';
import { useToast } from '../components/Toast';
import {BgmManager} from '../utils/BgmManager';
import { MutedOutlined, SoundOutlined } from '@ant-design/icons';
import HealthBar from '../components/HeathBar';
import {useSessionStore} from '../../components/IDStore';
import introJs from 'intro.js';
import Countdown from '../components/countdown';
import { IoMdRefresh } from 'react-icons/io';
import {Scanner} from '@yudiel/react-qr-scanner';
import CryptoJS from 'crypto-js';



type QuizState =
  | { kind: 'none' }
  | { kind: 'mcq'; q: string; a: string[]; correct: number }
  | { kind: 'code'; prompt: string; starter: string; expected:string };

export default function Game({Mode}: {Mode:string}) {
  const bgm = useMemo(() => new BgmManager(), []);
  const [map, setMap] = useState<MapJSON | null>(null);
  const [position, setPosition] = useState<string|number>(1);
  const [hp, setHp] = useState<number>(0);
  const [inventory, setInventory] = useState<inventoryType[]>([]);
  const [dice, setDice] = useState<number | null | string>(null);
  const [quiz, setQuiz] = useState<QuizState>({ kind: 'none' });
  const [codeInput, setCodeInput] = useState<string>('');
  const [skResult, setSkResult] = useState<{ ok: boolean; out: string; err?: string } | null>(null);
  const [open,setOpen] = useState<boolean>(false);
  const [useInv, setUseInv] = useState<string>("");
  const [Atk, setAtk] = useState<number>(0);
  const {user,setUser} = useUserStore();
  const [equip, setEquip] = useState<string[]>([]);
  const [eModalOpen, setEModalOpen] = useState<boolean>(false);
  const [EquipDet, setEquipDet] = useState<string[]>([]);
  const [isError, SetisError] = useState<boolean>(false);
  const [ModalCont, setModalCont] = useState<ModalPropsType>();
  const [isSucced, setisSucced] = useState<number>(0);
  const [enemyHp,setEnemyHp] = useState<number>(0);
  const [Score, setScore] = useState<number>(0);
  const [isClicked, setIsClick] = useState<number>(0);
  const [CurrentTurn, setCurrentTurn] = useState<{roomCode: string, players: string[], turnOrder: string[], currentTurn: number, currentPlayer: string, round: number, playersName: string[]}>();
  const URL= import.meta.env.VITE_API_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  //const [roles, setRoles]= useState<{roleName:string,description:string, ATK:number, HP:number, Skills:string[]}[]>([]);
  const [Muted, setMuted] = useState(bgm.isBgmMuted());
  const [SkillsUsed, setSkillsUsed] = useState<{Cooldown:number, duration?:number, usedSkill:string}[]>([]);
  const {notify} = useToast();
  const roomCode = searchParams.get("roomCode") ?? "NONE_AVAILABLE";
  const mapid= searchParams.get("mapid") ?? "NONE_AVAILABLE";
  const userid= searchParams.get("userid") ?? "NONE_AVAILABLE";
  const EnteringBranch = useRef(false);
  const branchCodeRef = useRef<string>("");
  const {ssid} = useSessionStore();
  const started= useRef(false);
  const coinRef = useRef<number>(10);
  const enemyRef = useRef<number>(0);
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const scanResultRef = useRef<string>("");
  const [scanResult, setScanResult] = useState<string>("");
  const mapKey = import.meta.env.VITE_MAP_SECRET_KEY ;

  useEffect(()=>{

    const checkSession = async ()=>{
      await axios.get(`${URL}/auth/checkSession`, {params:{ssid,userid,roomId:roomCode},withCredentials:true}).then((res)=>{
        if(res.data.success){
          console.log("Session valid");
        }
      }).catch((err)=>{
        console.error("Error checking session: ", err);
        navigate('/v0/auth/join?roomCode=N/A', {replace:true});
        console.log("SSID-CATCH", ssid)
      });
    };

    if(ssid){
      checkSession();
    }else{
      navigate('/v0/auth/join?roomCode=N/A', {replace:true});
      console.log("SSID", ssid)
    }

  },[])

  useEffect(()=>{
    console.log("MODE", Mode);
     Mode === "Tutorial" ? document.title = "RPGPy - Tutorial Mode" : document.title = "RPGPy - Game Mode";
     if (Mode === "Tutorial" && !started.current){
        started.current = true;
        setTimeout(()=>{handleTutorialLogic();},500);
     }
      
  },[Mode]);

  // Load pending inventory items from backpack (localStorage)
  useEffect(() => {
    const pendingItems = localStorage.getItem('pendingInventoryItems');
    if (pendingItems) {
      try {
        const items = JSON.parse(pendingItems);
        if (Array.isArray(items) && items.length > 0) {
          // Add all pending items to inventory
          setInventory(prev => [...prev, ...items]);
          // Clear the pending items
          localStorage.removeItem('pendingInventoryItems');
          console.log('[BACKPACK] Added items from backpack to inventory:', items);
        }
      } catch (error) {
        console.error('[BACKPACK] Error loading pending items:', error);
        localStorage.removeItem('pendingInventoryItems');
      }
    }
  }, []); // Run once on mount



  useEffect(()=>{
    window.history.pushState(null, "", window.location.href);
    const handlePopState = ()=>{
       window.history.pushState(null, "", window.location.href);
    };


    window.addEventListener("popstate", handlePopState);
    return ()=>{
      window.removeEventListener("popstate", handlePopState);
    };
  },[]);

  console.log("[DEBUG] URL Parameters:", {roomCode, mapid, userid});

    const http = axios.create({
        baseURL: URL,
        withCredentials:true
    })


    if(!roomCode || roomCode === "NONE_AVAILABLE" || !mapid || mapid === "NONE_AVAILABLE" || !userid || userid === "NONE_AVAILABLE"){
      console.error("[DEBUG] MISSING PARAMETERS:", {roomCode, mapid, userid});
      navigate('*',{replace:true});
      return;
    }

  
  // Run MAP001 with QR code
  useEffect( () => {

    const fetchAuthCookie = async () => {
      try{
        const res = await http.get("/authCookie");
        setUser({
          user: res.data.Username,
          email: res.data.Email,
          uid: res.data.uid
        });
        console.log('AUTH ',res.data.user); 
      }catch(err){
        console.log(err);
        window.location.href = "/login";
      }
    };

    fetchAuthCookie();

    http.get(`/map/${mapid}`).then(res => {
      const decrypted = CryptoJS.AES.decrypt(res.data.map, mapKey).toString(CryptoJS.enc.Utf8);
      setMap(JSON.parse(decrypted));

        }).catch(console.error);
    
    bgm.play('/Music/Main-flow.ogg', true);
  
 
  }, []);

  useEffect(()=>{

    if(!socket.connected) socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected', user?.uid);
      socket.emit('join-room', {roomCode, user: user?.user});
    });

    if (socket.connected) {
        console.log('Socket already connected, joining room:', roomCode, user?.uid);
        socket.emit('join-room', {roomCode, user: user?.user});
    }

    // Add handler for successful room join
    socket.on('room-joined', (data) => {
      console.log('Successfully joined room:', data);
      // Request current turn order after joining, but only if we don't have it yet
      if (!CurrentTurn) {
        setTimeout(() => {
          console.log('Requesting turn order after room join...');
          requestCurrentGameState();
        }, 1000); // Small delay to let server process
      }
    });

    //receive data
    socket.on('turn-order',(data)=>{
      setCurrentTurn(data);
      console.log("Current Turn:", data);
      // If include reshuffled info，show modal
      if (data.reshuffled) {
        setModalCont({
          title: "Turn Order Reshuffled!", 
          content: `After 3 rounds, the turn order has been reshuffled for round ${data.round}!`,
          buttonContent:[{buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}}]
        });
        handleErrorModal();
      }
    })

    // Add handler for direct turn-order requests
    socket.on('request-turn-order', () => {
      console.log('Server requesting turn order refresh...');
    });

    return () => {
      socket.off('connect');
      socket.off('room-joined');
      socket.off('turn-order');
      socket.off('request-turn-order');
      //socket.disconnect();
      
    }
  },[socket])

  // Function to request current game state via socket
  const requestCurrentGameState = async (retryCount = 0) => {
    try {
      console.log(`Requesting current game state for room: ${roomCode} (attempt ${retryCount + 1})`);
      
      // Use your existing /game/turn endpoint to trigger turn-order broadcast
      const response = await http.post('/game/turn', { roomCode });
      console.log("Turn state request sent:", response.data);
      return true;
    } catch (error) {
      console.error(`Error requesting current game state (attempt ${retryCount + 1}):`, error);
      
      // Retry up to 2 times with increasing delay
      if (retryCount < 2) {
        setTimeout(() => {
          requestCurrentGameState(retryCount + 1);
        }, (retryCount + 1) * 1000);
        return false;
      }
      
      // If all retries failed, try direct socket fallback
      console.log('HTTP requests failed, trying socket fallback...');
      socket.emit('request-turn-order', { roomCode });
      return false;
    }
  };

  // Additional useEffect to ensure we get turn order even if room-joined event is missed
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 2; // Reduced attempts since we're using broadcasts
    
    const checkTurnOrder = () => {
      if (!CurrentTurn && socket.connected && roomCode !== "NONE_AVAILABLE" && attempts < maxAttempts) {
        attempts++;
        console.log(`Requesting turn order... attempt ${attempts}`);
        // Try to trigger turn-order broadcast
        requestCurrentGameState();
      }
    };

    // First check after 2 seconds (give more time for initial socket setup)
    const initialTimer = setTimeout(checkTurnOrder, 2000);
    
    // Follow-up check after 5 seconds if still no data
    const secondTimer = setTimeout(checkTurnOrder, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondTimer);
    };
  }, [CurrentTurn, roomCode, socket.connected]);

  // Cleanup BGM when component unmounts
  useEffect(() => {
    return () => {
      bgm.stop();
    };
  }, [bgm]);

  useEffect(()=>{

    if(map?.RolesSet){

        const keys= Object.keys(map?.RolesSet);
        const randomKey= keys[Math.floor(Math.random()*keys.length)];
        const rolesArray= map?.RolesSet[randomKey];
        
        // Set roles state
        // setRoles([{
        //   roleName: randomKey,
        //   description: rolesArray.description,
        //   ATK: rolesArray.ATK,
        //   HP: rolesArray.HP,
        //   Skills: rolesArray.Skills
        // }]);
        
        // Set HP and ATK
        setHp(rolesArray.HP);
        setAtk(rolesArray.ATK);

        // Use rolesArray directly instead of roles[0] to avoid async state issue
        const firstSkill = rolesArray.Skills[0] ?? "S";
        setEquip(["W","A", firstSkill]);
        
        // Set equipment details using the actual skill from rolesArray
        setEquipDet([
          `Description: ${map?.SkillsSet[rolesArray.Skills[0]]?.description ?? "No description"}`, 
          `Type: ${map?.SkillsSet[rolesArray.Skills[0]]?.type ?? "Unknown"}`,
          `Damage: ${map?.SkillsSet[rolesArray.Skills[0]]?.damage ?? 0}`,
          `Heal: ${map?.SkillsSet[rolesArray.Skills[0]]?.heal ?? 0}`,
          `HP: ${map?.SkillsSet[rolesArray.Skills[0]]?.HP ?? 0}`,
          `Duration: ${map?.SkillsSet[rolesArray.Skills[0]]?.duration ?? 0}`, 
          `Cooldown: ${map?.SkillsSet[rolesArray.Skills[0]]?.Cooldown ?? 0}`
        ]);
        
        console.log("[DEBUG] EQUIP SET", rolesArray.Skills[0]);
        console.log("[DEBUG] ROLES", JSON.stringify([{
          roleName: randomKey,
          description: rolesArray.description,
          ATK: rolesArray.ATK,
          HP: rolesArray.HP,
          Skills: rolesArray.Skills
        }]));
    } else{
       setHp(map?.Player.HP ?? 0);
      setAtk(map?.Player.ATK??0);
      setEquip(["W","A","S"])
      console.log("[DEBUG] Default setup - HP:", map?.Player.HP, "ATK:", map?.Player.ATK);
    }
    

  },[map])

  // Split the Number and String - Enhanced to handle both pure numbers and letter+number combinations
  function keySplit(key: string) {
    // First check if it's a pure number
    const pureNumber = key.match(/^\d+$/);
    if (pureNumber) {
      return {
        prefix: null,
        suffix: Number(key)
      };
    }
    
    // Then check if it's letter+number combination
    const letterNumber = key.match(/^([A-Za-z]+)(\d+)$/);
    if (letterNumber) {
      return {
        prefix: letterNumber[1],
        suffix: Number(letterNumber[2])
      };
    }
    
    // If neither pattern matches, return nulls
    return {
      prefix: null,
      suffix: null
    };
  }

  const ClickDice = () =>{
    setIsClick(prev=> prev+1);
  }

  async function safeCall<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (err:any) {
    console.error("ERROR:", err);
      setModalCont({title:"Opps!", content:err.toString(),buttonContent:[
          {buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}},
        ]});
    handleErrorModal();
    return undefined;
  }
}

  
  const nextTurn = async () => {
    try {
      const response = await http.post('/game/next-turn', { roomCode });
      setIsClick(0);
      console.log("Turn advanced:", response.data);
    } catch (err) {
      console.error("Error advancing turn:", err);
      setModalCont({
        title: "Error", 
        content: "Failed to advance turn",
        buttonContent:[{buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}}]
      });
      handleErrorModal();
    }
  };

  // Auto fire End Turn button 
  const autoFireEndTurn = () => {
    console.log("=== Auto Fire End Turn ===");
    console.log("Current Turn:", CurrentTurn);
    console.log("Socket ID:", socket.id);
    console.log("Is My Turn:", isMyTurn());
    
    
    if (!isMyTurn()) {
      console.log("Not my turn, cannot auto fire End Turn");
      return;
    }
    
    console.log("Auto firing End Turn...");
    
    nextTurn();
    SkillCoolDownEffect();
    setisSucced(1);
    setCodeInput("#Start Here ! The Last Input No need backslash !");
  };

  // check is turn or not
  const isMyTurn = () => {
    if (!CurrentTurn || !user) return false;
    return CurrentTurn.currentPlayer === socket.id;
  };



  // Encoding the current position Event 
  const {prefix,suffix} = keySplit(position.toString());
  const tileKey = useMemo(() => {
    if (prefix !== null && suffix !== null) {
      // Branch position like L14 -> L14
      return `${prefix}${suffix}`;
    } else {
      // Regular position like 2 -> 02, 15 -> 15
      return position.toString().padStart(2, '0');
    }
  }, [position, prefix, suffix]);
  const currentTile = useMemo(() => {
    if (!map) return null;
    setSkResult(null);
    setisSucced(0);
    return map.tiles[tileKey] || null;
  }, [map, tileKey]);

  useEffect(()=>{

    SkillsUsed.forEach((skills)=>{

      const SkillsDet = map?.SkillsSet[skills.usedSkill];
      if(!SkillsDet) return;

      if(skills.duration !== undefined && skills.duration ===0){
      switch(SkillsDet?.type) {
      case "Attack":
        break;
      case "Heal":
        break;
      
      case "Defense":{
        setHp(h=> h- ((SkillsDet?.HP)? (SkillsDet?.HP): 0));
        break;
      }
    }} else if (skills.duration!=undefined && skills.duration > 0){

      switch(SkillsDet?.type) {
      case "Attack":
        break;
      case "Heal":
        break;
      
      case "Defense":{
        setHp(h=> h+((SkillsDet?.HP)? (SkillsDet?.HP): 0));
        break;
      }
    }

    }
  })

    

  },[SkillsUsed,map])

  const SkillCoolDownEffect = async ()=>{
      setSkillsUsed(prev =>prev.map((skill)=>({
      ...skill,
      Cooldown: Math.max(0, skill.Cooldown-1),
      duration: skill.duration !== undefined ? Math.max(0,skill.duration-1): undefined
    })));
  }

  // Refresh event on every tiles
  useEffect(() => {
    if (!map || !currentTile) {
      setQuiz({ kind: 'none' });
      return;
    };

   
  SkillCoolDownEffect();
    switch (currentTile.type as TileType) {
      case 'Q': {
        const pool = map.quizPools[currentTile.quizPool || ''] || [];
        if (pool.length === 0) {
          setQuiz({ kind: 'none' });
          return;
        }
   
        const pick = pool[Math.floor(Math.random() * pool.length)];
          setQuiz({
            kind: 'code',
            prompt: `Write Python to print the correct answer for:\n\n${pick.q}\n\n(Just print the final answer)`,
            starter: `# write your Python code here\nprint("TODO")`,
            expected: pick.expectedResult?? ""
          });
          setCodeInput(`print("TODO")`);
       
        break;
      }
      case 'E': {
        bgm.stop();
        const idMusic = Math.floor(Math.random() * 2)+1;
        bgm.play(`/Music/Battle${String(idMusic).padStart(3, '0')}.ogg`, true);
        const enemy = map.enemies[currentTile.enemyId!];
        // Enemy 
        const pool= map.quizPools[currentTile.quizPool||""]|| [];
        setEnemyHp(enemy.hp);
        enemyRef.current = enemy.hp;
         // 0 succed >0 not succeed
             setisSucced(1);
            const pick = pool[Math.floor(Math.random()*pool.length)];
            if(currentTile.quizPool!=="python_code_questions" ){
            setQuiz({ kind:"mcq",q:pick.q, a:pick.a, correct:pick.correct as number });
          } else {
            // FOR CODE QUIZ  
            setQuiz({ kind: 'code', prompt: pick.q, starter: 'print("...")' , expected: pick.expectedResult?? ""});

          }
        break;
      }
      case 'C': {
        bgm.stop();
        bgm.play('/Music/Chest001.ogg', true);
        const table = map.lootTables[currentTile.lootTable!];
        const drop = table[Math.floor(Math.random() * table.length)];
        setInventory(items => [...items, {
          items:drop,
          itemType: 'Loot'
        }]);

        setQuiz({ kind: 'none' });
        break;
      }
      case 'B': {
        bgm.stop();
        bgm.play('/Music/Battle001.ogg', true);
        const pool= map.quizPools[currentTile.quizPool||'' ] || [];
        const enemy= map.enemies[currentTile.enemyId!];
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setEnemyHp(enemy.hp);
        enemyRef.current = enemy.hp;
        console.log("BOSS HERE !");
        setisSucced(0);
        setQuiz({ kind: 'code', prompt: pick.q, starter: 'print("...")' , expected: pick.expectedResult?? ""});
        console.log("QUIZ"+quiz);
        setCodeInput('#Using backslash to complete !');
        break;
      } 
       case "M":{
        setisSucced(prev=>prev+1);
        const pool = map.quizPools[currentTile.quizPool || ""]|| [];
        const pick = pool[Math.floor(Math.random()*pool.length)]
            setQuiz({
            kind: 'mcq',
            q: pick.q,
            a: pick.a,
            correct: pick.correct as number
          });
          break;
       }

       case "R":{
        
        const pool = map.quizPools[currentTile.quizPool || ""]|| [];
        const pick = pool[Math.floor(Math.random()*pool.length)]
        if(currentTile.quizPool!=="python_code_questions" && currentTile.quizPool){
          const idMusic = Math.floor(Math.random() * 2)+1;
          bgm.play(`/Music/Battle${String(idMusic).padStart(3, '0')}.ogg`, true);
             
          setQuiz({
            kind: 'mcq',
            q: pick.q,
            a: pick.a,
            correct: pick.correct as number
          });
        } 
        
        else if (currentTile.quizPool==="python_code_questions" && currentTile.quizPool){
             bgm.play('/Music/Main-flow.ogg', true);
          setQuiz({
            kind:"code",
            prompt: `Write Python to print the correct answer for:\n${pick.q}\n(Just print the final answer)`,
            starter: `# write your Python code here\n`,
            expected: pick.expectedResult?? ""
          })
          setCodeInput(`# write your Python code here\n`);
        
        }

        else{
           bgm.play('/Music/Main-flow.ogg', true);
          setQuiz({kind:'none'})
        }
        break;
       }
      
      case "U": {
        const pick = map.EquipCard[Math.floor(Math.random()* map.EquipCard.length)];
        setInventory(items => [...items, {
          items: pick.name,
          itemType: pick.type
        }]);
        break;
      };

      default:
        setQuiz({ kind: 'none' });
    }
  }, [map, currentTile]);

  // Tutorial Logic
  const handleTutorialLogic = async ()=>{
    introJs.tour().start();
  };

//Position Control
  // Position Control - Handle player movement based on dice input
  const rollPosition = async () => {
    if (!map) return;

    console.log("=== rollPosition Debug ===");
    console.log("Current position:", position);
    console.log("Dice input:", dice);
    console.log("Current tile:", currentTile);

    const {prefix, suffix} = keySplit(dice?.toString() ?? "");
    const isRegularDice = prefix === null && suffix !== null;
    const isBranchCode = prefix !== null && suffix !== null;
    const {prefix: currPrefix} = keySplit(position.toString());

    // Handle regular dice movement
    const handleRegularMove = async () => {
      const currentPos = Number(position);
      const diceValue = Number(dice);
      const nextPos = currentPos + diceValue;
      
      console.log("[DEBUG] Regular move from", currentPos, "to", nextPos);
      
      if (nextPos > map.LastIndex) {
        throw new Error("Position exceeds map limit");
      }
      
      setPosition(nextPos);
      await http.post('/map/progress-update', { 
        mapId: mapid, 
        userId: Number(userid), 
        score: Score, 
        roomCode: roomCode 
      }).catch(() => {
        console.error("[DEBUG] ERROR updating progress for regular move");
      });
    };

    // Handle branch code movement
    const handleBranchMove = async () => {
      const next = `${prefix}${suffix}`;
      
      console.log("[DEBUG] Branch move to", next);
      console.log("[DEBUG] Current branch ref:", branchCodeRef.current);
      
      if (!map.tiles[next]?.type) {
        throw new Error("Invalid branch position");
      }
      
      // If we're in a branch, ensure we're using the correct branch letter
      if (EnteringBranch.current && prefix !== branchCodeRef.current) {
        throw new Error("Branch code mismatch");
      }
      
      setPosition(next);
      await http.post('/map/progress-update', { 
        mapId: mapid, 
        userId: Number(userid), 
        score: Score, 
        roomCode: roomCode 
      }).catch(() => {
        console.error("[DEBUG] ERROR updating progress for branch move");
      });
    };

    // Handle branch exit using regular dice
    const handleBranchExit = async () => {
      const diceValue = Number(dice);
      
      console.log("[DEBUG] Branch exit attempt - dice:", diceValue);
      
      // For branch exit, the dice value IS the target position
      // This is different from regular movement where dice is added to current position
      let targetPos = diceValue;
      
      console.log("[DEBUG] Branch exit target position:", targetPos);
      
      if (targetPos > map.LastIndex) {
        throw new Error("Exit position exceeds map limit");
      }
      
      // Exit branch state
      EnteringBranch.current = false;
      branchCodeRef.current = "";
      
      setPosition(targetPos);
      await http.post('/map/progress-update', { 
        mapId: mapid, 
        userId: Number(userid), 
        score: Score, 
        roomCode: roomCode 
      }).catch(() => {
        console.error("[DEBUG] ERROR updating progress for branch exit");
      });
      
      console.log("[DEBUG] Successfully exited branch to position", targetPos);
    };

    try {
      // Case 1: Entering a branch (regular position + branch code input)
      if (currPrefix === null && isBranchCode && currentTile?.branchExpected) {
        const expected = currentTile.branchExpected;
        const target = `${prefix}${suffix}`;
        
        console.log("[DEBUG] Entering branch - Expected:", expected, "Target:", target);
        
        if (expected !== target) {
          throw new Error("Invalid branch entry code");
        }
        
        // Set branch state
        EnteringBranch.current = true;
        branchCodeRef.current = prefix ?? "";
        
        await safeCall(handleBranchMove);
        return;
      }
      
      // Case 2: Moving within a branch (branch position + branch code input)
      if (currPrefix !== null && isBranchCode) {
        console.log("[DEBUG] Moving within branch");
        // Ensure branch state is set correctly
        if (!EnteringBranch.current) {
          console.log("[DEBUG] Branch state was reset, restoring it for branch move");
          EnteringBranch.current = true;
          branchCodeRef.current = currPrefix;
        }
        await safeCall(handleBranchMove);
        return;
      }
      
      // Case 3: Exiting a branch (branch position + regular dice input)
      // Check if we're in a branch position (has prefix) and using regular dice
      if (currPrefix !== null && isRegularDice) {
        console.log("[DEBUG] Exiting branch - position has prefix, using regular dice");
        // Ensure branch state is set correctly before exit
        if (!EnteringBranch.current) {
          console.log("[DEBUG] Branch state was reset, restoring it for exit");
          EnteringBranch.current = true;
          branchCodeRef.current = currPrefix;
        }
        await safeCall(handleBranchExit);
        return;
      }
      
      // Case 4: Regular movement (regular position + regular dice input)
      if (currPrefix === null && isRegularDice) {
        console.log("[DEBUG] Regular movement");
        await safeCall(handleRegularMove);
        return;
      }
      
      // Case 5: On branch tile but not entering branch (using regular dice to skip)
      if (currentTile?.type === "R" && isRegularDice && !isBranchCode && currPrefix === null) {
        const diceValue = Number(dice);
        const branchQuitPoint = Number(currentTile?.branchQuit ?? 0);
        
        // If dice value reaches or exceeds the branch quit point, allow skipping the branch
        if (diceValue >= branchQuitPoint) {
          console.log("[DEBUG] Skipping branch via regular dice");
          await safeCall(handleRegularMove);
          return;
        }
      }
      
      // If none of the above cases match, it's an invalid move
      throw new Error("Invalid move combination");
      
    } catch (err: any) {
      console.error("[DEBUG] rollPosition error:", err);
      setModalCont({
        title: "Move Error", 
        content: err instanceof Error ? err.message : String(err),
        buttonContent: [{
          buttonContent: "OK", 
          buttonType: "primary", 
          onClick: () => { SetisError(false); }
        }]
      });
      handleErrorModal();
    }
  }

  const handleErrorModal= ()=>{
    SetisError(true);
  }

  /**
   * Switch the Question based on the type
   * @usecase
   * Use in the Enemy Tabs(encounter) to switch before they died
   *
   * @example
   * handleSwitchQuestion(0) // MCQ
   * handleSwitchQuestion(1) // Code
   * @param idx - 0 means MCQ, 1 means Code
   */

  const handleSwitchQuestion = (idx:number)=>{
    const pool = map?.quizPools[currentTile?.quizPool || ""]||[];
    switch(idx){
      case 0:{       
        const pick = pool[Math.floor(Math.random()*pool.length)];
        setQuiz({
          kind: 'mcq',
          q: pick.q,
          a: pick.a,
          correct: pick.correct as number
        })
        break;
      }
      case 1:{
        const pick = pool[Math.floor(Math.random()*pool.length)];
        setQuiz({
          kind:'code',
          prompt: `Write Python to print the correct answer for:\n\n${pick.q}\n\n(Just print the final answer)`,
          starter: `# write your Python code here\nprint("TODO")`,
          expected: pick.expectedResult?? ""
        });
      }
    }
  }


  // Choosing MCQ Answer
  const answerMcq = (idx: number) => {
    if (quiz.kind !== 'mcq') return;
    const correct = idx === quiz.correct;
    if (correct) {
      notify('success',"Correct Answer !", "You answered correctly and dealt damage to the enemy.", 'top');
      setScore(prev => prev + 20);
      setisSucced(0);  
      if(currentTile?.type==="E")
      {
        enemyRef.current = Math.max(0,enemyRef.current - Atk);
        setEnemyHp(h=>{
          const newHp= Math.max(0,h-Atk);
          if (newHp===0){
                
            bgm.stop();
            bgm.play('/Music/Main-flow.ogg', true);
            setQuiz({ kind: 'none' });
          } else{
            handleSwitchQuestion(0);
          }
          return newHp;
        });
      } 
      else{
        setisSucced(0);
      }
    } else {
      switch (isSucced ===0 ? 0:1){
              case 0:{
                setisSucced(prev=>prev+1);
                break;
              }

              case 1:{
                
                setModalCont({title:"Incorrect", content:" Answer not correct yet",buttonContent:[{buttonContent:"Ok",buttonType:'primary',onClick:()=>{SetisError(false)}}] });
             
                if(currentTile?.type==="E")
                  {
                    const enemy =map?.enemies[currentTile?.enemyId!];
                    setHp(h => Math.max(0, h - (enemy?.attack)!));
                    setScore(prev => prev-15);
                  } else{
                      setHp(h => Math.max(0, h - 5));
                      setScore(prev => prev-15);
                  }
                handleErrorModal();
                break;
              }
            
          }
    }
    // setQuiz({ kind: 'none' });
  };

  // Run Python Code- Get the result from OnFinished (SkulptRunner)
  const runPython = () => {
    setSkResult(null);
    
  };

  const handleModalCancel =()=>{
    setOpen(false);
    setEModalOpen(false);
  }

  const InventoryOk = async (items:string)=>{
    setInventory(prev=> {
      const newInv =[...prev];
      const idx = newInv.findIndex(entry=> entry.items === items);
      if(idx >-1){
        newInv.splice(idx,1);
      }
      return newInv;
    })

    const eff= map?.lootEffects[items] ;
    

    switch(eff?.type){

      case "Restock":{
        const effState= eff?.HP as number;
       
        setHp(h=> Math.max(0,h+effState)); // Avoid Hp become negative values put 0 infront
        console.log("[DEBUG] HP SECTION")
        break;
      };

      case "Weapon":{
        const effState= eff?.ATK as number;
        setEquip(
          prev=> prev.map((val,ix)=>(ix ===0? items:val))
        );

        if(equip[0]!=='W'){
          const Curr = (map?.lootEffects[equip[0]] as Extract<LootTypes, {type: 'Weapon'}>)?.ATK;
          setAtk(
           Math.max(0,Atk-Curr)
          );
        }

        setAtk(a=> Math.max(a+effState));
        break;
      };

      case "Amour":{
        const effState = eff?.HP as number;
        setEquip(
          prev=> prev.map((val,ix)=>(ix ===1? items:val))
        )

        if(equip[1]!=="A"){
          const Curr = (map?.lootEffects[equip[1]] as Extract<LootTypes, {type: 'Amour'}>)?.HP;
          setHp(
           Math.max(0,hp-Curr)
          );
        };

        setHp(h=> Math.max(0,h+effState));
        console.log("[DEBUG] AMOUR SECTION")
        break;
      };

      case 'Heal':
      case 'Defense':
      case "Attack":{
        setEquip(prev=> prev.map((val,idx)=>(
          idx===2? items:val
        )));
        
        break;
      };

      case 'Loot':{
        coinRef.current += eff?.GOLD as number;
        break;
      }

    }

    setOpen(false);


  }

  const handleHpZero =  async ()=>{
    bgm.stop();
    bgm.play('/Music/Lose_sound.wav', false);
    setModalCont({title:"Opps! You Lose", content:"You HP is ZERO !!", buttonContent:[{buttonContent:"Back To Homepage",buttonType:'danger', onClick:()=>{window.location.href="/dashboard"}}]});
    await handleAchievementCheck("Lose one times");

    handleErrorModal();
  }

  
   /**
    * To View the Equipment Details on Modal
    * @example 
    * onClickEquip("W") // Weapon Details
    * then, setEquipDet(["Add 3 ATK","3"])
    *
    * @param items - Equipment Name
    */
  const onClickEquip = (items:string)=>{
    setEModalOpen(true);
    console.log("[DEBUG] EQUIP"+items)

    let eff= map?.lootEffects[items];
    if(eff === undefined || !eff){
      eff= map?.SkillsSet[items] as LootTypes;
    }

    console.log("[DEBUG] INEFFECT"+JSON.stringify(eff))
    const effDesc = eff?.description as string;


    switch(eff?.type){

      case "Restock":{
        const effState= eff?.HP;
        setEquipDet([`Description: ${effDesc}`, `Type: Restock `, `HP: ${effState}`])
        break;
      };

      case "Weapon":{
       const effState= eff?.ATK as number;
       setEquipDet([`Description: ${effDesc}`, `Type: Weapon`, `ATK: ${effState}`])
        break;
      };

      case "Amour":{
        const effState = eff?.HP as number;
        setEquipDet([`Description: ${effDesc}`, `Type: Amour`, `HP: ${effState}`])
        console.log("[DEBUG] AMOUR SECTION")
        break;
      };
      
      case 'Heal':
      case 'Defense':
      case 'Attack':{
        const effState:SkillsType = eff;
        setEquipDet([`Description: ${effDesc}`, `Type: ${effState.type}`,`Damage: ${effState.damage??0}`, `Heal: ${effState.heal??0}`, `HP: ${effState.HP??0}`, `Duration: ${effState.duration??0}`, `Cooldown: ${effState.Cooldown}`])
        
        break;
      };

      case 'Loot':{

        break;
      }

      default:{
        setEquipDet(["NO Equipment Found !", "No Effect"]);
        break;
      }
    }
      
  }


  const handleInventoryClick = (items:string)=>{
      setOpen(true);
      setUseInv(items);

  }

  const setUsingSkills = async (skills:string[])=>{
        
      // Description: ${effDesc}`, `Type: ${effState.SkillType} \n Damage: ${effState.damage??0} \n Heal: ${effState.heal??0} \n HP: ${effState.HP??0} \n Duration: ${effState.duration??0} \n Cooldown: ${effState.Cooldown
      const dmgPhrase = skills.find(det=> det.startsWith('Damage:'));
      const healPhrase = skills.find(det=> det.startsWith('Heal:'));
      const hpPhrase = skills.find(det=> det.startsWith('HP:'));
      const durationPhrase = skills.find(det=> det.startsWith('Duration:'));
      const cooldownPhrase = skills.find(det=> det.startsWith('Cooldown:'));
      await handleAchievementCheck("Use a Skill");

      const dmg = dmgPhrase ? parseInt(dmgPhrase.split(':')[1].trim()) : 0;
      const heal = healPhrase ? parseInt(healPhrase.split(':')[1].trim()) : 0;
      const hp = hpPhrase ? parseInt(hpPhrase.split(':')[1].trim()) : 0;
      const duration = durationPhrase ? parseInt(durationPhrase.split(':')[1].trim()) : 0;
      const cooldown = cooldownPhrase ? parseInt(cooldownPhrase.split(':')[1].trim()) : 0;

      console.log("[DEBUG] SKILL USE", {dmg, heal, hp, duration, cooldown});
      console.log("[DEBUG] EQUIP SKILL", JSON.stringify(skills));

      if (duration >0 || cooldown >0){
        setSkillsUsed(prev=> [...prev, {Cooldown:cooldown, duration:duration, usedSkill:equip[2]}]);
      }

      if(dmg >0 ){
        setEnemyHp(h=>{
          return (
            Math.max(0, h-(dmg ?? 0))
          )
        });
        
      }

      if (heal >0){
        setHp(h=> h+heal);
      };

      if(hp >0){
        setHp(h=> h+hp);
      };


  }

  // Check if the move is valid or not
  // Check if the move is valid or not
  const isDisable = ()=>{
    // Always check if there's an active quiz that hasn't been completed FIRST
    if (isClicked > 1){
        return true; // Disable if clicked more than once
    }

    if (currentTile?.quizPool != undefined && isSucced != 0) {
      return true; // Must complete quiz before moving
    }

    if ((currentTile?.type === "E" || currentTile?.type === "B") && enemyRef.current <=0) {
      return false; // Must defeat enemy before moving
    } 

    // Check if position reached the end of the map
    if (position as unknown as number >= (map?.LastIndex ?? 0)) return true;

    // Check if dice value is empty
    if (dice === null || dice === "") return true;

    // Check if current tile exists
    if (!currentTile) return true;

    // Parse dice input to check if it's a branch code or regular number
    const {prefix, suffix} = keySplit(dice.toString());
    const isRegularDice = prefix === null && suffix !== null; // Regular number like 1,2,3,4,5,6
    const isBranchCode = prefix !== null && suffix !== null;  // Branch code like L10, L11
    const {suffix: currSuf, prefix: currPrefix} = keySplit(position.toString());

    console.log("=== isDisable Debug ===");
    console.log("Current position:", position, "prefix:", currPrefix, "suffix:", currSuf);
    console.log("Dice input:", dice, "prefix:", prefix, "suffix:", suffix);
    console.log("Is regular dice:", isRegularDice, "Is branch code:", isBranchCode);
    console.log("Current tile type:", currentTile?.type);
    console.log("Quiz pool:", currentTile?.quizPool, "isSucced:", isSucced);
    console.log("EnteringBranch.current:", EnteringBranch.current);
    console.log("branchCodeRef.current:", branchCodeRef.current);

    // Determine if we're currently in a branch based on position prefix OR branch state
    const isInBranch = currPrefix !== null || EnteringBranch.current;
    
    console.log("Is in branch:", isInBranch);

    // Case 1: We are in a branch (position has prefix like L14)
    if (isInBranch) {
      console.log("=== Branch Logic ===");
      
      // Option A: Continue moving within branch using branch code
      if (isBranchCode) {
        // Check if using the same branch letter
        if (currPrefix && prefix !== currPrefix) {
          console.log("Different branch letter:", prefix, "vs", currPrefix);
          return true;
        }
        
        // Apply 6-step rule within branch
        const currentBranchPos = currSuf ?? 0;
        const targetBranchPos = suffix ?? 0;
        
        if (targetBranchPos > currentBranchPos + 6) {
          console.log("Too far in branch:", targetBranchPos, ">", currentBranchPos + 6);
          return true;
        }
        
        if (targetBranchPos <= currentBranchPos) {
          console.log("Moving backward in branch:", targetBranchPos, "<=", currentBranchPos);
          return true;
        }
        
        console.log("Valid branch move from", (currPrefix || "") + currentBranchPos, "to", prefix + targetBranchPos);
        return false; // Valid branch move
      }
      
      // Option B: Exit branch using regular dice to normal tiles
      if (isRegularDice) {
        const diceValue = Number(dice);
        
        // For branch exit, allow any valid dice value (1-6 or specific exit values)
        if (diceValue < 1) {
          console.log("Invalid dice value for branch exit:", diceValue);
          return true;
        }
        
        console.log("Valid branch exit attempt with dice:", diceValue);
        return false; // Allow branch exit attempt (rollPosition will handle the logic)
      }
      
      console.log("Invalid input format in branch");
      return true; // Invalid input format in branch
    }

    // Case 2: We are NOT in a branch (regular position like 10, 15, etc.)
    if (!isInBranch) {
      console.log("=== Regular/Branch Entry Logic ===");
      
      // Case 2A: On a branch tile (R type) and trying to enter branch
      if (currentTile?.type === "R" && isBranchCode) {
        // Check if the branch code matches the expected branch entry
        if (currentTile.branchExpected && dice.toString() !== currentTile.branchExpected) {
          console.log("Invalid branch entry code:", dice, "expected:", currentTile.branchExpected);
          return true;
        }
        console.log("Valid branch entry");
        return false; // Valid branch entry
      }
      
      // Case 2B: Regular movement with regular dice
      if (isRegularDice) {
        const diceValue = Number(dice);
        const currentPos = Number(position);
        
        // Enforce strict 6-step rule: dice must be 1-6
        if (diceValue < 1 || diceValue > 6) {
          console.log("Invalid dice value (not 1-6):", diceValue);
          return true;
        }
        
        // Check if target position is valid (not moving backward)
        const targetPos = currentPos + diceValue;
        if (targetPos <= currentPos) {
          console.log("Moving backward:", targetPos, "<=", currentPos);
          return true;
        }
        
        console.log("Valid regular move from", currentPos, "to", targetPos);
        return false; // Valid move
      }
      
      // Case 2C: Branch codes not allowed on non-branch tiles
      if (isBranchCode && currentTile?.type !== "R") {
        console.log("Branch code not allowed on non-branch tile");
        return true;
      }
      
      console.log("Invalid input format on regular tile");
      return true; // Invalid input format
    }

    console.log("Fallback - invalid move");
    return true; // Fallback - invalid
  }

  const handleAchievementCheck = async (condition:string)=>{
    try{
      const res = await axios.post(`${URL}/achievements/check`, {
        userId: Number(userid),
        condition: condition
      }, {withCredentials:true});

      bgm.stop();
      bgm.play('/Music/notification.mp3',false);
      res.data.success === true && notify(
        'info',
        "Achievement Unlocked!",
        `You have unlocked the achievement: ${res.data.achievementName}`,
        'bottomRight'
      );
      console.log("[DEBUG] ACH CHECK", res.data);

    } catch(err){
      console.error("[DEBUG] ERROR IN ACH CHECK", err);

    }

  }

  const handleAddCoins = async () =>{
      await axios.post(`${URL}/game/v1/add-coins/${userid}/${coinRef.current}`,{}, {withCredentials:true} ).then((_res)=>{
        console.log("[DEBUG] ADD COINS SUCCESS");
        notify('success',"Coins Added!", `You have successfully earned ${coinRef.current} coins.`, 'top');
      })
      .catch((err)=>{
          console.error("[DEBUG] ERROR IN ADD COINS", err);
          notify('error',"Unexpected Error!", "Failed to add coins to your account.", 'top');
      })
  }

  //Winner Logic
  useEffect(()=>{
      socket.on('game-over', async (data)=>{
       
        type LeaderboardData={
          username:string,
          Score:number;
        }

        await handleAchievementCheck("Complete one game");

        bgm.stop();
        bgm.play('/Music/goal_sound.wav', false);
        console.log("DATA WINNER", data.winner);

        await handleAddCoins();

        if(data.winner === user?.user){

          setModalCont({title:"Congratulation! You Win", content:`Player ${data.winner} has won the game!\n Leaderboard: \n ${data.results3.map((item:LeaderboardData,idx:number)=>`${idx+1}. ${item.username} - ${item.Score} Pts`).join('\n')}`, buttonContent:[{buttonContent:"Back To Homepage",buttonType:'primary', onClick:()=>{window.location.href="/dashboard"}}]});
        } else {
          setModalCont({title:"Game Over!", content:`Player ${data.winner} has won the game!\n Leaderboard: \n
           ${data.results3.map((item:LeaderboardData,idx:number)=>`${idx+1}. ${item.username} - ${item.Score} Pts`).join('\n')}`
            , buttonContent:[{buttonContent:"Back To Homepage",buttonType:'primary', onClick:()=>{window.location.href="/dashboard"}}]});
        }

        handleErrorModal();
      })
      return ()=>{
        socket.off('game-over');
      }
  },[]);

const handleWinerLogic = async () => {
  try {
    const newScore = Score + 25; // Add 50 points for winning
    await http.post('/map/progress-update', { 
      mapId: mapid, 
      userId: Number(userid), 
      score: newScore, 
      roomCode: roomCode 
    });

   
    const res = await axios.post(`${URL}/game/complete-map`, {
      mapId: mapid, 
      userId: Number(userid), 
      score: newScore, 
      roomCode: roomCode, 
      username: user
    }, { withCredentials: true });

    await handleAchievementCheck("Win one time");

    console.log(res.data);
  } catch (err) {
    console.error("[DEBUG] Error in handleWinerLogic", err);
  }
};

const handleBgmMute = () =>{
     const IsMuted = bgm.toggleMute();
     setMuted(IsMuted);

     if(!IsMuted){
        bgm.play('/Music/Main-flow.ogg', true);
     } else{
        bgm.stop();
     }
}


const handleAuthInv= async (items:string)=>{

    try{
      const res =await axios.get(`${URL}/game/v1/inventory/authenticate/${items}`, {withCredentials:true} );

      console.warn("[DEBUG] INV AUTH",map?.lootEffects[useInv]?.type);
      if (res.data.decryption === useInv || res.data.decryption === map?.lootEffects[useInv]?.type){
          scanResultRef.current = useInv;
          setScanResult(res.data.decryption);  
      } else {
          scanResultRef.current = "ERR";
          setScanResult("ERR");
      }


    }catch (err){
      console.error("[DEBUG] ERROR IN AUTH INV", err);
    }

}
  

  const onSkFinish = (ok: boolean, output: string, error?: string) => {
    setSkResult({ ok, out: output, err: error });
    if (quiz.kind === 'code') {
      // If output is match with the expected return result
      if (ok && output.trim().length > 0 && output===(quiz.expected)) {
        notify('success',"Correct Answer !", "You answered correctly and dealt damage to the enemy.", 'top');
         setisSucced(0);
          setScore(prev => prev + 25);
          if(currentTile?.type==="E" || currentTile?.type==="B"){
            enemyRef.current = Math.max(0,enemyRef.current - Atk); 
            setEnemyHp(h=>{
                const newHp= Math.max(0,h-Atk);
                
                if(newHp===0){
                  setisSucced(0);
                  bgm.stop();
                  bgm.play('/Music/Main-flow.ogg', true);
                  setQuiz({kind:'none'});
                  currentTile?.type === "B" && handleWinerLogic();
                }else{
                  handleSwitchQuestion(1);
                };
                return newHp;
             })
          }
        // setQuiz({ kind: 'none' });
      } else {
          
            switch (isSucced ==0 ? 0:1){
              case 0:{
                setisSucced(prev=> prev+1);
                break;
              }

              case 1:{
               
                setModalCont({title:"Incorrect", content:" Code not correct yet",buttonContent:[{buttonContent:"Ok",buttonType:'primary',onClick:()=>{SetisError(false)}}] });
                
                     
                if(currentTile?.type==="B")
                  {
                    const enemy =map?.enemies[currentTile?.enemyId!];
                    setHp(h => Math.max(0, h - (enemy?.attack)!));
                    setScore(prev => prev-15);
                  } else{
                      setHp(h => Math.max(0, h - 5));
                      setScore(prev => prev-15);
                  }
                handleErrorModal();
                break;
              }


            };
        if(hp==0){
          handleHpZero();
        }
      }
    }
  };

  if (!map) return <div style={{ padding: 16 }}>Loading map…</div>;

  return (
    <div className="gameContainer" data-title= "Welcome to the tutorial !" data-intro="This is the main game interface where you can see your status, interact with tiles, and manage your inventory.">
      <h1 >{map.name}</h1>

      <div className="InnerGameContainer" data-title= "Player Status" data-intro="This section displays your current position, health points (HP), attack power (ATK), and score. Keep an eye on these stats as you progress through the game!">
        <div>Position: <b>{tileKey}</b> / {(map.LastIndex).toString()}</div>
        <div>Player: <b>{user?.user}</b></div>
        <div>HP: <b>{hp}</b></div>
        <div>ATK: <b>{Atk}</b></div>
        <div>Score: <b>{Score}</b></div>
      </div>


 

      <div className='InnerGame-SecondContainer'>
        
        <input type='text' placeholder='Please Enter Number'
        value={dice ?? ""}
        onChange={(e)=> {
          const value = e.target.value;
          // Restrict input: only allow number for regular or branch codes (like L10, L11, etc.)
          if (value === "" || /^\d+$/.test(value) || /^[A-Za-z]+\d+$/.test(value)) {
            setDice(value);
          }
          // Reject any input that doesn't match these patterns
        }}
        className='positionInput'
        data-title= "Position Input" data-intro="Enter the position you want to move to in this input box. Make sure to enter a valid position based on your current location and the game's rules."
        ></input>

        <SelfButton onClick={()=> {handleBgmMute()}}>
          {Muted ? <MutedOutlined /> : <SoundOutlined/>}
        </SelfButton>

        {/* Turn-based Game Timeline */}
        <div className="timeline-container" data-title= "Game Timeline" data-intro="This section provides an overview of the game's timeline, including the current round, whose turn it is, and the order of players. If it's your turn, you'll see options to end your turn or roll the dice.">
          <div className="timeline-header">
            <h4>Game Timeline</h4>
            {!CurrentTurn && (
              <button 
                className="refresh-timeline-btn"
                onClick={() => requestCurrentGameState()}
                title="Refresh game state"
              >
                <IoMdRefresh />
              </button>
            )}
          </div>
          {!CurrentTurn ? (
            <div className="loading-state">
              <p>Loading game state...</p>
              <small>Connecting to game room and fetching current turn information.</small>
            </div>
          ) : (
            <>
              <div className="current-turn-info">
                <p><strong>Round:</strong> {CurrentTurn?.round || 1}</p>
                <p><strong>Current Turn:</strong> {
                  CurrentTurn?.turnOrder && CurrentTurn?.playersName && CurrentTurn?.currentTurn !== undefined
                    ? (() => {
                        const currentSocketId = CurrentTurn.turnOrder[CurrentTurn.currentTurn];
                        const playerIndex = CurrentTurn.players?.indexOf(currentSocketId) ?? -1;
                        return playerIndex !== -1 ? CurrentTurn.playersName[playerIndex] : 'Unknown';
                      })()
                    : 'Loading...'
                }</p>
                <p><strong>Is Your Turn:</strong> {isMyTurn() ? 
                <>
                 'Yes' 
                <Countdown 
                  key={`${CurrentTurn?.round}-${CurrentTurn?.currentTurn}-${CurrentTurn?.currentPlayer}`}
                  intervalTime={90} 
                  onTimeUp={()=>{
                    autoFireEndTurn();
                  }} 
                />
                </>
                : 'No'}</p>
              </div>
              
              <div className="player-order">
                <h5>Player Order:</h5>
                <div className="players-list">
                  {CurrentTurn?.turnOrder?.length > 0 ? (
                    CurrentTurn.turnOrder.map((socketId, idx) => {
                      const playerIndex = CurrentTurn.players?.indexOf(socketId) ?? -1;
                      const playerName = playerIndex !== -1 ? CurrentTurn.playersName?.[playerIndex] : 'Unknown';
                      return (
                        <div 
                          key={idx} 
                          className={`player-item ${idx === CurrentTurn?.currentTurn ? 'active-player' : ''}`}
                        >
                          <span className="player-number">{idx + 1}</span>
                          <span className="player-name">{playerName}</span>
                          {idx === CurrentTurn?.currentTurn && <span className="current-indicator">👑</span>}
                        </div>
                      );
                    })
                  ) : (
                    <p>No players found. Please wait for game initialization...</p>
                  )}
                </div>
              </div>
            </>
          )}

          {isMyTurn() && (
            <div className="turn-actions">
              <button 
                className="next-turn-btn"
                onClick={()=>{nextTurn(), SkillCoolDownEffect(),setisSucced(1);setCodeInput("#Start Here ! The Last Input No need backslash !")}}
                // disabled={isDisable()}
              >
                End Turn
              </button>
              
              <button
            onClick={()=>{rollPosition(),ClickDice()}}
            disabled={isDisable()}
            >
            Roll Dice
            </button>
          {dice !== null && <span style={{marginLeft:'1.2rem'}}>You rolled: <b>{dice}</b></span>}
            </div>
            )}
        </div>
      </div>

      {/* EventCard */}
      <div className="EventCard" data-title= "Tile Event" data-intro="This section displays information about the current tile you are on. Depending on the type of tile, you may encounter enemies, find loot, or face other events. Pay attention to the details provided here to make informed decisions during your turn.">
        <h3>Tile Event</h3>
        {!currentTile && <p>Nothing here.</p>}
        {currentTile && (
          <>
            <p>Type: <b>{currentTile.type}</b></p>
            {currentTile.description && <p>{currentTile.description}</p>}

            {currentTile.type === 'E' && currentTile.enemyId && (
        <div style={{marginTop:'0.5rem'}} className='enemy-container-box'>
                <img src={`/Enemy/${map.enemies[currentTile.enemyId].styleImg}`} alt={map.enemies[currentTile.enemyId].name} 
                  style={{width:'100px', height:'100px',userSelect:'none',outline:'none'}} 
                  draggable={false}
                />
                <div className='enemy-detail-box'>
                    <HealthBar current={enemyHp} maxHealth={map.enemies[currentTile.enemyId].hp}/> 
                    <p style={{textAlign:'center', alignItems:'center'}}>Enemy: <b>{map.enemies[currentTile.enemyId].name}</b></p>  
                    <p style={{display:'flex', flexDirection:'row', justifyContent:'center',alignContent:'center', textAlign:'center'}}> <img src='/Icon/Atk_Icon.png' style={{userSelect:"none", outline:"none"}} draggable={false}></img> ATK: {map.enemies[currentTile.enemyId].attack}</p>
                </div>
               
              </div>
            )}

            {currentTile.type === 'C' && currentTile.lootTable && (
              <p style={{marginTop:'0.5rem'}}>🎁 You found something from <b>{currentTile.lootTable}</b>!</p>
            )}

            {currentTile.type === 'B' && currentTile.enemyId &&(
          <div style={{marginTop:'0.5rem'}} className='enemy-container-box'>
                <img src={`/Enemy/${map.enemies[currentTile.enemyId].styleImg}`} alt={map.enemies[currentTile.enemyId].name} 
                  style={{width:'100px', height:'100px',userSelect:'none',outline:'none'}} 
                  draggable={false}
                />
                <div className='enemy-detail-box'>
                    <HealthBar current={enemyHp} maxHealth={map.enemies[currentTile.enemyId].hp}/> 
                    <p style={{textAlign:'center', alignItems:'center'}}>Enemy: <b>{map.enemies[currentTile.enemyId].name}</b></p>  
                    <p style={{display:'flex', flexDirection:'row', justifyContent:'center',alignContent:'center', textAlign:'center'}}> <img src='/Icon/Atk_Icon.png' style={{userSelect:"none", outline:"none"}} draggable={false}></img> ATK: {map.enemies[currentTile.enemyId].attack}</p>
                </div>
               
              </div>
            )}
          </>
        )}
      </div>

      {/* Question (MCQ / Code) */}
      {quiz.kind === 'mcq' && (
        <div className="McqCard">
          <h4>Quiz</h4>
          <p>{quiz.q}</p>
          <div className="McqInnerCard">
            {quiz.a.map((opt, i) => (
              <button key={i} disabled={isSucced==0}
                onClick={() => answerMcq(i)}>
                {i + 1}. {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {quiz.kind === 'none' && (
        <div className="McqCard">
          <div className="McqInnerCard">
            <h3 className='none-h'>You're All Done !/ Nothing Here !</h3>
          </div>
        </div>
      )}

      {quiz.kind === 'code' && (
        <div className="codeCard">
          <h4 >Python Challenge</h4>
          <p className="preCode">{quiz.prompt}</p>
          <Editor
            className="EditorClass"
            height="200px"
            value={codeInput}
            onChange={(value)=>setCodeInput(value|| "")}
            defaultLanguage='python'
            theme='vs-dark'
          />
          <button onClick={runPython} disabled={isSucced==0} >Run</button>

          {/* Runtime For Python Compiler */}
          {skResult === null && codeInput && (
            <div style={{marginTop:'1rem'}}>
              <PythonRunner key={codeInput + Math.random()} code={codeInput} onFinish={onSkFinish} />


            </div>
          )}

          {skResult !== null && (
            <div className="codeResult">
              <p>Output:</p>
        
              <pre className='prefirst'>{skResult.out || "(NO OUTPUT)"}</pre>
              {skResult.err && (
                <>
                  <p className="fontP">Error:</p>
                  <pre className="preSec">{skResult.err}</pre>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Backpack & Equipment Areas*/}
      <div className='backWarpper' data-title= "Inventory & Equipment" data-intro="This section allows you to manage your inventory and equipment. You can view the items you have collected, use them, and see the details of your equipped items. Click on an item to see more information or to use it during your turn.">
        <h4>Equipment</h4>
        <div className='equipmentWarpper' data-intro="Last! Good Luck !">
          <ul>
            {equip.map((eq,idx)=><li key={idx} style={{position:'relative'}}
            onClick={()=>onClickEquip(eq)} className={SkillsUsed.find(skill=> skill.Cooldown!==0 && skill.usedSkill===eq)? "cooldown-box":""}
            >
              {SkillsUsed.find(skill=> skill.Cooldown!==0 && skill.usedSkill===eq) && (
                <>
                 <div className='cooldown-ani'>
                  </div>
                  <span className='cooldown-time'>{SkillsUsed.find(skill=> skill.Cooldown!==0 && skill.usedSkill===eq)?.Cooldown}</span>
                </>
               
              )}

              {eq}
            </li>)}
          </ul>
        </div>



        <h4>Inventory</h4>
        {inventory.length === 0 ? <p>(empty)</p> : (
          <div className='backInner'>
            <ul className='inv-warp'>
              {inventory.map((it, i) => <li key={i}>
                  {it.itemType === "Loot" ? (
                    <div className='Inner-InvBack'>
                    <details>
                      <summary>
                        {it.items}
                      </summary>
                      <p>{map.lootEffects[it.items]?.description}</p>
                    </details>
                    <p className={`badge-inv ${map.lootEffects[it.items]?.type}`} >{map.lootEffects[it.items]?.type}</p>
                    <a className="useBack"onClick={()=>{handleInventoryClick(it.items);}}>Use</a>
                </div>
                  ):
                  ( <div>
                       <h5>CARDS AVAILABLE</h5>

                       <div className='Inner-InvBack-Cards'>
                          <details>
                            <summary>
                              {it.items}
                            </summary>
                            <p>{map.EquipCard.find(card=> card.name === it.items)?.description ?? "NAN"}</p>
                          </details>
                          <p className={`badge-inv ${map.EquipCard.find(card=> card.name === it.items)?.type ?? ""}`} >{map.EquipCard.find(card=> card.name === it.items)?.type ?? ""}</p>
                          <a className="useBack"onClick={()=>{handleInventoryClick(it.items);}}>Use</a>


                       </div>
                  </div>)
                  
                }
                </li>)}
                
            </ul>
           
          </div>
        )}

        <ModalForm
            title= "Use Inventory Item"
            open={open}
            onCancel={handleModalCancel}
            onOk={()=>setIsScanning(false)}
            footer= {
              <SelfButton type='danger' onClick={()=>{setIsScanning(false), setOpen(false)}}>Cancel</SelfButton>
            }
            multi={true}
            >
              <ModalForm.Page>
                <div>
                  {inventory.find(inv => (inv.itemType === "Card" || inv.items === "Gold") && inv.items === useInv) ? (
                    <div>
                    <p>Are you sure to use <b>{useInv}</b> ? <br/> Please Pick a {useInv} Card !</p>
                    <SelfButton type="primary" onClick={() =>{InventoryOk(useInv)}} >Confirm</SelfButton>
                  </div>

                  ): (

                    <>
                      <p>Scan QR Code to use <b>{useInv}</b> </p>
                      <SelfButton onClick={()=> setIsScanning(true)} disabled={isScanning}>Start Scanning</SelfButton>
                      {isScanning && <Scanner onScan={async (result)=>{
                          scanResultRef.current = result[0].rawValue;
                          console.log("[DEBUG] SCAN RESULT", scanResultRef.current);
                          setIsScanning(false);
                          handleAuthInv(scanResultRef.current);
                      }}>
                        </Scanner>}
                    </>
                  )}
                 
                    
                </div>
                  
              
              </ModalForm.Page>
                    
              <ModalForm.Page>
                {scanResult === "ERR"? (
                  <div>
                    <p style={{color:'red'}}>Authentication Failed !</p>
                    <p>The scanned code does not match the item. Please try again.</p>
                  </div>
                ):(
                  <div>
                    <p>Scan Result: <b>{scanResult}</b></p>
                    <SelfButton type="secondary" onClick={() =>{InventoryOk(scanResultRef.current)}} >Confirm</SelfButton>
                  </div>
                  
                )}
              </ModalForm.Page>
              

        </ModalForm>


          {/* <Modal
              title= "Do You Want to use this items ?"
              open={open}
              onCancel={handleModalCancel}
              onOk={()=>useInv&&InventoryOk(useInv)}
              width={{
                xs: '90%',
                sm: '80%',
                md: '70%',
                lg: '60%',
                xl: '50%',
                xxl: '40%',
              }}
              >
                <p></p>
          </Modal> */}

          <Modal
            title= "Equipment Details"
            open={eModalOpen}
            onCancel={handleModalCancel}
            onOk={()=> setEModalOpen(false)}
            footer={[
              <Button type='primary' onClick={()=>setEModalOpen(false)}>
                Close
              </Button>,
      
              EquipDet.find(det=> det.includes('Cooldown')) &&(
                <Button type='dashed' onClick={()=> {setUsingSkills(EquipDet), setEModalOpen(false)}}>
                  Use Skill
                </Button>
              )]
            }

            width={{
              xs: '90%',
              sm: '80%',
              md: '70%',
              lg: '60%',
              xl: '50%',
              xxl: '40%',
            }}
          >
             
              <ul>
                 {EquipDet.map((det,idx)=>(
                <li key={idx} style={{whiteSpace:'nowrap',padding:'0.5rem'}}>{det}</li>
               ))
              }
              </ul>
              
          </Modal>
          
            <ModalForm
              title={ModalCont?.title ?? ""}
              onOk={()=> SetisError(false)}
              onCancel={()=> SetisError(false)}
              open={isError}
              footer={
                ModalCont?.buttonContent ? 
                  // @ts-ignore
                  ModalCont.buttonContent.map((cont,idx)=>(
                    <SelfButton key={idx} type={ ModalCont?.buttonContent?.[idx]?.buttonType ?? "primary"} onClick={()=>ModalCont?.buttonContent?.[idx]?.onClick?.()}>
                      {ModalCont?.buttonContent?.[idx]?.buttonContent ?? ""}
                    </SelfButton>
                  )):null
              }
            >
              <p>{ModalCont?.content ?? ""}</p>
            
            </ModalForm>
              
            


      </div>
    </div>
  );
}

