"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  BugType,
  getStructurePowerMissing,
  getStructurePowerOccupantBugType,
  isStructureAwaitingPower,
} from "@happy-little-park/utils";

import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Structure } from "../types/structure";
import { bugTypeToImage } from "./helpers/itemTypeToImage";

interface StructurePowerProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

interface StructurePowerMissingCounterProps {
  occupantBugType: BugType;
  missing: number;
}

function StructurePowerMissingCounter({
  occupantBugType,
  missing,
}: StructurePowerMissingCounterProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-[0.35cqi]">
      <div className="relative h-[5cqi] w-[5cqi] shrink-0">
        <Image
          src={bugTypeToImage(occupantBugType)}
          alt=""
          fill
          className="object-contain drop-shadow-sm"
          sizes="5cqi"
        />
      </div>
      <span className="rounded-sm bg-stone-900/80 px-[0.75cqi] py-[0.15cqi] text-[clamp(0.625rem,2.5cqi,0.875rem)] font-bold tabular-nums text-white shadow-sm">
        {missing}
      </span>
    </div>
  );
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
      {structuresAwaitingPower.map((structure) => {
        const occupantBugType = getStructurePowerOccupantBugType(structure.structureType);
        if (!occupantBugType) {
          return null;
        }

        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};
        const missing = getStructurePowerMissing(structure);
        const centerOffset = Math.floor(structure.span / 2);

        return (
          <div
            key={`structure-power-${structure.id}`}
            className="relative min-h-0 min-w-0"
            style={{
              gridColumn: structure.x + centerOffset,
              gridRow: structure.y + centerOffset,
              ...dragStyle,
            }}
          >
            <StructurePowerMissingCounter occupantBugType={occupantBugType} missing={missing} />
          </div>
        );
      })}
    </div>
  );
}
