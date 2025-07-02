import { create } from "zustand";
import { Schedule } from "./types";

interface UserState {
  userName: string;
  isFirstLogin: boolean;
  userSchedule: Schedule[];

  // actions
  setUserInfo: (userName: string, isFirstLogin: boolean) => void;
  setUserSchedule: (schedule: Schedule[]) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userName: "",
  isFirstLogin: true,
  userSchedule: [],

  setUserInfo: (userName: string, isFirstLogin: boolean) =>
    set({ userName, isFirstLogin }),

  setUserSchedule: (schedule: Schedule[]) => set({ userSchedule: schedule }),

  clearUserInfo: () =>
    set({
      userName: "",
      isFirstLogin: true,
      userSchedule: [],
    }),
}));
