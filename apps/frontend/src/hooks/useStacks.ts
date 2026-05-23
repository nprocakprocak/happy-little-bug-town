import { Position } from "@happy-little-park/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createStack, extractItemFromStack, fetchStacks, updateStack } from "../api/stacks";
import { queryKeys } from "../constants/queryKeys";
import { Stack } from "../types/stack";
import { updateItemsCache } from "./useItems";

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
    mutationFn: (stackId: string) => extractItemFromStack(stackId),
    onSuccess: (result, stackId) => {
      updateItemsCache(queryClient, (items) => {
        const next = [...items, result.extractedItem];
        if (result.remainingItem) {
          next.push(result.remainingItem);
        }
        return next;
      });
      updateStacksCache(queryClient, (stacks) => {
        if (result.stackDissolved) {
          return stacks.filter((s) => s.id !== stackId);
        }
        return stacks.map((s) => (s.id === stackId ? { ...s, itemsCount: s.itemsCount - 1 } : s));
      });
    },
  });
}
