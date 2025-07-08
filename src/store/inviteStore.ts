import { create } from "zustand";

interface InviteState {
  inviteCode: string | null;
  isLoading: boolean;
  error: string | null;
  setInviteCode: (code: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  inviteCode: null,
  isLoading: false,
  error: null,
};

export const useInviteStore = create<InviteState>((set) => ({
  ...initialState,

  setInviteCode: (code) => set({ inviteCode: code }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
