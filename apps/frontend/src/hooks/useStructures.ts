import { getNextStructureUpgradeLevel } from "@happy-little-bug-town/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  craftOperationalResource,
  createFirstStructure,
  createStructure,
  extractOccupant,
  extractStoredItem,
  fetchStructures,
  updateStructure,
} from "../api/structures";
import { queryKeys } from "../constants/queryKeys";
import { digQueue } from "../services/digQueue";
import { Structure } from "../types/structure";

export function updateStructuresCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (structures: Structure[]) => Structure[],
) {
  queryClient.setQueryData<Structure[]>(queryKeys.structures, (old) => updater(old ?? []));
}

export function useStructuresQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.structures,
    queryFn: fetchStructures,
    enabled,
  });
}

export function useCreateFirstStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFirstStructure,
    onSuccess: (structure) => {
      updateStructuresCache(queryClient, (structures) => [...structures, structure]);
    },
  });
}

export function useCreateStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStructure,
    onSuccess: (structure) => {
      updateStructuresCache(queryClient, (structures) => [...structures, structure]);
    },
  });
}

export function useUpgradeStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (structure: Structure) =>
      updateStructure(structure.id, {
        upgradeLevel: getNextStructureUpgradeLevel(structure),
      }),
    onSuccess: (structure) => {
      updateStructuresCache(queryClient, (structures) =>
        structures.map((existing) => (existing.id === structure.id ? structure : existing)),
      );
    },
  });
}

export function useDigMutation() {
  return useMutation({
    mutationFn: (structureId: string) => digQueue.enqueue(structureId),
  });
}

export function useExtractOccupantMutation() {
  return useMutation({
    mutationFn: extractOccupant,
  });
}

export function useExtractStoredItemMutation() {
  return useMutation({
    mutationFn: extractStoredItem,
  });
}

export function useCraftOperationalResourceMutation() {
  return useMutation({
    mutationFn: craftOperationalResource,
  });
}
