import {
  getEvolutionStepFromType,
  isStructureReadyToEvolve,
  StructureType,
} from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { evolveStructure } from "../../../api/structures";
import { useMainStore } from "../../../stores/main";
import { Structure } from "../../../types/structure";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";

function optimisticEvolveStructure(
  structureId: string,
  toType: StructureType,
  state: DropActionState,
): DropActionState {
  return {
    ...state,
    structures: state.structures.map((structure) =>
      structure.id === structureId ? { ...structure, structureType: toType } : structure,
    ),
  };
}

export async function evolveStructureIfReady(
  targetStructure: Structure,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState> {
  const readyStructure = state.structures.find(
    (structure) => structure.id === targetStructure.id && isStructureReadyToEvolve(structure),
  );
  if (!readyStructure) {
    return state;
  }

  const step = getEvolutionStepFromType(readyStructure.structureType);
  if (!step) {
    return state;
  }

  useMainStore.getState().setEvolvingToStructureType(step.toType);
  applyDropActionState(
    queryClient,
    optimisticEvolveStructure(readyStructure.id, step.toType, state),
  );

  const evolved = await evolveStructure(readyStructure.id);

  return {
    ...state,
    structures: state.structures.map((structure) =>
      structure.id === evolved.id ? evolved : structure,
    ),
  };
}
