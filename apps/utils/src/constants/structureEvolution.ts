import { ANTHILL_TERMITE_CAPACITY, HOLE_ANT_CAPACITY } from "./game.js";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";

export const GROUND_BACKGROUND_IDS = ["sand", "sandy_soil", "fertile_soil"];

export type GroundBackgroundId = (typeof GROUND_BACKGROUND_IDS)[number];

export interface StructureEvolutionStep {
  fromType: StructureType;
  toType: StructureType;
  occupantBugType: BugType;
  occupantCapacity: number;
  backgroundId: GroundBackgroundId;
}

export const STRUCTURE_EVOLUTION_STEPS: StructureEvolutionStep[] = [
  {
    fromType: "hole",
    toType: "anthill",
    occupantBugType: "ant",
    occupantCapacity: HOLE_ANT_CAPACITY,
    backgroundId: "sandy_soil",
  },
  {
    fromType: "anthill",
    toType: "termite_mound",
    occupantBugType: "termite",
    occupantCapacity: ANTHILL_TERMITE_CAPACITY,
    backgroundId: "fertile_soil",
  },
];
