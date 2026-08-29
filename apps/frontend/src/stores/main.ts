import { StructureType } from "@happy-little-bug-town/utils";
import { create } from "zustand";

interface MainState {
  requiresLogin: boolean;
  setRequiresLogin: (value: boolean) => void;
  evolvingToStructureType: StructureType | null;
  setEvolvingToStructureType: (value: StructureType | null) => void;
  isDemolishMode: boolean;
  setIsDemolishMode: (value: boolean) => void;
}

export const useMainStore = create<MainState>((set) => ({
  requiresLogin: false,
  setRequiresLogin: (value) => set({ requiresLogin: value }),
  evolvingToStructureType: null,
  setEvolvingToStructureType: (value) => set({ evolvingToStructureType: value }),
  isDemolishMode: false,
  setIsDemolishMode: (value) => set({ isDemolishMode: value }),
}));
