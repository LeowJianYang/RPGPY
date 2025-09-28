import { useEffect, useMemo, useState, useRef } from 'react';
import type { MapJSON, TileType, LootTypes, SkillsType } from '../GameTypes'
import PythonRunner from '../PythonRunner';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import "../css/game.css";
import { Button, Modal } from 'antd';
import { useUserStore } from '../../components/UserStore';
import  { ModalForm,SelfButton } from '../components/ErrorModal';
import type { ModalPropsType } from '../components/ButtonCompo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { socket } from '../socket';
import { useToast } from '../components/Toast';
import {BgmManager} from '../components/BgmManager';
import { MutedOutlined, SoundOutlined } from '@ant-design/icons';
import HealthBar from '../components/HeathBar';
import {useSessionStore} from '../../components/IDStore';



type QuizState =
  | { kind: 'none' }
  | { kind: 'mcq'; q: string; a: string[]; correct: number }
  | { kind: 'code'; prompt: string; starter: string; expected:string };

export default function Game() {
   const bgm = useMemo(() => new BgmManager(), []);
  const [map, setMap] = useState<MapJSON | null>(null);
  const [position, setPosition] = useState<string|number>(1);
  const [hp, setHp] = useState<number>(0);
  const [inventory, setInventory] = useState<string[]>([]);
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
  const [roles, setRoles]= useState<{roleName:string,description:string, ATK:number, HP:number, Skills:string[]}[]>([]);
  const [Muted, setMuted] = useState(bgm.isBgmMuted());
  const [SkillsUsed, setSkillsUsed] = useState<{Cooldown:number, duration?:number, usedSkill:string}[]>([]);
  const {notify} = useToast();
  const roomCode = searchParams.get("roomCode") ?? "NONE_AVAILABLE";
  const mapid= searchParams.get("mapid") ?? "NONE_AVAILABLE";
  const userid= searchParams.get("userid") ?? "NONE_AVAILABLE";
  const EnteringBranch = useRef(false);
  const branchCodeRef = useRef<string>("");
  const {ssid} = useSessionStore();
 
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
        setMap(res.data);
        }).catch(console.error);
    
    bgm.play('/Music/Main-flow.ogg', true);
  
 
  }, []);

  useEffect(()=>{

    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected', user?.uid);
      socket.emit('join-room', {roomCode, user: user?.user});
    });

    if (socket.connected) {
        console.log('Socket already connected, joining room:', roomCode, user?.uid);
        socket.emit('join-room', {roomCode, user: user?.user});
    }

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

    return () => {
      socket.off('connect');
      socket.off('room-joined');
      socket.off('turn-order');
      socket.disconnect();
      
    }
  },[socket])

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
        setRoles([{
          roleName: randomKey,
          description: rolesArray.description,
          ATK: rolesArray.ATK,
          HP: rolesArray.HP,
          Skills: rolesArray.Skills
      }]);
      setHp(rolesArray.HP);
      setAtk(rolesArray.ATK);

      setEquip(["W","A",roles[0]?.Skills[0]??"S"]);
      setEquipDet([`Description: ${map?.SkillsSet[rolesArray.Skills[0]]?.description}`, `Type: ${map?.SkillsSet[rolesArray.Skills[0]]?.type}`,`Damage: ${map?.SkillsSet[rolesArray.Skills[0]]?.damage??0}`,`Heal: ${map?.SkillsSet[rolesArray.Skills[0]]?.heal??0}`,`HP: ${map?.SkillsSet[rolesArray.Skills[0]]?.HP??0}`,`Duration: ${map?.SkillsSet[rolesArray.Skills[0]]?.duration??0}`, `Cooldown: ${map?.SkillsSet[rolesArray.Skills[0]]?.Cooldown}`])
      console.log("[DEBUG] EQUIP SET",EquipDet);
      console.log("[DEBUG] ROLES", JSON.stringify(roles));
    } else{
       setHp(map?.Player.HP ?? 0);
      setAtk(map?.Player.ATK??0);
      setEquip(["W","A","S"])
      console.log(hp+Atk)
    }
    

  },[map])

  // Split the Number and String
  function keySplit(key:string){
    const numberStr = key.match(/^([A-Za-z]+)(\d+)$/);  // 0 means not find anything, 1 means String, 2 means number
    const num = numberStr ? Number(numberStr[2]) : null;
    const letter = numberStr ? numberStr[1] : null;
    return {
      prefix: letter,
      suffix: num
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

  // check is turn or not
  const isMyTurn = () => {
    if (!CurrentTurn || !user) return false;
    return CurrentTurn.currentPlayer === socket.id;
  };



  // Encoding the current position Event 
  const {prefix,suffix} = keySplit(position.toString());
  const tileKey = useMemo(() => `${prefix ===null ? "": prefix}${suffix??position.toString().padStart(2, '0')}`, [position]);
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
         // 0 succed >0 not succeed
             setisSucced(1);
            const pick = pool[Math.floor(Math.random()*pool.length)];
            setQuiz({ kind:"mcq",q:pick.q, a:pick.a, correct:pick.correct as number });
        break;
      }
      case 'C': {
        bgm.stop();
        bgm.play('/Music/Chest001.ogg', true);
        const table = map.lootTables[currentTile.lootTable!];
        const drop = table[Math.floor(Math.random() * table.length)];
        setInventory(items => [...items, drop]);
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

      default:
        setQuiz({ kind: 'none' });
    }
  }, [map, currentTile]);


