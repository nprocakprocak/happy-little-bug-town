"use client";

import { useMemo } from "react";
import {
  getStructureBuildProgress,
  getStructureBuildToolProgress,
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
import { toolTypeToImage } from "../helpers/toolTypeToImage";
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
        const itemProgress = getStructureBuildProgress(structure);
        const toolProgress = getStructureBuildToolProgress(structure);
        const progress = [
          ...itemProgress.map(({ itemType, missing }) => ({
            key: `item-${itemType}`,
            missing,
            imageSrc: itemTypeToImageForItem(itemType),
          })),
          ...toolProgress.map(({ toolType, missing }) => ({
            key: `tool-${toolType}`,
            missing,
            imageSrc: toolTypeToImage(toolType),
          })),
        ].filter(({ missing }) => missing > 0);

        return progress.map(({ key, missing, imageSrc }, index) => (
          <div
            key={`${structure.id}-${key}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...spanCellGridPosition(structure.x, structure.y, structure.span, index),
              ...dragStyle,
            }}
          >
            <MissingResourceCounter imageSrc={imageSrc} missing={missing} />
          </div>
        ));
      })}
    </div>
  );
}
