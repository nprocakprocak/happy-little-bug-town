import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { queryKeys } from "../../constants/queryKeys";
import { applyDropActionState } from "./applyDropActionState";

describe("drop action state", () => {
  it("writes every board list into the query cache", () => {
    const queryClient = new QueryClient();
    const state = {
      items: [],
      stacks: [],
      bugs: [],
      structures: [],
    };

    applyDropActionState(queryClient, state);

    expect(queryClient.getQueryData(queryKeys.items)).toBe(state.items);
    expect(queryClient.getQueryData(queryKeys.stacks)).toBe(state.stacks);
    expect(queryClient.getQueryData(queryKeys.bugs)).toBe(state.bugs);
    expect(queryClient.getQueryData(queryKeys.structures)).toBe(state.structures);
  });
});
