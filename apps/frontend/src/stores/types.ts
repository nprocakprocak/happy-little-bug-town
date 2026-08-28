import { StructureType } from "@happy-little-bug-town/utils";

export interface MainState {
  requiresLogin: boolean;
  setRequiresLogin: (value: boolean) => void;
  evolvingToStructureType: StructureType | null;
  setEvolvingToStructureType: (value: StructureType | null) => void;
  isDemolishMode: boolean;
  setIsDemolishMode: (value: boolean) => void;
}
