import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchBugs } from "../api/bugs";
import { queryKeys } from "../constants/queryKeys";
import { Bug } from "../types/bug";

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
