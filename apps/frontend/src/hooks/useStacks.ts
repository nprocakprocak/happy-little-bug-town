import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Position, Stack } from "@happy-little-park/types";
import { createStack, extractItemFromStack, fetchStacks, updateStack } from "../api/stacks";
import { queryKeys } from "../lib/queryKeys";

function updateStacksCache(
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

export function useCreateStackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStack,
    onSuccess: (stack) => {
      updateStacksCache(queryClient, (stacks) => [...stacks, stack]);
    },
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

export function useExtractFromStackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: extractItemFromStack,
    onSuccess: () => {
      updateStacksCache(queryClient, (stacks) =>
        stacks.map((s) => ({ ...s, itemsCount: s.itemsCount - 1 })),
      );
    },
  });
}
