"use client";

import { canDemolishStructureType, getStructureSpan } from "@happy-little-bug-town/utils";

import { useMainStore } from "../../stores/main";
import type { DragPayload } from "../../types/dragPayload";
import { Item } from "../../types/item";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlyingItem } from "../helpers/isFlyingItem";

interface StructureDemolishHighlightLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  gridDrag: DragPayload | null;
}

export function StructureDemolishHighlightLayer({
  cols,
  rows,
  structures,
  items,
  gridDrag,
}: StructureDemolishHighlightLayerProps) {
  const isDemolishMode = useMainStore((state) => state.isDemolishMode);

  if (!isDemolishMode) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid h-full w-full gap-1" style={groundGridTemplateStyle(cols, rows)}>
        {structures
          .filter(
            (structure) =>
              !isFlyingItem(structure) && canDemolishStructureType(structure.structureType, items),
          )
          .map((structure) => {
            const isDragged =
              gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
            const span = getStructureSpan(structure.structureType);

            return (
              <div
                key={structure.id}
                aria-hidden
                className="rounded-sm bg-red-500/30"
                style={{
                  ...gridPlacementStyle(structure.x, structure.y, span),
                  ...gridDragStyle(gridDrag, isDragged),
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
