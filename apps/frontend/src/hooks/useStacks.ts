import { Position } from "@happy-little-bug-town/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchStacks, updateStack } from "../api/stacks";
import { queryKeys } from "../constants/queryKeys";
import { Stack } from "../types/stack";

export function updateStacksCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (stacks: Stack[]) => Stack[],
) {
  queryClient.setQueryData<Stack[]>(queryKeys.stacks, (old) => updater(old ?? []));
}

export function useStacksQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.stacks,
    queryFn: fetchStacks,
    enabled,
  });
}

export function useUpdateStackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stackId, position }: { stackId: string; position: Position }) =>
      updateStack(stackId, position),
    onSuccess: (stack) => {
      updateStacksCache(queryClient, (stacks) =>
        stacks.map((s) => (s.id === stack.id ? stack : s)),
      );
    },
  });
}
