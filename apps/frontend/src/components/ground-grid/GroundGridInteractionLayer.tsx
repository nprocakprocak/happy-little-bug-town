"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  canDiscardBugOnStructure,
  canDiscardItemOnStructure,
  canDropBugOnStack,
  canDropFoodOnBug,
  canDropItemOnItem,
  canDropItemOnStructure,
  canStackItemType,
  canStructureAcceptBugDrop,
  canStructureAcceptDroppedBug,
  findOverlappingEntity,
  getItemSpan,
  getStackSpan,
  getStructureSpan,
  isBugFed,
  Position,
  Positionable,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { useGridVisibility } from "../../context/GridVisibilityContext";
import { Bug } from "../../types/bug";
import type { DragPayload } from "../../types/dragPayload";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { isBug, isItem, isStack, isStructure } from "../../utils/typeGuards";
import { buildGridDragPayload } from "../helpers/buildGridDragPayload";
import { gridCellFromClientPoint } from "../helpers/gridCellFromClientPoint";
import { gridPlacementStyle, groundGridTemplateStyle } from "../helpers/groundGridStyles";
import { DRAG_THRESHOLD_PX } from "./constants";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  onStructureClick: (structure: Structure) => void;
  onStackClick: (stack: Stack) => void;
  onBeetleClick: (bug: Bug) => void;
  onLadybugClick: (bug: Bug) => void;
  onAntClick: (bug: Bug) => void;
  onTermiteClick: (bug: Bug) => void;
  onDragChange: (payload: DragPayload | null) => void;
  onItemDropCancelled: (itemId: string, dropPosition: Position) => void;
  onItemDropped: (itemId: string, position: Position, targetEntity?: Positionable) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  structures,
  items,
  stacks,
  bugs,
  onStructureClick,
  onStackClick,
  onBeetleClick,
  onLadybugClick,
  onAntClick,
  onTermiteClick,
  onDragChange,
  onItemDropCancelled,
  onItemDropped,
}: GroundGridInteractionLayerProps) {
  const { gridCellsVisible } = useGridVisibility();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [dragState, setDragState] = useState<{ index: number; dx: number; dy: number } | null>(
    null,
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const cellCount = rows * cols;

  function openBugPopup(bug: Bug) {
    if (bug.bugType === "ladybug") {
      onLadybugClick(bug);
      return;
    }
    if (bug.bugType === "beetle") {
      onBeetleClick(bug);
      return;
    }
    if (bug.bugType === "ant") {
      onAntClick(bug);
      return;
    }
    if (bug.bugType === "termite") {
      onTermiteClick(bug);
    }
  }

  function handlePointerDown(index: number, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY, index };
    hasDraggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    canDrag: boolean,
    index: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (!canDrag) {
      return;
    }
    if (!pointerStartRef.current) {
      return;
    }
    if (pointerStartRef.current.index !== index) {
      return;
    }
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;

    if (hasDraggedRef.current) {
      setDragState({ index, dx, dy });
      const payload = buildGridDragPayload(index, dx, dy, cols, structures, items, stacks, bugs);
      if (payload !== null) {
        onDragChange(payload);
      }
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
      const payload = buildGridDragPayload(index, dx, dy, cols, structures, items, stacks, bugs);
      if (payload !== null) {
        onDragChange(payload);
      }
    }
  }

  function handlePointerUp(
    structure: Structure | undefined,
    stack: Stack | undefined,
    bug: Bug | undefined,
    gridCol: number,
    gridRow: number,
    index: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const startedOnThisCell = pointerStartRef.current?.index === index;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // no need to do anything
    }
    pointerStartRef.current = null;

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      setDragState(null);
      onDragChange(null);

      const container = gridContainerRef.current;
      if (container) {
        const itemToDrop = items.find((i) => i.x === gridCol && i.y === gridRow);
        const stackToDrop = stacks.find((s) => s.x === gridCol && s.y === gridRow);
        const bugToDrop = bugs.find((b) => b.x === gridCol && b.y === gridRow);
        const structureToDrop = structures.find((s) => s.x === gridCol && s.y === gridRow);
        const entityToDrop = itemToDrop ?? stackToDrop ?? bugToDrop ?? structureToDrop;

        const draggedSpan =
          (structureToDrop ? getStructureSpan(structureToDrop.structureType) : undefined) ??
          (stackToDrop ? getStackSpan() : undefined) ??
          (itemToDrop ? getItemSpan(itemToDrop.itemType) : undefined) ??
          1;
        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / draggedSpan / 2;
        const centerY = bounds.top + bounds.height / draggedSpan / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;

        const overlappingEntity = findOverlappingEntity({ x: target.x, y: target.y }, [
          ...structures,
          ...items,
          ...stacks,
          ...bugs,
        ]);
        const overlappingItem =
          overlappingEntity && isItem(overlappingEntity) && overlappingEntity.id !== itemToDrop?.id
            ? overlappingEntity
            : undefined;
        const overlappingStack =
          overlappingEntity &&
          isStack(overlappingEntity) &&
          overlappingEntity.id !== stackToDrop?.id
            ? overlappingEntity
            : undefined;
        const overlappingBug =
          overlappingEntity && isBug(overlappingEntity) ? overlappingEntity : undefined;
        const overlappingStructure =
          overlappingEntity &&
          isStructure(overlappingEntity) &&
          overlappingEntity.id !== structureToDrop?.id
            ? overlappingEntity
            : undefined;

        if (!entityToDrop) {
          throw new Error("No entity to drop found on cell: " + gridCol + "," + gridRow);
        }

        if (isOtherCell) {
          if (itemToDrop) {
            const canDropOnItemCraft =
              !!overlappingItem && canDropItemOnItem(itemToDrop, overlappingItem);
            const wouldCreateOrJoinStack =
              (!!overlappingItem && !canDropOnItemCraft) || !!overlappingStack;
            const sameTypeItems = overlappingItem?.itemType === itemToDrop.itemType;
            const sameTypeAsStack = overlappingStack?.itemType === itemToDrop.itemType;
            const typeAllowed = sameTypeItems || sameTypeAsStack;
            const stackNotAllowed =
              wouldCreateOrJoinStack &&
              (!canStackItemType(itemToDrop.itemType, items) || !typeAllowed);
            const canDropFoodOnOverlappingBug =
              !!overlappingBug && canDropFoodOnBug(itemToDrop.itemType, overlappingBug);
            const canDropOnStructure =
              !!overlappingStructure &&
              (canDropItemOnStructure(itemToDrop, overlappingStructure) ||
                canDiscardItemOnStructure(overlappingStructure));
            const wouldCreateStack =
              !!overlappingItem &&
              !canDropOnItemCraft &&
              sameTypeItems &&
              canStackItemType(itemToDrop.itemType, items);
            const stackFootprintBlocked =
              wouldCreateStack &&
              overlappingItem !== undefined &&
              !structureFootprintFits({ x: target.x, y: target.y, itemsCount: 2 }, cols, rows, [
                ...structures,
                ...items.filter((i) => i.id !== itemToDrop.id && i.id !== overlappingItem.id),
                ...stacks,
                ...bugs,
              ]);
            const overlapsSelf =
              !!overlappingEntity &&
              isItem(overlappingEntity) &&
              overlappingEntity.id === itemToDrop.id;
            const dropTarget = overlapsSelf ? undefined : overlappingEntity;
            const emptyCellBlocked =
              !dropTarget &&
              !structureFootprintFits(
                { x: target.x, y: target.y, itemType: itemToDrop.itemType },
                cols,
                rows,
                [...structures, ...items.filter((i) => i.id !== itemToDrop.id), ...stacks, ...bugs],
              );
            const shouldCancel =
              (!!overlappingStructure && !canDropOnStructure) ||
              stackNotAllowed ||
              stackFootprintBlocked ||
              (!!overlappingBug && !canDropFoodOnOverlappingBug) ||
              emptyCellBlocked;

            if (shouldCancel) {
              onItemDropCancelled(itemToDrop.id, target);
            } else {
              onItemDropped(itemToDrop.id, target, dropTarget);
            }
          }

          if (stackToDrop) {
            const isMerge =
              !!overlappingStack &&
              overlappingStack.itemType === stackToDrop.itemType &&
              canStackItemType(stackToDrop.itemType, items);
            const overlapsSelf =
              overlappingEntity?.x === stackToDrop.x && overlappingEntity?.y === stackToDrop.y;
            const shouldCancel =
              (!!overlappingEntity && !overlappingStack && !overlapsSelf) ||
              (!!overlappingStack && !isMerge);

            if (shouldCancel) {
              onItemDropCancelled(stackToDrop.id, target);
            } else if (isMerge) {
              onItemDropped(stackToDrop.id, target, overlappingStack);
            } else {
              const fits = structureFootprintFits(
                { x: target.x, y: target.y, itemsCount: stackToDrop.itemsCount },
                cols,
                rows,
                [
                  ...structures,
                  ...items,
                  ...stacks.filter((s) => s.id !== stackToDrop.id),
                  ...bugs,
                ],
              );

              if (fits) {
                onItemDropped(stackToDrop.id, target);
              } else {
                onItemDropCancelled(stackToDrop.id, target);
              }
            }
          }

          if (structureToDrop) {
            const fits = structureFootprintFits(
              {
                x: target.x,
                y: target.y,
                structureType: structureToDrop.structureType,
              },
              cols,
              rows,
              [
                ...structures.filter((s) => s.id !== structureToDrop.id),
                ...items,
                ...stacks,
                ...bugs,
              ],
            );

            if (fits) {
              onItemDropped(structureToDrop.id, target);
            } else {
              onItemDropCancelled(structureToDrop.id, target);
            }
          }

          if (bugToDrop) {
            const canDropBeetleOnStructure =
              !!overlappingStructure &&
              canStructureAcceptDroppedBug(bugToDrop, overlappingStructure);
            const canDropOnStack =
              !!overlappingStack && canDropBugOnStack(bugToDrop, overlappingStack);

            const canDiscardOnStructure =
              !!overlappingStructure && canDiscardBugOnStructure(bugToDrop, overlappingStructure);

            if (canDropBeetleOnStructure) {
              const isWorkerDrop = canStructureAcceptBugDrop(bugToDrop, overlappingStructure);
              const mustBeFed =
                isWorkerDrop &&
                structureDropRequiresFedBug(
                  overlappingStructure.structureType,
                  overlappingStructure.upgradeLevel,
                );
              if (mustBeFed && !isBugFed(bugToDrop)) {
                openBugPopup(bugToDrop);
                onItemDropCancelled(bugToDrop.id, target);
              } else {
                onItemDropped(bugToDrop.id, target, overlappingEntity);
              }
            } else if (canDiscardOnStructure) {
              onItemDropped(bugToDrop.id, target, overlappingEntity);
            } else if (canDropOnStack) {
              if (!isBugFed(bugToDrop)) {
                openBugPopup(bugToDrop);
                onItemDropCancelled(bugToDrop.id, target);
              } else {
                onItemDropped(bugToDrop.id, target, overlappingEntity);
              }
            } else if (!!overlappingEntity) {
              onItemDropCancelled(bugToDrop.id, target);
            } else {
              onItemDropped(bugToDrop.id, target);
            }
          }
        }
      }
      return;
    }

    if (!startedOnThisCell) {
      return;
    }

    if (structure) {
      onStructureClick(structure);
    } else if (stack) {
      onStackClick(stack);
    } else if (bug?.bugType === "beetle" || bug?.bugType === "ladybug") {
      openBugPopup(bug);
    } else {
      setSelectedPosition({ x: gridCol, y: gridRow });
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // no need to do anything
    }
    pointerStartRef.current = null;
    hasDraggedRef.current = false;
    setDragState(null);
    onDragChange(null);
  }

  return (
    <div
      ref={gridContainerRef}
      className="absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        const gridRow = Math.floor(index / cols) + 1;
        const gridCol = (index % cols) + 1;
        const structure = structures.find((s) => s.x === gridCol && s.y === gridRow);
        const stack = stacks.find((s) => s.x === gridCol && s.y === gridRow);
        const item = items.find((i) => i.x === gridCol && i.y === gridRow);
        const bug = bugs.find((b) => b.x === gridCol && b.y === gridRow);

        if (!structure && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, structures)) {
          return null;
        }

        if (!stack && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, stacks)) {
          return null;
        }

        if (!item && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, items)) {
          return null;
        }

        const canDrag =
          !!structure ||
          !!stack ||
          !!item ||
          positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, bugs);

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;
        const isDragging = dragState?.index === index;
        const cellBackgroundClass = isSelected
          ? "bg-amber-300/20"
          : gridCellsVisible
            ? "bg-zinc-200/20"
            : "bg-transparent";
        const placementStyle = structure
          ? gridPlacementStyle(structure.x, structure.y, getStructureSpan(structure.structureType))
          : stack
            ? gridPlacementStyle(stack.x, stack.y, getStackSpan())
            : item
              ? gridPlacementStyle(item.x, item.y, getItemSpan(item.itemType))
              : gridPlacementStyle(gridCol, gridRow);
        const dragStyle =
          isDragging && dragState
            ? { transform: `translate(${dragState.dx}px, ${dragState.dy}px)` }
            : {};

        return (
          <div
            key={index}
            className={`min-h-0 min-w-0 select-none rounded-sm transition-colors ${canDrag ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer"} ${cellBackgroundClass}`}
            style={{ ...placementStyle, ...dragStyle }}
            onPointerDown={(event) => handlePointerDown(index, event)}
            onPointerMove={(event) => handlePointerMove(canDrag, index, event)}
            onPointerUp={(event) =>
              handlePointerUp(structure, stack, bug, gridCol, gridRow, index, event)
            }
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}
