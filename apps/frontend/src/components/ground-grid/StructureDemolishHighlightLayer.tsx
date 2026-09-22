"use client";

import { canDemolishStructure, getStructureSpan } from "@happy-little-bug-town/utils";

import { useMainStore } from "../../stores/main";
import { Item } from "../../types/item";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlying } from "../helpers/isFlying";
import type { DragPayload } from "../types/dragPayload";

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

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="grid h-full w-full gap-1" style={groundGridTemplateStyle(cols, rows)}>
        {structures
          .filter((structure) => !isFlying(structure) && canDemolishStructure(structure, items))
          .map((structure) => {
            const isDragged = gridDrag?.entity.id === structure.id;
            const span = getStructureSpan(structure.structureType);

            return (
              <div
                key={structure.id}
                aria-hidden
                className={`rounded-sm bg-red-500/30 transition-opacity duration-200 motion-reduce:transition-none ${isDemolishMode ? "opacity-100" : "opacity-0"}`}
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
