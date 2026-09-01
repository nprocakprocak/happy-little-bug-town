import { Position } from "@happy-little-bug-town/utils";
import { QueryClient } from "@tanstack/react-query";

import { updateBugsCache } from "../../hooks/useBugs";
import { updateItemsCache } from "../../hooks/useItems";
import { updateStacksCache } from "../../hooks/useStacks";
import { updateStructuresCache } from "../../hooks/useStructures";
import { GridAnimatable, WithId } from "../../types/gridEntity";

function withFlightOrigin<T extends WithId & GridAnimatable>(
  entities: T[],
  entityId: string,
  fromX: number | undefined,
  fromY: number | undefined,
): T[] {
  return entities.map((entity) => (entity.id === entityId ? { ...entity, fromX, fromY } : entity));
}

export function setEntityFlightOrigin(
  queryClient: QueryClient,
  entityId: string,
  origin: Position | null,
) {
  const fromX = origin?.x;
  const fromY = origin?.y;

  updateItemsCache(queryClient, (prev) => withFlightOrigin(prev, entityId, fromX, fromY));
  updateBugsCache(queryClient, (prev) => withFlightOrigin(prev, entityId, fromX, fromY));
  updateStacksCache(queryClient, (prev) => withFlightOrigin(prev, entityId, fromX, fromY));
  updateStructuresCache(queryClient, (prev) => withFlightOrigin(prev, entityId, fromX, fromY));
}

export function completeFlightAction(
  queryClient: QueryClient,
  entityId: string,
  completeAutoRouteFlight: (entityId: string) => boolean,
) {
  if (completeAutoRouteFlight(entityId)) {
    return;
  }

  setEntityFlightOrigin(queryClient, entityId, null);
}
