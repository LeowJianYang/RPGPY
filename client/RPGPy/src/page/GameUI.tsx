import { useEffect, useMemo, useState } from 'react';
import type { MapJSON, TileType, LootTypes } from '../GameTypes'
import PythonRunner from '../PythonRunner';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import "../css/game.css";
import { Button, Modal } from 'antd';
import { useUserStore } from '../../components/UserStore';
import  { ModalForm,SelfButton } from '../components/ErrorModal';
import type { ModalPropsType } from '../components/ButtonCompo';




type QuizState =
  | { kind: 'none' }
  | { kind: 'mcq'; q: string; a: string[]; correct: number }
  | { kind: 'code'; prompt: string; starter: string; expected:string };

export default function Game() {
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

    const http = axios.create({
        baseURL: 'http://localhost:3000',
        withCredentials:true
    })


  // Run MAP001 with QR code
  useEffect(() => {

      axios.get("http://localhost:3000/authCookie", {withCredentials:true}).then((res)=>{
        setUser(res.data.Username);
        console.log(res.data.user);
    })
    .catch((err)=>{
        console.log(err);
        window.location.href = "/login";
      })

      
        http.get('/map/Map001').then(res => {
        setMap(res.data);
        }).catch(console.error);
    
    
  
 
  }, []);
  

  useEffect(()=>{
    if(map?.Player){
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



  // Encoding the current position Event 
  const {prefix,suffix} = keySplit(position.toString());
  const tileKey = useMemo(() => `${prefix ===null ? "": prefix}${suffix??position.toString().padStart(2, '0')}`, [position]);
  const currentTile = useMemo(() => {
    if (!map) return null;
    setSkResult(null);
    setisSucced(0);
    return map.tiles[tileKey] || null;
  }, [map, tileKey]);

  // Refresh event on every tiles
  useEffect(() => {
    if (!map || !currentTile) {
      setQuiz({ kind: 'none' });
      return;
    }
    switch (currentTile.type as TileType) {
      case 'Q': {
        const pool = map.quizPools[currentTile.quizPool || ''] || [];
        if (pool.length === 0) {
          setQuiz({ kind: 'none' });
          return;
        }
        // 50% Prompt to MCQ or Code Questions
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
        const enemy = map.enemies[currentTile.enemyId!];
        // Enemy Encouter
        const pool= map.quizPools[currentTile.quizPool||""]|| [];
        setEnemyHp(enemy.hp);
         // 0 succed >0 not succeed
             setisSucced(1);
            const pick = pool[Math.floor(Math.random()*pool.length)];
            setQuiz({ kind:"mcq",q:pick.q, a:pick.a, correct:pick.correct as number });
        break;
      }
      case 'C': {
        const table = map.lootTables[currentTile.lootTable!];
        const drop = table[Math.floor(Math.random() * table.length)];
        setInventory(items => [...items, drop]);
        setQuiz({ kind: 'none' });
        break;
      }
      case 'B': {
        setisSucced(prev=>prev+1);
        const pool= map.quizPools[currentTile.quizPool||'' ] || [];

        const pick = pool[Math.floor(Math.random() * pool.length)];

        console.log("BOSS HERE !");

        setQuiz({ kind: 'code', prompt: pick.q, starter: 'print("...")' , expected: pool[0].expectedResult?? ""});
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
        if(currentTile.quizPool!=="python_code_questions"){
             setQuiz({
          kind: 'mcq',
          q: pick.q,
          a: pick.a,
          correct: pick.correct as number
          });
        }
        else{
          setQuiz({
            kind:"code",
            prompt: `Write Python to print the correct answer for:\n${pick.q}\n(Just print the final answer)`,
            starter: `# write your Python code here\n`,
            expected: pick.expectedResult?? ""
          })
          setCodeInput(`# write your Python code here\n`);
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

    const {prefix} = keySplit(dice?.toString() ?? "");


    // const nextStep=map.tiles[`${prefix === null ? "":prefix}${suffix??+1}`]; 
    const NormTileLogic = async ()=>{
      
      const next = Math.min(Number(dice), 40);
      console.log("[DEBUG] NORM IN ROLL POSITION", next);

      if(Number.isNaN(next)){
        throw new Error ("Invalid Tiles")
      } else{
        setPosition(next);
        await http.post('/map/progress', { mapId: map.mapId, position: next }).catch(() => {});
        console.log("[DEBUG] ROLL POSITION", currentTile?.type); 
      }

     
    }

    const specialTileLogic= async ()=>{
        
        const numberStr = (dice as string)?.match(/^([A-Za-z]+)(\d+)$/);  // 0 means not find anything, 1 means String, 2 means number
        const num = numberStr ? Number(numberStr[2]) : null;
        const letter = numberStr ? numberStr[1] : null;
        

        const next= `${letter}${Math.min((num ?? 0), 40)}` 
                   
        if(!map.tiles[next]?.type){
          throw new Error ("Invalid Tiles")
          
        } else{
          
        setPosition(next);
        console.log("[DEBUG] ELSE IN ROLL POSITION", next);
        await http.post('/map/progress', { mapId: map.mapId, position: next }).catch(() => {});
        }

    }

    try {
        
      if (currentTile?.branchExpected && prefix !== null && !currentTile.branchQuit) {
      // Entering Branch
      safeCall(()=>specialTileLogic());
      console.log("[DEBUG] First T");

      
      } else if (!currentTile?.branchExpected && prefix !== null && !currentTile?.branchQuit && currentTile?.type === "R") {
        // Exit Tile

        safeCall(()=>specialTileLogic());
        console.log("[DEBUG] Second T");


      } else if (currentTile?.type!=="R" || Number(dice)>=Number(currentTile.branchQuit)) {
        // Normal Tile
        safeCall(()=>NormTileLogic());
        console.log("[DEBUG] Third T");
      } else{
        console.log(dice);
        console.log("ERR"+ currentTile.branchQuit);
        setModalCont({title:"Opps!", content:"Invalid Number/Steps Entered",buttonContent:[
          
          {buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}},
          {buttonContent:"SecButton", buttonType:"secondary", onClick:()=>{console.warn("Enter Sec")}}
        
        ]});
        handleErrorModal();
      }
    } catch (err:any){
        
      setModalCont({title:"Opps!", content:err,buttonContent:[
          {buttonContent:"OK", buttonType:"primary", onClick:()=>{SetisError(false)}},
        ]});
        handleErrorModal();
    }

  
    
  }

  const handleErrorModal= ()=>{
    SetisError(true);
  }

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
    }
  }


  // Choosing MCQ Answer
  const answerMcq = (idx: number) => {
    if (quiz.kind !== 'mcq') return;
    const correct = idx === quiz.correct;
    if (correct) {
      alert('✅ Correct!');
      
      if(currentTile?.type==="E")
      {
        setEnemyHp(h=>{
          const newHp= Math.max(0,h-Atk);
          if (newHp===0){
            setisSucced(0);
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
                
                setModalCont({title:"Incorrect", content:"❌ Answer not correct yet",buttonContent:[{buttonContent:"Ok",buttonType:'primary',onClick:()=>{SetisError(false)}}] });
             
                if(currentTile?.type==="E")
                  {
                    const enemy =map?.enemies[currentTile?.enemyId!];
                    setHp(h => Math.max(0, h - (enemy?.attack)!));
                  } else{
                      setHp(h => Math.max(0, h - 5));
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
    

    switch(eff?.type as LootTypes){

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
          const Curr = map?.lootEffects[equip[0]].ATK as number;
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

      case 'Loot':{

        break;
      }

    }

    setOpen(false);


  }

  const handleHpZero =  ()=>{
    setModalCont({title:"Opps! You Lose", content:"You HP is ZERO !!", buttonContent:[{buttonContent:"Back To Homepage",buttonType:'danger', onClick:()=>{window.location.href="/dashboard"}}]});
    handleErrorModal();
  }

  

  const onClickEquip = (items:string)=>{
    setEModalOpen(true);
    console.log("[DEBUG] EQUIP"+items)

    const eff= map?.lootEffects[items] ;
    const effDesc = eff?.description as string;


    switch(eff?.type as LootTypes){

      case "Restock":{
        const effState= eff?.HP;
        setEquipDet([effDesc,effState as unknown as string])
        break;
      };

      case "Weapon":{
       const effState= eff?.ATK as number;
       setEquipDet([effDesc,effState as unknown as string])
        break;
      };

      case "Amour":{
        console.log("[DEBUG] AMOUR SECTION")
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

      const branchNum = Number(currentTile?.branchQuit ?? 0); // 10
      const {suffix} = keySplit(dice.toString());
      const {suffix:currSuf} = keySplit(position.toString());
      console.log("CurrS:", currSuf);
      console.log("Suff:",suffix);
      
      if ((suffix ?? 0) > ((currSuf ?? 0)+6) ) return true //R10-cursf x R17-suff
      if (dice ?? 0 >= branchNum  ) return false
      
      
      return true;
    } 

   
   
    return false;
  }

  

  

  const onSkFinish = (ok: boolean, output: string, error?: string) => {
    setSkResult({ ok, out: output, err: error });
    if (quiz.kind === 'code') {
      // If output is match with the expected return result
      if (ok && output.trim().length > 0 && output===(quiz.expected)) {
        alert('✅ Code challenge passed!');
         setisSucced(0);
        // setQuiz({ kind: 'none' });
      } else {
          
            switch (isSucced ==0 ? 0:1){
              case 0:{
                setisSucced(prev=> prev+1);
                break;
              }

              case 1:{
               
                setModalCont({title:"Incorrect", content:"❌ Code not correct yet",buttonContent:[{buttonContent:"Ok",buttonType:'primary',onClick:()=>{SetisError(false)}}] });
                setHp(h => Math.max(0, h - 5));
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
        <div>Player: <b>{user}</b></div>
        <div>HP: <b>{hp}</b></div>
        <div>ATK: <b>{Atk}</b></div>
      </div>


 

      <div className='InnerGame-SecondContainer'>
        
        <input type='text' placeholder='Please Enter Number'
        value={dice ?? ""}
        onChange={(e)=> setDice(e.target.value)}
        className='positionInput'
        
        ></input>
        
        <button
          onClick={rollPosition}
          disabled={isDisable()}
        >
          Roll Dice
        </button>
        {dice !== null && <span style={{marginLeft:'1.2rem'}}>You rolled: <b>{dice}</b></span>}
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
              <div style={{marginTop:'0.5rem'}}>
                <p>Enemy: <b>{map.enemies[currentTile.enemyId].name}</b></p>
                <p>HP: {enemyHp} | ATK: {map.enemies[currentTile.enemyId].attack}</p>
              </div>
            )}

            {currentTile.type === 'C' && currentTile.lootTable && (
              <p style={{marginTop:'0.5rem'}}>🎁 You found something from <b>{currentTile.lootTable}</b>!</p>
            )}

            {currentTile.type === 'B' && <p style={{fontWeight:600,marginBottom:'0.5rem'}}>Final Boss awaits…</p>}
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
            {equip.map((eq,idx)=><li key={idx}
            onClick={()=>onClickEquip(eq)}
            >
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
            footer={
              <Button type='primary' onClick={()=>setEModalOpen(false)}>
                Close
              </Button>
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
              <p>Description: {EquipDet[0]}</p>
              <p>Effect: {EquipDet[1]}</p>
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

