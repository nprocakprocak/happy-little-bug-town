import { canSwapOnGrid, Positionable } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { swapGridPositions } from "../../../api/grid";
import { DropActionState } from "../../types/dropActionState";
import { applyDropActionState } from "../applyDropActionState";
import { withSwappedPositions } from "../withSwappedPositions";

function optimisticDropToSwap(
  entity: Positionable,
  targetEntity: Positionable,
  sourceId: string,
  targetId: string,
  state: DropActionState,
): DropActionState {
  const sourcePosition = { x: entity.x, y: entity.y };
  const occupantPosition = { x: targetEntity.x, y: targetEntity.y };

  return {
    ...state,
    items: withSwappedPositions(state.items, sourceId, targetId, sourcePosition, occupantPosition),
    bugs: withSwappedPositions(state.bugs, sourceId, targetId, sourcePosition, occupantPosition),
  };
}

export async function dropToSwap(
  entity: Positionable,
  targetEntity: Positionable,
  sourceId: string | undefined,
  targetId: string | undefined,
  state: DropActionState,
  queryClient: QueryClient,
): Promise<DropActionState | undefined> {
  if (!sourceId || !targetId || !canSwapOnGrid(entity, targetEntity)) {
    return undefined;
  }

  applyDropActionState(
    queryClient,
    optimisticDropToSwap(entity, targetEntity, sourceId, targetId, state),
  );

  await swapGridPositions(sourceId, targetId);

  return optimisticDropToSwap(entity, targetEntity, sourceId, targetId, state);
}
