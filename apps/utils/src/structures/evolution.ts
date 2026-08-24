import {
  GROUND_BACKGROUND_IDS,
  GroundBackgroundId,
  STRUCTURE_EVOLUTION_STEPS,
  StructureEvolutionStep,
} from "../constants/structureEvolution.js";
import { BugType } from "../types/bugType.js";
import { StructureType } from "../types/structureType.js";

export interface StructureForEvolution {
  structureType: StructureType;
  bugs: { bugType: BugType }[];
}

const GROUND_EVOLUTION_STRUCTURE_TYPE_SET = new Set<StructureType>(
  STRUCTURE_EVOLUTION_STEPS.flatMap((step) => [step.fromType, step.toType]),
);

export function isGroundEvolutionStructureType(
  structureType: StructureType,
): boolean {
  return GROUND_EVOLUTION_STRUCTURE_TYPE_SET.has(structureType);
}

export function getEvolutionStepFromType(
  fromType: StructureType,
): StructureEvolutionStep | undefined {
  return STRUCTURE_EVOLUTION_STEPS.find((step) => step.fromType === fromType);
}

export function getEvolutionStepToType(
  toType: StructureType,
): StructureEvolutionStep | undefined {
  return STRUCTURE_EVOLUTION_STEPS.find((step) => step.toType === toType);
}

export function getEvolutionOccupantCount(structure: StructureForEvolution): number {
  const step = getEvolutionStepFromType(structure.structureType);
  if (!step) {
    return 0;
  }

  return structure.bugs.filter(({ bugType }) => bugType === step.occupantBugType).length;
}

export function getEvolutionOccupancyProgress(
  structure: StructureForEvolution,
): { count: number; max: number; bugType: BugType } | null {
  const step = getEvolutionStepFromType(structure.structureType);
  if (!step) {
    return null;
  }

  const count = getEvolutionOccupantCount(structure);
  if (count <= 0) {
    return null;
  }

  return { count, max: step.occupantCapacity, bugType: step.occupantBugType };
}

export function isStructureReadyToEvolve(structure: StructureForEvolution): boolean {
  const step = getEvolutionStepFromType(structure.structureType);
  if (!step) {
    return false;
  }

  return getEvolutionOccupantCount(structure) >= step.occupantCapacity;
}

export function canStructureAcceptEvolutionBugDrop(
  bug: { bugType: BugType },
  structure: StructureForEvolution,
): boolean {
  const step = getEvolutionStepFromType(structure.structureType);
  if (!step) {
    return false;
  }

  return (
    bug.bugType === step.occupantBugType &&
    getEvolutionOccupantCount(structure) < step.occupantCapacity
  );
}

export function getReachedGroundBackgroundId(
  structureTypes: StructureType[],
): GroundBackgroundId {
  let reachedBackgroundId: GroundBackgroundId = GROUND_BACKGROUND_IDS[0];
  const structureTypeSet = new Set(structureTypes);

  for (const step of STRUCTURE_EVOLUTION_STEPS) {
    if (structureTypeSet.has(step.toType)) {
      reachedBackgroundId = step.backgroundId;
    }
  }

  return reachedBackgroundId;
}

export function getVisibleGroundBackgroundId(
  reachedBackgroundId: GroundBackgroundId,
  evolvingToType: StructureType | null | undefined,
  fadeStarted: boolean,
): GroundBackgroundId {
  if (!evolvingToType) {
    return reachedBackgroundId;
  }

  const step = getEvolutionStepToType(evolvingToType);
  if (!step) {
    return reachedBackgroundId;
  }

  if (fadeStarted) {
    return step.backgroundId;
  }

  const previousStep = getEvolutionStepToType(step.fromType);
  return previousStep?.backgroundId ?? GROUND_BACKGROUND_IDS[0];
}
