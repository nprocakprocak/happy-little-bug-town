import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createFirstStructure, fetchStructures } from "../api/structures";
import { queryKeys } from "../constants/queryKeys";
import { Structure } from "../types/structure";

function updateStructuresCache(
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
