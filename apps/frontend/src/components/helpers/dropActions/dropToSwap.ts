import { canSwapOnGrid, Positionable } from "@happy-little-bug-town/utils";

import { swapGridPositions } from "../../../api/grid";
import { DropActionState } from "../../types/dropActionState";
import { withSwappedPositions } from "../withSwappedPositions";

export async function dropToSwap(
  entity: Positionable,
  targetEntity: Positionable,
  sourceId: string | undefined,
  targetId: string | undefined,
  state: DropActionState,
): Promise<DropActionState | undefined> {
  if (!sourceId || !targetId || !canSwapOnGrid(entity, targetEntity)) {
    return undefined;
  }

  await swapGridPositions(sourceId, targetId);

  const sourcePosition = { x: entity.x, y: entity.y };
  const occupantPosition = { x: targetEntity.x, y: targetEntity.y };

  return {
    ...state,
    items: withSwappedPositions(state.items, sourceId, targetId, sourcePosition, occupantPosition),
    bugs: withSwappedPositions(state.bugs, sourceId, targetId, sourcePosition, occupantPosition),
  };
}
