import { useEffect,useRef, useState } from "react";

declare global {
  interface Window {
    Sk: any;
  }
}

type Props={
    code: string;
    onFinish?:(ok:boolean, output:string, err?:string) => void;
}

const SKULPT_URL = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js';
const SKULPT_STD = 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js';


export default function PythonRunner({code, onFinish}:Props){

    const [ready, setReady] = useState<boolean>(false);
    const outRef= useRef<string>("");

    useEffect(()=>{
        const hasRunner = !!window.Sk;
        if(hasRunner){
            setReady(true);
            return;   
        }

        const scr1= document.createElement('script');
        scr1.src= SKULPT_URL;
        scr1.onload= ()=>{
            const scr2 = document.createElement('script');
            scr2.src= SKULPT_STD;
            scr2.onload=()=>{
                setReady(true);
            }
            document.body.appendChild(scr2);
        
        };
        document.body.appendChild(scr1);

    },[]);

    useEffect(()=>{
        if(!ready || !code) return;

        outRef.current="";

        const run= async ()=>{
            const {Sk} = window;
            try{
                
                Sk.configure({
                    output: (text:string)=>{
                        outRef.current+=text;
                    },

                    read:(x:string) =>{
                        if(Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] ===undefined){
                            throw new Error(`File ${x} not found`);
                        };

                        return Sk.builtinFiles['files'][x];
                    },

                });

                const program = Sk.misceval.asyncToPromise(()=> Sk.importMainWithBody('<stdin>', false, code, true));
                await program;
                onFinish?.(true, outRef.current);
            }catch(e:any){
                let msg =  e.toString();
                if(e instanceof Sk.builtin.BaseException){
                    msg= e.toString();
                }

                outRef.current += "\n"+ msg;
                onFinish?.(false, outRef.current, e.message);
            
            }
            };
            run();
        },[ready, code, onFinish]);

        return (
            <div style={{fontSize:'0.625rem'}}>
                {!ready ? <p>Loading Python Runtime....</p>:<p>Running...</p>}
            </div>
        );

    }