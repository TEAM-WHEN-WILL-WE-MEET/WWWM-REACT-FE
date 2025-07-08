// @ts-check
import { create } from "zustand";

/** @type {import('zustand').StateCreator<{
  name: string,
  id: string | null,
  firstLogin: boolean,
  userSchedule: import('./types').Schedule[],
  setUser: (name: string, id: string | null) => void,
  setUserInfo: (userName: string, isFirstLogin: boolean) => void,
  setFirstLogin: (value: boolean) => void,
  setUserSchedule: (schedule: import('./types').Schedule[]) => void,
  clearUser: () => void
}>} */
const createStore = (set) => ({
  name: "",
  id: null,
  firstLogin: false,
  userSchedule: [],

  setUser: (name, id) => set({ name, id }),

  setUserInfo: (userName, isFirstLogin) =>
    set({ name: userName, firstLogin: isFirstLogin }),

  setFirstLogin: (value) => set({ firstLogin: value }),

  setUserSchedule: (schedule) => set({ userSchedule: schedule }),

  clearUser: () =>
    set({
      name: "",
      id: null,
      firstLogin: false,
      userSchedule: [],
    }),
});

export const useUserStore = create(createStore);