//Position Control
  const rollPosition = async () =>{
    if (!map) return;

    const {prefix,suffix} = keySplit(dice?.toString() ?? "");


    // const nextStep=map.tiles[`${prefix === null ? "":prefix}${suffix??+1}`]; 
    const NormTileLogic = async ()=>{
      
      const next = Math.min(Number(dice), 40);
      console.log("[DEBUG] NORM IN ROLL POSITION", next);

      if(Number.isNaN(next)){
        throw new Error ("Invalid Tiles")
      } else{
        setPosition(next);
        await http.post('/map/progress-update', { mapId:mapid, userId: Number(userid), score:Score, roomCode:roomCode }).catch(() => {
          console.error("[DEBUG] ERROR IN ROLL POSITION-NORM");
        });
        console.log("[DEBUG] ROLL POSITION", currentTile?.type); 
      }

     
    }

    const specialTileLogic= async ()=>{
        
        const numberStr = (dice as string)?.match(/^([A-Za-z]+)(\d+)$/);  // 0 means not find anything, 1 means String, 2 means number
        const num = numberStr ? Number(numberStr[2]) : null;
        const letter = numberStr ? numberStr[1] : null;
        

        const next= `${letter}${Math.min((num ?? 0), 40)}` 
        console.log("[DEBUG] SPECIAL IN ROLL POSITION", branchCodeRef.current);

        // if (letter !== branchCodeRef.current){
        //   throw new Error ("Branch Code Not Match")
        // }

        if(!map.tiles[next]?.type || letter !== branchCodeRef.current){
          throw new Error ("Invalid Tiles")
          
        } else{
          
        setPosition(next);
        console.log("[DEBUG] ELSE IN ROLL POSITION", next); //roomid userid score
        await http.post('/map/progress-update', { mapId: mapid, userId: Number(userid), score:Score, roomCode:roomCode }).catch(() => {
          console.error("[DEBUG] ERROR IN ROLL POSITION- SPECIAL");
        });
        }

    }

    try {
        
      if (currentTile?.branchExpected && prefix !== null && !currentTile.branchQuit) {
      // Entering Branch
      const expected = currentTile?.branchExpected;
      const target = `${prefix}${suffix ?? ""}`;
      console.log("[DEBUG] EXPECTED:", expected, "TARGET:", target);

      if (expected !== target) {
        throw new Error("Invalid Branch Code");
      }
      
      if(!EnteringBranch.current){
        EnteringBranch.current=true;
        branchCodeRef.current= prefix ?? "";
        console.log("[DEBUG] BRANCH SET", prefix);
      }

      safeCall(()=>specialTileLogic());
      console.log("[DEBUG] First T");
      


      } else if (!currentTile?.branchExpected && prefix !== null && !currentTile?.branchQuit && currentTile?.isBranch===true && EnteringBranch.current) {
        // Exit Tile

        safeCall(()=>specialTileLogic());
        console.log("[DEBUG] Second T");


      } else if (currentTile?.type!=="R" || Number(dice)>=Number(currentTile.branchQuit)) {
        // Normal Tile
        EnteringBranch.current=false;
        branchCodeRef.current="";
        safeCall(()=>NormTileLogic());
        console.log("[DEBUG] Third T");
      } else{
        console.log(dice);
        console.log("ERR"+ currentTile.branchQuit);
        setModalCont({title:"Opps!", content:"Invalid Number/Steps Entered",buttonContent:[
          
          {buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}}
        
        ]});
        handleErrorModal();
      }
    } catch (err:any){
        
      setModalCont({title:"Opps!", content:err instanceof Error ? err.message: String(err) ,buttonContent:[
          {buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}},
        ]});
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
      if(currentTile?.type==="E")
      {
        setEnemyHp(h=>{
          const newHp= Math.max(0,h-Atk);
          if (newHp===0){
            setisSucced(0);      
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
      const idx = newInv.indexOf(items);
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

  // Check the position is illegal or not
  const isDisable = ()=>{

 //disabled={position as unknown as number >= 40 || dice === null || (currentTile?.type === "R" ? (keySplit(dice?.toString() ?? "").suffix?? 0 >= Number(currentTile?.branchQuit)):false)}


    if (position as unknown as number >=40) return true;

    if (dice === null || dice === "") return true;

    if (!currentTile) return true;

    if((Number(dice) ?? 0) > (Number(position)+6)) return true;


    if ((Number(dice) ?? 0) <= Number(position)) return true;
     
    if (currentTile?.quizPool != undefined && isSucced!=0) return true;

    if (currentTile?.type === "R"){

      const branchNum = Number(currentTile?.branchQuit ?? 0); // 40
      const {suffix} = keySplit(dice.toString());
      const {suffix:currSuf} = keySplit(position.toString());
      console.log("CurrS:", currSuf);
      console.log("Suff:",suffix);
      
    
      if ((suffix ?? 0) > ((currSuf ?? 0)+6) ) return true //R10-cursf x R17-suff
      

      if ((suffix ?? 0) >= branchNum) return false
      
      
      return true;
    } 

   
   
    return false;
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
        if(data.winner === user){

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

  

  const onSkFinish = (ok: boolean, output: string, error?: string) => {
    setSkResult({ ok, out: output, err: error });
    if (quiz.kind === 'code') {
      // If output is match with the expected return result
      if (ok && output.trim().length > 0 && output===(quiz.expected)) {
        notify('success',"Correct Answer !", "You answered correctly and dealt damage to the enemy.", 'top');
         setisSucced(0);
          setScore(prev => prev + 25);
          if(currentTile?.type==="E" || currentTile?.type==="B"){
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
    <div className="gameContainer">
      <h1 >{map.name}</h1>

      <div className="InnerGameContainer">
        <div>Position: <b>{tileKey}</b> / 40</div>
        <div>Player: <b>{user?.user}</b></div>
        <div>HP: <b>{hp}</b></div>
        <div>ATK: <b>{Atk}</b></div>
        <div>Score: <b>{Score}</b></div>
      </div>


 

      <div className='InnerGame-SecondContainer'>
        
        <input type='text' placeholder='Please Enter Number'
        value={dice ?? ""}
        onChange={(e)=> setDice(e.target.value)}
        className='positionInput'
        
        ></input>

        <SelfButton onClick={()=> {handleBgmMute()}}>
          {Muted ? <MutedOutlined /> : <SoundOutlined/>}
        </SelfButton>

        {/* Turn-based Game Timeline */}
        <div className="timeline-container">
          <h4>Game Timeline</h4>
          <div className="current-turn-info">
            <p><strong>Round:</strong> {CurrentTurn?.round || 1}</p>
            <p><strong>Current Turn:</strong> {
              CurrentTurn?.turnOrder && CurrentTurn?.playersName && CurrentTurn?.currentTurn !== undefined
                ? (() => {
                    const currentSocketId = CurrentTurn.turnOrder[CurrentTurn.currentTurn];
                    const playerIndex = CurrentTurn.players?.indexOf(currentSocketId) ?? -1;
                    return playerIndex !== -1 ? CurrentTurn.playersName[playerIndex] : 'Unknown';
                  })()
                : 'Unknown'
            }</p>
            <p><strong>Is Your Turn:</strong> {isMyTurn() ? '✅ Yes' : '❌ No'}</p>
          </div>
          
          <div className="player-order">
            <h5>Player Order:</h5>
            <div className="players-list">
              {CurrentTurn?.turnOrder.map((socketId, idx) => {
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
              }) || []}
            </div>
          </div>

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
            disabled={isDisable() && isClicked>=1}
            >
            Roll Dice
            </button>
          {dice !== null && <span style={{marginLeft:'1.2rem'}}>You rolled: <b>{dice}</b></span>}
            </div>
            )}
        </div>
      </div>

      {/* EventCard */}
      <div className="EventCard">
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
      <div className='backWarpper'>
        <h4>Equipment</h4>
        <div className='equipmentWarpper'>
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
                
                <div className='Inner-InvBack'>
                  <details>
                    <summary>
                      {it}
                    </summary>
                    <p>{map.lootEffects[it]?.description}</p>
                  </details>
                  <p className={`badge-inv ${map.lootEffects[it]?.type}`} >{map.lootEffects[it]?.type}</p>
                  <a className="useBack"onClick={()=>{handleInventoryClick(it);}}>Use</a>
                </div>
                
                </li>)}
                
            </ul>
           
          </div>
        )}


          <Modal
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
                <p>This items will be used and might need answer an question !</p>
          </Modal>

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

