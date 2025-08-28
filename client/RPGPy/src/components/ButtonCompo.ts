import type { ReactNode } from "react";

export type ButtonType= "primary" | "dashed" | "danger" | "secondary";

export interface ButtonProps {
    type?:ButtonType;
    onClick?: ()=>void;
    children: React.ReactNode;
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
    width?: number | string | undefined;
}