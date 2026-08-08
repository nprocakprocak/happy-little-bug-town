"use client";

import { useMemo } from "react";
import {
  getStructureBuildProgress,
  getStructureSpan,
  isStructureIncomplete,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../../types/dragPayload";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "../helpers/groundGridStyles";
import { itemTypeToImageForItem } from "../helpers/itemTypeToImage";
import { MissingResourceCounter } from "../ui/MissingResourceCounter";

interface StructureBuildProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

export function StructureBuildProgressLayer({
  cols,
  rows,
  structures,
  gridDrag,
}: StructureBuildProgressLayerProps) {
  const structuresUnderConstruction = useMemo(
    () => structures.filter(isStructureIncomplete),
    [structures],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {structuresUnderConstruction.flatMap((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle = gridDragStyle(gridDrag, isDragged);
        const progress = getStructureBuildProgress(structure).filter(({ missing }) => missing > 0);

        return progress.map(({ itemType, missing }, index) => (
          <div
            key={`${structure.id}-${itemType}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...spanCellGridPosition(
                structure.x,
                structure.y,
                getStructureSpan(structure.structureType),
                index,
              ),
              ...dragStyle,
            }}
          >
            <MissingResourceCounter imageSrc={itemTypeToImageForItem(itemType)} missing={missing} />
          </div>
        ));
      })}
    </div>
  );
}
