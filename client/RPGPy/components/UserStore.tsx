import {create} from 'zustand';
import { persist } from 'zustand/middleware';

export type UserData = {
    user: string | null;
    email: string | null;
    uid: number| string | null;
}


type UserType = {
  user: UserData | null;
  setUser:(user: UserData | null) => void;
}

export const useUserStore = create<UserType>()(
  persist(  
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-storage'
    }
  )
);
