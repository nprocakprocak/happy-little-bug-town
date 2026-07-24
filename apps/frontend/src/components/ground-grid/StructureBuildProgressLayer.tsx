"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  getStructureBuildProgress,
  getStructureBuildToolProgress,
  isStructureIncomplete,
  ItemType,
  ToolType,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../../domain/drag-n-drop/dragPayload";
import { Structure } from "../../types/structure";
import { itemTypeToImageForItem } from "../helpers/itemTypeToImage";
import { toolTypeToImage } from "../helpers/toolTypeToImage";

interface StructureBuildProgressLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  gridDrag: DragPayload | null;
}

interface StructureBuildResourceCounterProps {
  imageSrc: string;
  missing: number;
}

function StructureBuildResourceCounter({ imageSrc, missing }: StructureBuildResourceCounterProps) {
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

interface StructureBuildItemCounterProps {
  itemType: ItemType;
  missing: number;
}

function StructureBuildItemCounter({ itemType, missing }: StructureBuildItemCounterProps) {
  return (
    <StructureBuildResourceCounter imageSrc={itemTypeToImageForItem(itemType)} missing={missing} />
  );
}

interface StructureBuildToolCounterProps {
  toolType: ToolType;
  missing: number;
}

function StructureBuildToolCounter({ toolType, missing }: StructureBuildToolCounterProps) {
  return <StructureBuildResourceCounter imageSrc={toolTypeToImage(toolType)} missing={missing} />;
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
        const itemProgress = getStructureBuildProgress(structure);
        const toolProgress = getStructureBuildToolProgress(structure);
        const progress = [
          ...itemProgress.map(({ itemType, missing }) => ({
            key: `item-${itemType}`,
            missing,
            node: <StructureBuildItemCounter itemType={itemType} missing={missing} />,
          })),
          ...toolProgress.map(({ toolType, missing }) => ({
            key: `tool-${toolType}`,
            missing,
            node: <StructureBuildToolCounter toolType={toolType} missing={missing} />,
          })),
        ].filter(({ missing }) => missing > 0);

        return progress.map(({ key, node }, index) => {
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
              {node}
            </div>
          );
        });
      })}
    </div>
  );
}
