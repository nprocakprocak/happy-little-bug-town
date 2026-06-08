import { Position } from "@happy-little-park/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  craftOperationalResource,
  createFirstStructure,
  createStructure,
  dig,
  extractOccupant,
  fetchStructures,
} from "../api/structures";
import { queryKeys } from "../constants/queryKeys";
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

export function useDigMutation() {
  return useMutation({
    mutationFn: dig,
  });
}

export function useExtractOccupantMutation() {
  return useMutation({
    mutationFn: extractOccupant,
  });
}

export function useCraftOperationalResourceMutation() {
  return useMutation({
    mutationFn: craftOperationalResource,
  });
}
