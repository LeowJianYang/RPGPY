
import React from "react";
import type { ButtonProps, ModalFormProps } from "./ButtonCompo";
import "../css/SelfBtn.css"
import {useState, useEffect} from "react";


export const SelfButton: React.FC<ButtonProps> = ({type= "primary",onClick, children})=>{

    return (
        <button className={`btn ${type}`} onClick={onClick}>
            {children}
        </button>
    )
}



export const ModalForm: React.FC<ModalFormProps> = ({title,onOk,onCancel,children,footer, open})=>{
    const [visible, setVisible] = useState(false);
    
    useEffect(()=>{
        if (open){
            setVisible(true)
        } 
        else{
            const timer= setTimeout(()=> setVisible(false),300)
            return ()=> clearTimeout(timer)
        } 
    },[open])

    if (!visible) return null;
    
    return (
            <div className={`ModalOverlay ${open? "fade-in" : "fade-out"}`} >
                <div className={`ModalForm ${open? "pop-in" : "pop-out"}`}>
                    
                    <div>
                        <h1>{title}</h1> 
                        {children}
                    </div>
                    <div className="ModalFooter">
                        {footer || footer ==="".trim() ?(
                            React.Children.toArray(footer).map((it, idx)=>(
                            <span key={idx}>{it}</span>
                            ))  
                        ):(
                            <>
                                <SelfButton onClick={onOk} type="primary" > OK</SelfButton>
                                <SelfButton onClick={onCancel} type="secondary" > Cancel</SelfButton>
                            </>
                        )}
                    </div>
            </div>
        </div>
       
    )
}


