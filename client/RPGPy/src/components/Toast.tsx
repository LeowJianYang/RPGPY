import React, {createContext,useContext} from "react";
import { notification} from 'antd';


export type NotificationType= 'success'| 'error' | 'info' | 'warning';
type PlacementType="top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight" | undefined

type ToastContextType={
    notify: (type:NotificationType, message: string, description: string,placement:PlacementType) => void;
}



const ToastContext = createContext<ToastContextType | null>(null);

export const Toast:React.FC<{children: React.ReactNode}> = ({children})=>{
    const [api, contextHolder] = notification.useNotification();

    const notify= (type: NotificationType, message: string, description: string, placement:PlacementType) =>{
        api[type]({
            message:message,
            description:description,
            placement: placement
        });
    };

    return (
       <ToastContext.Provider value={{notify}}>
            {contextHolder}
            {children}
       </ToastContext.Provider>
    )
};

export const useToast = () =>{
    const context = useContext(ToastContext);
    if(!context){
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}