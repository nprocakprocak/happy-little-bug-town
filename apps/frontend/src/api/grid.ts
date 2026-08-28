import { Position } from "@happy-little-bug-town/utils";

import { apiFetch } from "./client";

interface SwapGridPositionsResult {
  source: { id: string } & Position;
  target: { id: string } & Position;
}

export function swapGridPositions(
  sourceId: string,
  targetId: string,
): Promise<SwapGridPositionsResult> {
  return apiFetch<SwapGridPositionsResult>("/api/grid/swap", {
    method: "POST",
    body: JSON.stringify({ sourceId, targetId }),
  });
}
