import { create } from "zustand";

interface BackendStore {
  isWakingUp: boolean;
  setWakingUp: (value: boolean) => void;
}

export const useBackendStore = create<BackendStore>((set) => ({
  isWakingUp: true,
  setWakingUp: (value) => set({ isWakingUp: value }),
}));
