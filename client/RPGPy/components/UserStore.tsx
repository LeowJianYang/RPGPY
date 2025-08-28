import {create} from 'zustand';

type UserType = {
    user: string | null;
    setUser:(user:string|null) =>void;
}

export const useUserStore = create<UserType>((set) => ({
    user: null,
    setUser: (data) => set({user:data})
}))