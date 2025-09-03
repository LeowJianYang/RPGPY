import {create} from 'zustand';
import { persist } from 'zustand/middleware';

type UserType = {
    user: string | null;
    setUser:(user:string|null) =>void;
}

export const useUserStore = create<UserType>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user })
    }),
    {
      name: 'user-storage' // name of the item in the storage (must be unique)
    }
  )
);