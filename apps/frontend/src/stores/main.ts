import { create } from "zustand";

import { MainState } from "./types";

export const useMainStore = create<MainState>((set) => ({
  requiresLogin: false,
  setRequiresLogin: (value) => set({ requiresLogin: value }),
  evolvingToStructureType: null,
  setEvolvingToStructureType: (value) => set({ evolvingToStructureType: value }),
  isDemolishMode: false,
  setIsDemolishMode: (value) => set({ isDemolishMode: value }),
}));
