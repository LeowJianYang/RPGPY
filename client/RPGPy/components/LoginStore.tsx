import {create} from 'zustand'

type LoginCheck= {
    isLogin: boolean,
    setIsLogin: (isLogin: boolean) => void;
}

export const useLoginCheck = create<LoginCheck>((set) => ({
    isLogin: false,
    setIsLogin:(data)=> set({isLogin:data}),
}));