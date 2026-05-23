import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createFirstStructure, dig, fetchStructures, updateStructurePosition } from "../api/structures";
import { queryKeys } from "../constants/queryKeys";
import { Position } from "../types/position";
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

export function useUpdateStructurePositionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ structureId, position }: { structureId: string; position: Position }) =>
      updateStructurePosition(structureId, position),
    onSuccess: (structure) => {
      updateStructuresCache(queryClient, (structures) =>
        structures.map((s) => (s.id === structure.id ? structure : s)),
      );
    },
  });
}

export function useDigMutation() {
  return useMutation({
    mutationFn: dig,
  });
}
