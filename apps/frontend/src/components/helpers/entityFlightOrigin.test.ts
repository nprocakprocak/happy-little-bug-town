import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { queryKeys } from "../../constants/queryKeys";
import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { completeFlightAction, setEntityFlightOrigin } from "./entityFlightOrigin";

describe("entity flight origin", () => {
  const item: Item = { id: "shared", x: 1, y: 1, itemType: "stick", items: [] };
  const matchingBug: Bug = { id: "shared", x: 2, y: 2, bugType: "ant", items: [] };
  const otherBug: Bug = { id: "other", x: 3, y: 3, bugType: "bee", items: [] };

  function client(): QueryClient {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.items, [item]);
    queryClient.setQueryData(queryKeys.bugs, [matchingBug, otherBug]);
    queryClient.setQueryData(queryKeys.stacks, []);
    queryClient.setQueryData(queryKeys.structures, []);
    return queryClient;
  }

  it("sets the origin on every cache that contains the entity", () => {
    const queryClient = client();

    setEntityFlightOrigin(queryClient, "shared", { x: 8, y: 9 });

    expect(queryClient.getQueryData<Item[]>(queryKeys.items)?.[0]).toMatchObject({
      fromX: 8,
      fromY: 9,
    });
    expect(queryClient.getQueryData<Bug[]>(queryKeys.bugs)?.[0]).toMatchObject({
      fromX: 8,
      fromY: 9,
    });
    expect(queryClient.getQueryData<Bug[]>(queryKeys.bugs)?.[1]).toEqual(otherBug);
  });

  it("clears the origin when the flight is not an auto route", () => {
    const queryClient = client();
    setEntityFlightOrigin(queryClient, "shared", { x: 8, y: 9 });
    const finishAutoRoute = vi.fn(() => true);

    completeFlightAction(queryClient, "shared", finishAutoRoute);
    expect(queryClient.getQueryData<Item[]>(queryKeys.items)?.[0]?.fromX).toBe(8);

    finishAutoRoute.mockReturnValue(false);
    completeFlightAction(queryClient, "shared", finishAutoRoute);
    expect(queryClient.getQueryData<Item[]>(queryKeys.items)?.[0]?.fromX).toBeUndefined();
  });
});
