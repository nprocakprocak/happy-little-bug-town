"use client";

import { useMemo } from "react";
import {
  getStructurePowerMissing,
  getStructurePowerOccupantBugType,
  getStructureToolPowerMissing,
  getStructureToolPowerRequirements,
  isStructureAwaitingPower,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import { Structure } from "../../types/structure";
import {
  gridDragStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "../helpers/groundGridStyles";
import { bugTypeToImage } from "../helpers/itemTypeToImage";
import { toolTypeToImage } from "../helpers/toolTypeToImage";
import { MissingResourceCounter } from "../ui/MissingResourceCounter";

interface StructurePowerProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

interface StructurePowerCounterEntry {
  key: string;
  imageSrc: string;
  missing: number;
}

function getStructurePowerCounters(structure: Structure): StructurePowerCounterEntry[] {
  const occupantBugType = getStructurePowerOccupantBugType(structure.structureType);
  const missingBeetles = getStructurePowerMissing(structure);
  const counters: StructurePowerCounterEntry[] = [];

  if (occupantBugType && missingBeetles > 0) {
    counters.push({
      key: `bug-${occupantBugType}`,
      imageSrc: bugTypeToImage(occupantBugType),
      missing: missingBeetles,
    });
  }

  getStructureToolPowerRequirements(structure.structureType).forEach(({ toolType }) => {
    const missing = getStructureToolPowerMissing(structure, toolType);
    if (missing > 0) {
      counters.push({
        key: `tool-${toolType}`,
        imageSrc: toolTypeToImage(toolType),
        missing,
      });
    }
  });

  return counters;
}

export function StructurePowerProgressLayer({
  cols,
  rows,
  structures,
  gridDrag,
}: StructurePowerProgressLayerProps) {
  const structuresAwaitingPower = useMemo(
    () => structures.filter(isStructureAwaitingPower),
    [structures],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {structuresAwaitingPower.flatMap((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle = gridDragStyle(gridDrag, isDragged);
        const counters = getStructurePowerCounters(structure);

        return counters.map(({ key, imageSrc, missing }, index) => (
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
