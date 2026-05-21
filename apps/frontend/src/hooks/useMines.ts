import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mine } from "../types/mine";
import { createFirstMine, fetchMines } from "../api/mines";
import { queryKeys } from "../constants/queryKeys";

function updateMinesCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (mines: Mine[]) => Mine[],
) {
  queryClient.setQueryData<Mine[]>(queryKeys.mines, (old) => updater(old ?? []));
}

export function useMinesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.mines,
    queryFn: fetchMines,
    enabled,
  });
}

export function useCreateFirstMineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFirstMine,
    onSuccess: (mine) => {
      updateMinesCache(queryClient, (mines) => [...mines, mine]);
    },
  });
}
