"use client";

import { useMemo } from "react";
import Image from "next/image";

import { getStructureBuildProgress, isStructureIncomplete } from "../constants/beetleBuild";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { ItemType } from "../types/itemType";
import { Structure } from "../types/structure";
import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

interface StructureBuildProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

interface StructureBuildResourceCounterProps {
  itemType: ItemType;
  missing: number;
}

function StructureBuildResourceCounter({ itemType, missing }: StructureBuildResourceCounterProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-[0.35cqi]">
      <div className="relative h-[5cqi] w-[5cqi] shrink-0">
        <Image
          src={itemTypeToImageForItem(itemType)}
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
      className="pointer-events-none absolute inset-0 z-[15] grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {structuresUnderConstruction.flatMap((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};
        const progress = getStructureBuildProgress(structure);

        return progress.map(({ itemType, missing }, index) => {
          const colOffset = index % structure.span;
          const rowOffset = Math.floor(index / structure.span);

          return (
            <div
              key={`${structure.id}-${itemType}`}
              className="relative min-h-0 min-w-0"
              style={{
                gridColumn: structure.x + colOffset,
                gridRow: structure.y + rowOffset,
                ...dragStyle,
              }}
            >
              <StructureBuildResourceCounter itemType={itemType} missing={missing} />
            </div>
          );
        });
      })}
    </div>
  );
}
