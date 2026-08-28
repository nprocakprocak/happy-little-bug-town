"use client";

import { useMemo } from "react";
import {
  getStructureBuildProgress,
  getStructureSpan,
  getStructureUpgradeProgress,
  isStructureIncomplete,
  isStructureUpgradeIncomplete,
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

function getMissingStructureResourceProgress(structure: Structure) {
  if (isStructureIncomplete(structure)) {
    return getStructureBuildProgress(structure).filter(({ missing }) => missing > 0);
  }

  if (isStructureUpgradeIncomplete(structure)) {
    return getStructureUpgradeProgress(structure).filter(({ missing }) => missing > 0);
  }

  return [];
}

export function StructureBuildProgressLayer({
  cols,
  rows,
  structures,
  gridDrag,
}: StructureBuildProgressLayerProps) {
  const structuresWithProgress = useMemo(
    () =>
      structures.flatMap((structure) => {
        const progress = getMissingStructureResourceProgress(structure);
        if (progress.length === 0) {
          return [];
        }
        return [{ structure, progress }];
      }),
    [structures],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {structuresWithProgress.flatMap(({ structure, progress }) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle = gridDragStyle(gridDrag, isDragged);

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
