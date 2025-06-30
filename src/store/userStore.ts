import { create } from "zustand";

interface UserState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  setUser: (user: UserState["user"]) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => void;
}

const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useUserStore;
