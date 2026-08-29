"use client";

import { useMemo } from "react";
import {
  getStructureBugPowerMissing,
  getStructureBugPowerRequirements,
  getStructureItemPowerMissing,
  getStructureItemPowerRequirements,
  getStructureSpan,
  isStructureAwaitingPower,
} from "@happy-little-bug-town/utils";

import { Structure } from "../../types/structure";
import { bugTypeToImage } from "../helpers/bugImages";
import {
  gridDragStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "../helpers/groundGridStyles";
import { itemTypeToImageForItem } from "../helpers/itemImages";
import type { DragPayload } from "../types/dragPayload";
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
  const counters: StructurePowerCounterEntry[] = [];

  getStructureBugPowerRequirements(structure.structureType, structure.upgradeLevel).forEach(
    ({ bugType }) => {
      const missing = getStructureBugPowerMissing(structure, bugType);
      if (missing > 0) {
        counters.push({
          key: `bug-${bugType}`,
          imageSrc: bugTypeToImage(bugType),
          missing,
        });
      }
    },
  );

  getStructureItemPowerRequirements(structure.structureType, structure.upgradeLevel).forEach(
    ({ itemType }) => {
      const missing = getStructureItemPowerMissing(structure, itemType);
      if (missing > 0) {
        counters.push({
          key: `item-${itemType}`,
          imageSrc: itemTypeToImageForItem(itemType),
          missing,
        });
      }
    },
  );

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
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
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
              ...spanCellGridPosition(
                structure.x,
                structure.y,
                getStructureSpan(structure.structureType),
                index,
              ),
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
