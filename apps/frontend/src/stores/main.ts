import { StructureType } from "@happy-little-bug-town/utils";
import { create } from "zustand";

import { DialogueId } from "../types/dialogue";

interface MainState {
  requiresLogin: boolean;
  setRequiresLogin: (value: boolean) => void;
  evolvingToStructureType: StructureType | null;
  setEvolvingToStructureType: (value: StructureType | null) => void;
  isDemolishMode: boolean;
  setIsDemolishMode: (value: boolean) => void;
  activeDialogueId: DialogueId | null;
  setActiveDialogueId: (value: DialogueId | null) => void;
}

export const useMainStore = create<MainState>((set) => ({
  requiresLogin: false,
  setRequiresLogin: (value) => set({ requiresLogin: value }),
  evolvingToStructureType: null,
  setEvolvingToStructureType: (value) => set({ evolvingToStructureType: value }),
  isDemolishMode: false,
  setIsDemolishMode: (value) => set({ isDemolishMode: value }),
  activeDialogueId: null,
  setActiveDialogueId: (value) => set({ activeDialogueId: value }),
}));
