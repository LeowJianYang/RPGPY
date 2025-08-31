
import React from "react";
import type { ButtonProps, ModalFormProps } from "./ButtonCompo";
import "../css/SelfBtn.css"
import {useState, useEffect} from "react";


export const SelfButton: React.FC<ButtonProps> = ({type= "primary",onClick, children, disabled=false})=>{

    return (
        <button className={`btn ${type}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    )
}



export const ModalForm: React.FC<ModalFormProps> &{Page: React.FC<{children : React.ReactNode}>}= ({title,onOk,onCancel,children,footer, open,multi})=>{
    const [visible, setVisible] = useState(false);
    const [page, setPage] = useState<number>(0);

    useEffect(()=>{
        if (open){
            setVisible(true)
            setPage(0)
        } 
        else{
            const timer= setTimeout(()=> setVisible(false),300)
            return ()=> clearTimeout(timer)
        } 
    },[open])

    if (!visible) return null;
        const pages =React.Children.toArray(children);
    
    return (
            <div className={`ModalOverlay ${open? "fade-in" : "fade-out"}`} >
                <div className={`ModalForm ${open? "pop-in" : "pop-out"}`}>
                    
                    <div>
                        <h1>{title}</h1> 
                        <div> {pages[page]}</div>
                    </div>
                    <div className="ModalFooter">
                        {footer || footer ==="".trim() ?(
                            React.Children.toArray(footer).map((it, idx)=>(
                            <>
                                <span key={idx}>{it}</span>
                                {multi && (
                                    page>0 ? <>
                                        <SelfButton onClick={()=>setPage(page-1)} type="secondary"> Previous </SelfButton>
                                        
                                    </>: page < pages.length -1 ? (
                                        <SelfButton onClick={()=>setPage(page+1)} type="secondary"> Next </SelfButton>
                                    ):null
                                )}
                            </>
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


ModalForm.Page = ({ children }) => <>{children}</>;