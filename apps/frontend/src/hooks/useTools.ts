import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createTool, fetchTools } from "../api/tools";
import { queryKeys } from "../constants/queryKeys";
import { Tool } from "../types/tool";

export function updateToolsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (tools: Tool[]) => Tool[],
) {
  queryClient.setQueryData<Tool[]>(queryKeys.tools, (old) => updater(old ?? []));
}

export function useToolsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tools,
    queryFn: fetchTools,
    enabled,
  });
}

export function useCreateToolMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTool,
    onSuccess: (tool) => {
      updateToolsCache(queryClient, (tools) => [...tools, tool]);
    },
  });
}
