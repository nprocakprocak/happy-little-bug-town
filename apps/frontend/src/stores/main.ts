import { create } from "zustand";

import { MainState } from "./types";

export const useMainStore = create<MainState>((set) => ({
  requiresLogin: false,
  setRequiresLogin: (value) => set({ requiresLogin: value }),
  isTransformingToAnthill: false,
  setIsTransformingToAnthill: (value) => set({ isTransformingToAnthill: value }),
}));
