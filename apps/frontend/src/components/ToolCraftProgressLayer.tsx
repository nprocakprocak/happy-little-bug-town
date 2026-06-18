"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  getVisibleToolCraftProgress,
  isToolIncomplete,
  ItemType,
} from "@happy-little-bug-town/utils";

import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Tool } from "../types/tool";
import { itemTypeToImageForItem } from "./helpers/itemTypeToImage";

interface ToolCraftProgressLayerProps {
  cols: number;
  rows: number;
  tools: Tool[];
  gridDrag: DragPayload | null;
}

interface ToolCraftResourceCounterProps {
  itemType: ItemType;
  missing: number;
}

function ToolCraftResourceCounter({ itemType, missing }: ToolCraftResourceCounterProps) {
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

export function ToolCraftProgressLayer({
  cols,
  rows,
  tools,
  gridDrag,
}: ToolCraftProgressLayerProps) {
  const toolsUnderCraft = useMemo(() => tools.filter(isToolIncomplete), [tools]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 grid h-full w-full gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {toolsUnderCraft.flatMap((tool) => {
        const isDragged = gridDrag?.target.kind === "tool" && gridDrag.target.toolId === tool.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};
        const progress = getVisibleToolCraftProgress(tool);

        return progress.map(({ itemType, missing }, index) => {
          const colOffset = index % (tool.span ?? 1);
          const rowOffset = Math.floor(index / (tool.span ?? 1));

          return (
            <div
              key={`${tool.id}-${itemType}`}
              className="relative min-h-0 min-w-0"
              style={{
                gridColumn: tool.x + colOffset,
                gridRow: tool.y + rowOffset,
                ...dragStyle,
              }}
            >
              <ToolCraftResourceCounter itemType={itemType} missing={missing} />
            </div>
          );
        });
      })}
    </div>
  );
}
