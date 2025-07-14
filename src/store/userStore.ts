import { create } from "zustand";
import { Schedule } from "./types";

interface UserState {
  name: string;
  id: string | null;
  email: string;
  userId: string | null;
  firstLogin: boolean;
  userSchedule: Schedule[];
  isLoading: boolean;
  error: string | null;

  // actions
  setUser: (name: string, id: string | null) => void;
  setUserInfo: (userName: string, isFirstLogin: boolean) => void;
  setMyInfo: (userId: string, name: string, email: string) => void;
  setFirstLogin: (value: boolean) => void;
  setUserSchedule: (schedule: Schedule[]) => void;
  clearUser: () => void;
  fetchMyInfo: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  name: "",
  id: null,
  email: "",
  userId: null,
  firstLogin: false,
  userSchedule: [],
  isLoading: false,
  error: null,

  setUser: (name: string, id: string | null) => set({ name, id }),

  setUserInfo: (userName: string, isFirstLogin: boolean) =>
    set({ name: userName, firstLogin: isFirstLogin }),

  setMyInfo: (userId: string, name: string, email: string) =>
    set({ userId, name, email, error: null }),

  setFirstLogin: (value: boolean) => set({ firstLogin: value }),

  setUserSchedule: (schedule: Schedule[]) => set({ userSchedule: schedule }),

  clearUser: () =>
    set({
      name: "",
      id: null,
      email: "",
      userId: null,
      firstLogin: false,
      userSchedule: [],
      error: null,
    }),

  fetchMyInfo: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ error: '인증 토큰이 없습니다.' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const BASE_URL = process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_WWWM_BE_ENDPOINT
        : process.env.REACT_APP_WWWM_BE_DEV_EP;

      const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const responseData = await response.json();
        const { userId, name, email } = responseData.object;
        
        set({ 
          userId, 
          name, 
          email, 
          isLoading: false, 
          error: null 
        });
      } else if (response.status === 500) {
        set({ 
          error: '서버 오류가 발생했습니다.', 
          isLoading: false 
        });
      } else {
        set({ 
          error: '사용자 정보를 가져올 수 없습니다.', 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('내 정보 조회 실패:', error);
      set({ 
        error: '네트워크 오류가 발생했습니다.', 
        isLoading: false 
      });
    }
  },
}));
