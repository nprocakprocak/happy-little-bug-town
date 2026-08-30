import { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../constants/queryKeys";
import { DropActionState } from "../types/dropActionState";

export function applyDropActionState(queryClient: QueryClient, state: DropActionState) {
  queryClient.setQueryData(queryKeys.items, state.items);
  queryClient.setQueryData(queryKeys.stacks, state.stacks);
  queryClient.setQueryData(queryKeys.bugs, state.bugs);
  queryClient.setQueryData(queryKeys.structures, state.structures);
}
