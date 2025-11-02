import { CopyOutlined } from "@ant-design/icons";
import { useClipboard } from "./clipboard";
import { useToast } from "./Toast";
import { useEffect } from "react";


export default function CopyButton({textToCopy}: {textToCopy: string}) {
    const [copy, status] = useClipboard();
    const {notify} = useToast();

    const handleCopy = async () =>{
        await copy(textToCopy);
    };

 
    useEffect(()=>{
            
        switch(status){
            case 'copied':{
                notify('success','Copied',"Text copied to clipboard!", "topRight");
                break;
            };

            case 'error':{
                notify('error','Failed to Copy',"Failed to copy text to clipboard.", "topRight");
                break;
            };
            
            default:{
                 // Idle State - do nothing
                 break;
            };
        }
    },[status,notify]);


    return (
        <div>
            <CopyOutlined onClick={()=>{handleCopy()}}
             disabled={status === 'copied'}/>
        </div>
    )

};