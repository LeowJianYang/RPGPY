import {create} from "zustand";

type SessionState ={
    ssid: string | null;
    setSsid: (id:string) => void;
}

export const useSessionStore = create<SessionState>((set)=>({
    ssid: null,
    setSsid: (id:string) => set({ssid:id})
}));