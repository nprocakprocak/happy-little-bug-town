import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addBeetleToStructure, fetchBugs } from "../api/bugs";
import { queryKeys } from "../constants/queryKeys";
import { Bug } from "../types/bug";
import { updateStructuresCache } from "./useStructures";

export function updateBugsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (bugs: Bug[]) => Bug[],
) {
  queryClient.setQueryData<Bug[]>(queryKeys.bugs, (old) => updater(old ?? []));
}

export function useBugsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.bugs,
    queryFn: fetchBugs,
    enabled,
  });
}

export function useAddBeetleToStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bugId, structureId }: { bugId: string; structureId: string }) =>
      addBeetleToStructure(bugId, structureId),
    onSuccess: (structure, { bugId }) => {
      updateBugsCache(queryClient, (bugs) => bugs.filter((bug) => bug.id !== bugId));
      updateStructuresCache(queryClient, (structures) =>
        structures.map((existing) => (existing.id === structure.id ? structure : existing)),
      );
    },
  });
}
