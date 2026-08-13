"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  getHoleAntOccupancyProgress,
  getItemSpan,
  getStackSpan,
  getStructureSpan,
  getVisibleStructureOperationalResourceProgresses,
  itemShowsActivationGlow,
  structureShowsActivationGlow,
} from "@happy-little-bug-town/utils";

import {
  ANTHILL_TRANSFORM_FADE_MS,
  GROUND_BG_TILE_HEIGHT_PX,
  GROUND_BG_TILE_WIDTH_PX,
  GROUND_GRID_MAX_WIDTH_PX,
} from "../../constants";
import { useAnthillBackgroundFade } from "../../hooks/useAnthillBackgroundFade";
import { Bug } from "../../types/bug";
import type { DragPayload } from "../../types/dragPayload";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { isBug } from "../../utils/typeGuards";
import {
  gridDragStyle,
  gridPlacementStyle,
  groundGridTemplateStyle,
} from "../helpers/groundGridStyles";
import { isFlyingItem } from "../helpers/isFlyingItem";
import {
  bugTypeToImage,
  itemTypeToImageForItem,
  itemTypeToImageForStack,
  structureTypeToImage,
} from "../helpers/itemTypeToImage";

interface GroundGridAssetLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  gridDrag: DragPayload | null;
  useSandySoilBackground: boolean;
  isTransformingToAnthill: boolean;
  onAnthillTransformFadeComplete: () => void;
}

