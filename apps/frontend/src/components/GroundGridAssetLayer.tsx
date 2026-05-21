"use client";

import { useMemo } from "react";
import Image from "next/image";

import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_MUD_BG_TILE_HEIGHT_PX,
  GROUND_MUD_BG_TILE_WIDTH_PX,
} from "../constants";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { isFlyingItem } from "./helpers/isFlyingItem";
import { itemTypeToImageForItem, itemTypeToImageForStack } from "./helpers/itemTypeToImage";

interface GroundGridAssetLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
  gridDrag: DragPayload | null;
}

export function GroundGridAssetLayer({
  cols,
  rows,
  structures,
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
      {structures.map((structure) => {
        const isDragged =
          gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        return (
          <div
            key={structure.id}
            className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
            style={{
              gridColumn: `${structure.x} / span ${structure.span}`,
              gridRow: `${structure.y} / span ${structure.span}`,
              ...dragStyle,
            }}
          >
            <Image
              src="/structures/hole.webp"
              alt=""
              fill
              className="object-cover"
              sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * structure.span)}px`}
            />
          </div>
        );
      })}
      {allGrounded.map((item: Item | Stack) => {
        const isDragged =
          gridDrag !== null &&
          ((gridDrag.target.kind === "item" &&
            gridDrag.target.itemId !== undefined &&
            gridDrag.target.itemId === item.id) ||
            (gridDrag.target.kind === "stack" && gridDrag.target.stackId === item.id));
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
