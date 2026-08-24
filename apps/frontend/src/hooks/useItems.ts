import { Position } from "@happy-little-bug-town/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addItemToStack,
  addItemToStructure,
  createCraftableItem,
  fetchItems,
  updateItemPosition,
} from "../api/items";
import { queryKeys } from "../constants/queryKeys";
import { Item } from "../types/item";
import { updateStacksCache } from "./useStacks";
import { updateStructuresCache } from "./useStructures";

export function updateItemsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (items: Item[]) => Item[],
) {
  queryClient.setQueryData<Item[]>(queryKeys.items, (old) => updater(old ?? []));
}

export function useItemsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: fetchItems,
    enabled,
  });
}

export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCraftableItem,
    onSuccess: (item) => {
      updateItemsCache(queryClient, (items) => [...items, item]);
    },
  });
}

export function useUpdateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, position }: { itemId: string; position: Position }) =>
      updateItemPosition(itemId, position),
    onSuccess: (item) => {
      updateItemsCache(queryClient, (items) => items.map((it) => (it.id === item.id ? item : it)));
    },
  });
}

export function useAddItemToStackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, stackId }: { itemId: string; stackId: string }) =>
      addItemToStack(itemId, stackId),
    onSuccess: (stack, { itemId }) => {
      updateItemsCache(queryClient, (items) => items.filter((it) => it.id !== itemId));
      updateStacksCache(queryClient, (stacks) =>
        stacks.map((s) => (s.id === stack.id ? stack : s)),
      );
    },
  });
}

export function useAddItemToStructureMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, structureId }: { itemId: string; structureId: string }) =>
      addItemToStructure(itemId, structureId),
    onSuccess: (structure, { itemId }) => {
      updateItemsCache(queryClient, (items) => items.filter((it) => it.id !== itemId));
      updateStructuresCache(queryClient, (structures) =>
        structures.map((s) => (s.id === structure.id ? structure : s)),
      );
    },
  });
}
