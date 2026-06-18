"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  getStructurePowerMissing,
  getStructurePowerOccupantBugType,
  getStructureToolPowerMissing,
  getStructureToolPowerRequirements,
  isStructureAwaitingPower,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Structure } from "../types/structure";
import { bugTypeToImage } from "./helpers/itemTypeToImage";
import { toolTypeToImage } from "./helpers/toolTypeToImage";

interface StructurePowerProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

interface StructurePowerMissingCounterProps {
  imageSrc: string;
  missing: number;
}

function StructurePowerMissingCounter({ imageSrc, missing }: StructurePowerMissingCounterProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-[0.35cqi]">
      <div className="relative h-[5cqi] w-[5cqi] shrink-0">
        <Image src={imageSrc} alt="" fill className="object-contain drop-shadow-sm" sizes="5cqi" />
      </div>
      <span className="rounded-sm bg-stone-900/80 px-[0.75cqi] py-[0.15cqi] text-[clamp(0.625rem,2.5cqi,0.875rem)] font-bold tabular-nums text-white shadow-sm">
        {missing}
      </span>
    </div>
  );
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
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {structuresAwaitingPower.flatMap((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};
        const counters = getStructurePowerCounters(structure);

        return counters.map(({ key, imageSrc, missing }, index) => {
          const colOffset = index % structure.span;
          const rowOffset = Math.floor(index / structure.span);

          return (
            <div
              key={`${structure.id}-${key}`}
              className="relative min-h-0 min-w-0"
              style={{
                gridColumn: structure.x + colOffset,
                gridRow: structure.y + rowOffset,
                ...dragStyle,
              }}
            >
              <StructurePowerMissingCounter imageSrc={imageSrc} missing={missing} />
            </div>
          );
        });
      })}
    </div>
  );
}
