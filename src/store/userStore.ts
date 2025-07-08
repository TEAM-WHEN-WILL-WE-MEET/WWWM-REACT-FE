import { create } from "zustand";
import { Schedule } from "./types";

interface UserState {
  name: string;
  id: string | null;
  firstLogin: boolean;
  userSchedule: Schedule[];

  // actions
  setUser: (name: string, id: string | null) => void;
  setUserInfo: (userName: string, isFirstLogin: boolean) => void;
  setFirstLogin: (value: boolean) => void;
  setUserSchedule: (schedule: Schedule[]) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: "",
  id: null,
  firstLogin: false,
  userSchedule: [],

  setUser: (name: string, id: string | null) => set({ name, id }),

  setUserInfo: (userName: string, isFirstLogin: boolean) =>
    set({ name: userName, firstLogin: isFirstLogin }),

  setFirstLogin: (value: boolean) => set({ firstLogin: value }),

  setUserSchedule: (schedule: Schedule[]) => set({ userSchedule: schedule }),

  clearUser: () =>
    set({
      name: "",
      id: null,
      firstLogin: false,
      userSchedule: [],
    }),
}));
