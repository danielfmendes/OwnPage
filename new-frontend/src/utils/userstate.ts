import {create} from "zustand";
import type {User} from "@/models/api";

interface UserState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({user}),
    clearUser: () => set({user: null}),
    setIsLoading: (isLoading) => set({isLoading}),
}));