export function GroundGridAssetLayer({
  cols,
  rows,
  structures,
  items,
  stacks,
  bugs,
  gridDrag,
  useSandySoilBackground,
  isTransformingToAnthill,
  onAnthillTransformFadeComplete,
}: GroundGridAssetLayerProps) {
  const { showSandySoil, fadeStarted, backgroundFadeClassName, backgroundFadeStyle } =
    useAnthillBackgroundFade(isTransformingToAnthill, useSandySoilBackground);

  const allGrounded = useMemo(() => {
    const groundedItems = items.filter((it) => !isFlyingItem(it));
    const groundedBugs = bugs.filter((bug) => !isFlyingItem(bug));
    return [...groundedItems, ...groundedBugs];
  }, [items, bugs]);

  const backgroundSize = `calc(100cqi * ${GROUND_BG_TILE_WIDTH_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px) calc(100cqi * ${GROUND_BG_TILE_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`;
  const structureFadeStyle = {
    transitionDuration: `${ANTHILL_TRANSFORM_FADE_MS}ms`,
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full">
      <div
        className={`absolute inset-0 ${backgroundFadeClassName}`}
        style={{
          ...backgroundFadeStyle,
          backgroundImage: "url('/backgrounds/bg-sand.webp')",
          backgroundRepeat: "repeat",
          backgroundSize,
          opacity: showSandySoil ? 0 : 1,
        }}
      />
      <div
        className={`absolute inset-0 ${backgroundFadeClassName}`}
        style={{
          ...backgroundFadeStyle,
          backgroundImage: "url('/backgrounds/bg-sandy-soil.webp')",
          backgroundRepeat: "repeat",
          backgroundSize,
          opacity: showSandySoil ? 1 : 0,
        }}
      />
      <div
        className="absolute inset-0 grid h-full w-full gap-1"
        style={groundGridTemplateStyle(cols, rows)}
      >
        {structures
          .filter((structure) => !isFlyingItem(structure))
          .map((structure) => {
            const isDragged =
              gridDrag?.target.kind === "structure" && gridDrag.target.structureId === structure.id;
            const showActivationGlow = structureShowsActivationGlow(structure);
            const firstHouseBug =
              structure.structureType === "beetle_house" ? (structure.bugs ?? [])[0] : undefined;
            const holeAntProgress =
              structure.structureType === "hole" ? getHoleAntOccupancyProgress(structure) : null;
            const operationalResourceProgresses =
              getVisibleStructureOperationalResourceProgresses(structure);
            const span = getStructureSpan(structure.structureType);
            const isAnthillTransforming =
              isTransformingToAnthill && structure.structureType === "anthill";
            const structureImageSizes = `${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * span)}px`;

            return (
              <div
                key={structure.id}
                className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
                style={{
                  ...gridPlacementStyle(structure.x, structure.y, span),
                  ...gridDragStyle(gridDrag, isDragged),
                }}
              >
                <div className="relative h-full w-full">
                  {isAnthillTransforming ? (
                    <>
                      <Image
                        src={structureTypeToImage("hole")}
                        alt=""
                        fill
                        className="object-cover transition-opacity"
                        style={{
                          ...structureFadeStyle,
                          opacity: fadeStarted ? 0 : 1,
                        }}
                        sizes={structureImageSizes}
                      />
                      <Image
                        src={structureTypeToImage("anthill")}
                        alt=""
                        fill
                        className="object-cover transition-opacity"
                        style={{
                          ...structureFadeStyle,
                          opacity: fadeStarted ? 1 : 0,
                        }}
                        sizes={structureImageSizes}
                        onTransitionEnd={(event) => {
                          if (event.propertyName !== "opacity" || !fadeStarted) {
                            return;
                          }
                          onAnthillTransformFadeComplete();
                        }}
                      />
                    </>
                  ) : (
                    <Image
                      src={structureTypeToImage(structure.structureType)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes={structureImageSizes}
                    />
                  )}
                  {showActivationGlow && (
                    <div className="absolute inset-0 rounded-sm bg-sky-500/40" aria-hidden />
                  )}
                  {firstHouseBug && (
                    <div
                      className="absolute min-h-0 min-w-0 overflow-hidden rounded-sm"
                      style={{
                        right: 0,
                        bottom: 0,
                        width: `${100 / span}%`,
                        height: `${100 / span}%`,
                      }}
                    >
                      <Image
                        src={bugTypeToImage(firstHouseBug.bugType)}
                        alt=""
                        fill
                        className="object-contain p-[8%] drop-shadow-sm"
                        sizes={structureImageSizes}
                      />
                    </div>
                  )}
                  {holeAntProgress && (
                    <div
                      className="absolute flex min-h-0 min-w-0 overflow-hidden rounded-sm"
                      style={{
                        right: 0,
                        bottom: 0,
                        width: `${100 / span}%`,
                        height: `${100 / span}%`,
                      }}
                    >
                      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
                        <Image
                          src={bugTypeToImage("ant")}
                          alt=""
                          fill
                          className="object-contain p-[8%] drop-shadow-sm"
                          sizes={structureImageSizes}
                        />
                      </div>
                    </div>
                  )}
                  {operationalResourceProgresses.length > 0 && (
                    <div
                      className="absolute flex min-h-0 min-w-0 overflow-hidden rounded-sm"
                      style={{
                        right: 0,
                        bottom: 0,
                        width: `${(100 / span) * Math.min(operationalResourceProgresses.length, span)}%`,
                        height: `${100 / span}%`,
                      }}
                    >
                      {operationalResourceProgresses.map((progress) => (
                        <div
                          key={`${structure.id}-${progress.outputType}`}
                          className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
                        >
                          <Image
                            src={itemTypeToImageForItem(progress.requirement.itemType)}
                            alt=""
                            fill
                            className="object-contain p-[8%] drop-shadow-sm"
                            sizes={structureImageSizes}
                          />
                        </div>
                      ))}
                    </div>
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
            const span = getStackSpan();

            return (
              <div
                key={stack.id}
                className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
                style={{
                  ...gridPlacementStyle(stack.x, stack.y, span),
                  ...gridDragStyle(gridDrag, isDragged),
                }}
              >
                <Image
                  src={itemTypeToImageForStack(stack.itemType)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * span)}px`}
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
          const imageSource = isBug(item)
            ? bugTypeToImage(item.bugType)
            : itemTypeToImageForItem(item.itemType);
          const span = isBug(item) ? 1 : getItemSpan(item.itemType);

          return (
            <div
              key={item.id}
              className="relative min-h-0 min-w-0 overflow-hidden rounded-sm"
              style={{
                ...gridPlacementStyle(item.x, item.y, span),
                ...gridDragStyle(gridDrag, isDragged),
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={imageSource}
                  alt=""
                  fill
                  className="object-cover"
                  sizes={`${Math.ceil((GROUND_GRID_MAX_WIDTH_PX / cols) * span)}px`}
                />
                {!isBug(item) && itemShowsActivationGlow(item) && (
                  <div className="absolute inset-0 rounded-sm bg-sky-500/40" aria-hidden />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
