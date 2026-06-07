"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  getStructureOperationalResourceCount,
  getStructureOperationalResourceRequirement,
  structureShowsActivationGlow,
  toolShowsActivationGlow,
} from "@happy-little-park/utils";

import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_MUD_BG_TILE_HEIGHT_PX,
  GROUND_MUD_BG_TILE_WIDTH_PX,
} from "../constants";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { Tool } from "../types/tool";
import { isBug } from "../utils/typeGuards";
import { isFlyingItem } from "./helpers/isFlyingItem";
import {
  bugTypeToImage,
  itemTypeToImageForItem,
  itemTypeToImageForStack,
  structureTypeToImage,
} from "./helpers/itemTypeToImage";
import { toolTypeToImage } from "./helpers/toolTypeToImage";

interface GroundGridAssetLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  tools: Tool[];
  gridDrag: DragPayload | null;
}

export function GroundGridAssetLayer({
  cols,
  rows,
  structures,
  items,
  stacks,
  bugs,
  tools,
  gridDrag,
}: GroundGridAssetLayerProps) {
  const allGrounded = useMemo(() => {
    const groundedItems = items.filter((it) => !isFlyingItem(it));
    const groundedBugs = bugs.filter((bug) => !isFlyingItem(bug));
    return [...groundedItems, ...groundedBugs];
  }, [items, bugs]);

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={{
        backgroundImage: "url('/backgrounds/bg-sand.webp')",
        backgroundRepeat: "repeat",
        backgroundSize: `calc(100cqi * ${GROUND_MUD_BG_TILE_WIDTH_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px) calc(100cqi * ${GROUND_MUD_BG_TILE_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`,
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {structures
        .filter((structure) => !isFlyingItem(structure))
        .map((structure) => {
          const isDragged =
            gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
          const dragStyle =
            isDragged && gridDrag
              ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
              : {};

          const showActivationGlow = structureShowsActivationGlow(structure);
          const firstHouseBug =
            structure.structureType === "beetle_house" ? (structure.bugs ?? [])[0] : undefined;
          const operationalResourceRequirement = getStructureOperationalResourceRequirement(
            structure.structureType,
          );
          const operationalResourceCount = getStructureOperationalResourceCount(structure);

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
              <div className="relative h-full w-full">
                <Image
                  src={structureTypeToImage(structure.structureType)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * structure.span)}px`}
                />
                {showActivationGlow && (
                  <div className="absolute inset-0 rounded-sm bg-sky-500/40" aria-hidden />
                )}
                {firstHouseBug && (
                  <div
                    className="absolute min-h-0 min-w-0 overflow-hidden rounded-sm"
                    style={{
                      right: 0,
                      bottom: 0,
                      width: `${100 / structure.span}%`,
                      height: `${100 / structure.span}%`,
                    }}
                  >
                    <Image
                      src={bugTypeToImage(firstHouseBug.bugType)}
                      alt=""
                      fill
                      className="object-contain p-[8%] drop-shadow-sm"
                      sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * structure.span)}px`}
                    />
                  </div>
                )}
                {operationalResourceRequirement && operationalResourceCount > 0 && (
                  <div
                    className="absolute min-h-0 min-w-0 overflow-hidden rounded-sm"
                    style={{
                      right: 0,
                      bottom: 0,
                      width: `${100 / structure.span}%`,
                      height: `${100 / structure.span}%`,
                    }}
                  >
                    <Image
                      src={itemTypeToImageForItem(operationalResourceRequirement.itemType)}
                      alt=""
                      fill
                      className="object-contain p-[8%] drop-shadow-sm"
                      sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * structure.span)}px`}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      {tools
        .filter((tool) => !isFlyingItem(tool))
        .map((tool) => {
          const isDragged = gridDrag?.target.kind === "tool" && gridDrag.target.toolId === tool.id;
          const dragStyle =
            isDragged && gridDrag
              ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
              : {};

          return (
            <div
              key={tool.id}
              className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
              style={{
                gridColumn: `${tool.x} / span ${tool.span ?? 1}`,
                gridRow: `${tool.y} / span ${tool.span ?? 1}`,
                ...dragStyle,
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={toolTypeToImage(tool.toolType)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * (tool.span ?? 1))}px`}
                />
                {toolShowsActivationGlow(tool) && (
                  <div className="absolute inset-0 rounded-sm bg-sky-500/40" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      {stacks
        .filter((stack) => !isFlyingItem(stack))
        .map((stack) => {
          const isDragged =
            gridDrag?.target.kind === "stack" && gridDrag.target.stackId === stack.id;
          const dragStyle =
            isDragged && gridDrag
              ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
              : {};

          return (
            <div
              key={stack.id}
              className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
              style={{
                gridColumn: `${stack.x} / span ${stack.span ?? 1}`,
                gridRow: `${stack.y} / span ${stack.span ?? 1}`,
                ...dragStyle,
              }}
            >
              <Image
                src={itemTypeToImageForStack(stack.itemType)}
                alt=""
                fill
                className="object-cover"
                sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * (stack.span ?? 1))}px`}
              />
            </div>
          );
        })}
      {allGrounded.map((item: Item | Bug) => {
        const isDragged =
          gridDrag !== null &&
          ((gridDrag.target.kind === "item" && gridDrag.target.itemId === item.id) ||
            (gridDrag.target.kind === "stack" && gridDrag.target.stackId === item.id) ||
            (gridDrag.target.kind === "bug" && gridDrag.target.bugId === item.id));
        const dragStyle =
          isDragged && gridDrag
            ? { transform: `translate(${gridDrag.dx}px, ${gridDrag.dy}px)`, zIndex: 5 }
            : {};

        const imageSource = isBug(item)
          ? bugTypeToImage(item.bugType)
          : itemTypeToImageForItem(item.itemType);

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
              src={imageSource}
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
