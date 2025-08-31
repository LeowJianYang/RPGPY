import type { ReactNode } from "react";

export type ButtonType= "primary" | "dashed" | "danger" | "secondary";



export type ButtonContent={
  buttonContent?:string,
  buttonType?:ButtonType,
  onClick?:()=>void,
}

 //buttonContent:[{buttonContent:"Back To Homepage",buttonType:'danger', onClick:()=>{window.location.href="/dashboard"}}

/** 
 * ModalPropsType defines the properties for a modal dialog:
  title: The Title of the Modal
  content: The content of the Modal 
  buttonContent: An array of button content objects, each containing:
    - buttonContent: The text to display on the button
    - buttonType: The type of the button (e.g., 'primary', 'dashed', 'danger', 'secondary')
    - onClick: The function to execute when the button is clicked

 * 
*/
export type ModalPropsType ={title:string, content?:string, buttonContent?:ButtonContent[]}



export interface ButtonProps {
    type?:ButtonType;
    onClick?: ()=>void;
    children: React.ReactNode;
    disabled?: boolean;
}


export interface ModalFormProps {
    onCancel?: ()=>void;
    onOk?: ()=>void;
    onClose?: ()=>void;
    open?: boolean;
    title: string;
    close?:boolean;
    footer?: ReactNode | ReactNode[];
    children: React.ReactNode;
    multi?:boolean;
    width?: number | string | undefined;
}