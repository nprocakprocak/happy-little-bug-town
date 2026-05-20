"use client";

import { Item, Mine, Stack } from "@happy-little-park/types";
import Image from "next/image";
import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_MUD_BG_TILE_HEIGHT_PX,
  GROUND_MUD_BG_TILE_WIDTH_PX,
} from "../constants";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { isFlyingItem } from "./helpers/isFlyingItem";
import { itemTypeToImageForItem, itemTypeToImageForStack } from "./helpers/itemTypeToImage";
import { useMemo } from "react";

interface GroundGridAssetLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
  stacks: Stack[];
  gridDrag: DragPayload | null;
}

export function GroundGridAssetLayer({
  cols,
  rows,
  mines,
  items,
  stacks,
  gridDrag,
}: GroundGridAssetLayerProps) {
  const allGrounded = useMemo(() => {
    const groundedItems = items.filter((it) => !isFlyingItem(it));
    const groundedStacks = stacks.filter((it) => !isFlyingItem(it));
    return [...groundedItems, ...groundedStacks];
  }, [items, stacks]);

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={{
        backgroundImage: "url('/backgrounds/bg-mud.webp')",
        backgroundRepeat: "repeat",
        backgroundSize: `calc(100cqi * ${GROUND_MUD_BG_TILE_WIDTH_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px) calc(100cqi * ${GROUND_MUD_BG_TILE_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {mines.map((mine) => {
        const isDragged = gridDrag?.target.kind === "mine" && gridDrag.target.mineId === mine.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        return (
          <div
            key={mine.id}
            className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
            style={{
              gridColumn: `${mine.x} / span ${mine.span}`,
              gridRow: `${mine.y} / span ${mine.span}`,
              ...dragStyle,
            }}
          >
            <Image
              src="/mines/hole.webp"
              alt=""
              fill
              className="object-cover"
              sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * mine.span)}px`}
            />
          </div>
        );
      })}
      {allGrounded.map((item: Item | Stack) => {
        const isDragged =
          (gridDrag?.target.kind === "item" && gridDrag.target.itemId === item.id) ||
          (gridDrag?.target.kind === "stack" && gridDrag.target.stackId === item.id);
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};
        const isStack = stacks.some((i) => i.id === item.id);

        return (
          <div
            key={item.id}
            className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
            style={{
              gridColumn: `${item.x} / span 1`,
              gridRow: `${item.y} / span 1`,
              ...dragStyle,
            }}
          >
            <Image
              src={
                isStack
                  ? itemTypeToImageForStack(item.itemType)
                  : itemTypeToImageForItem(item.itemType)
              }
              alt=""
              fill
              className="object-cover"
              sizes={`${Math.ceil(GROUND_GRID_MAX_WIDTH_PX / cols)}px`}
            />
          </div>
        );
      })}
    </div>
  );
}
