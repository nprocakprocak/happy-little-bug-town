"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  BEETLE_MAX_LEAF_PARTS,
  canDropItemOnStructure,
  canStructureAcceptBugDrop,
  findOverlappingEntity,
  isBugFed,
  Position,
  Positionable,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
  structureFootprintFits,
} from "@happy-little-park/utils";

import { useGridVisibility } from "../context/GridVisibilityContext";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Bug } from "../types/bug";
import { Item } from "../types/item";
import { Stack } from "../types/stack";
import { Structure } from "../types/structure";
import { isBug, isItem, isStack, isStructure } from "../utils/typeGuards";
import { DRAG_THRESHOLD_PX } from "./constants";
import { buildGridDragPayload } from "./helpers/buildGridDragPayload";
import { gridCellFromClientPoint } from "./helpers/gridCellFromClientPoint";

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
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const cellCount = rows * cols;

  function handlePointerDown(canDrag: boolean, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    if (!canDrag) {
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
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
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
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

        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / (structureToDrop?.span ?? 1) / 2;
        const centerY = bounds.top + bounds.height / (structureToDrop?.span ?? 1) / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;

        const overlappingEntity = findOverlappingEntity({ x: target.x, y: target.y }, [
          ...structures,
          ...items,
          ...stacks,
          ...bugs,
        ]);
        const overlappingItem =
          overlappingEntity && isItem(overlappingEntity) ? overlappingEntity : undefined;
        const overlappingStack =
          overlappingEntity && isStack(overlappingEntity) ? overlappingEntity : undefined;
        const overlappingBug =
          overlappingEntity && isBug(overlappingEntity) ? overlappingEntity : undefined;
        const overlappingStructure =
          overlappingEntity &&
          isStructure(overlappingEntity) &&
          overlappingEntity?.id !== structureToDrop?.id
            ? overlappingEntity
            : undefined;

        if (!entityToDrop) {
          throw new Error("No entity to drop found on cell: " + gridCol + "," + gridRow);
        }

        if (isOtherCell) {
          if (itemToDrop) {
            const wouldCreateOrJoinStack = !!overlappingItem || !!overlappingStack;
            const sameTypeItems = overlappingItem?.itemType === itemToDrop.itemType;
            const sameTypeAsStack = overlappingStack?.itemType === itemToDrop.itemType;
            const typeAllowed = sameTypeItems || sameTypeAsStack;
            const stackNotAllowed =
              wouldCreateOrJoinStack && (!itemToDrop.stackable || !typeAllowed);
            const canDropLeafOnBeetle =
              itemToDrop.itemType === "leaf_part" &&
              overlappingBug?.bugType === "beetle" &&
              overlappingBug.itemIds.length < BEETLE_MAX_LEAF_PARTS;
            const canDropOnStructure =
              !!overlappingStructure && canDropItemOnStructure(itemToDrop, overlappingStructure);
            const shouldCancel =
              (!!overlappingStructure && !canDropOnStructure) ||
              stackNotAllowed ||
              (!!overlappingBug && !canDropLeafOnBeetle);

            if (shouldCancel) {
              onItemDropCancelled(itemToDrop.id, target);
            } else {
              onItemDropped(itemToDrop.id, target, overlappingEntity);
            }
          }

          if (stackToDrop) {
            const shouldCancel =
              (!!overlappingEntity && !overlappingStack) ||
              (overlappingStack && overlappingStack.itemType !== stackToDrop.itemType);

            if (shouldCancel) {
              onItemDropCancelled(stackToDrop.id, target);
            } else {
              onItemDropped(stackToDrop.id, target, overlappingEntity);
            }
          }

          if (structureToDrop) {
            const fits = structureFootprintFits(
              { x: target.x, y: target.y, span: structureToDrop.span },
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
            }
          }

          if (bugToDrop) {
            const canDropBeetleOnStructure =
              !!overlappingStructure && canStructureAcceptBugDrop(bugToDrop, overlappingStructure);

            if (canDropBeetleOnStructure) {
              const mustBeFed = structureDropRequiresFedBug(overlappingStructure.structureType);
              if (mustBeFed && !isBugFed(bugToDrop)) {
                onBeetleClick(bugToDrop);
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

    if (structure) {
      onStructureClick(structure);
    } else if (stack) {
      onStackClick(stack);
    } else if (bug?.bugType === "beetle") {
      onBeetleClick(bug);
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
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        const gridRow = Math.floor(index / cols) + 1;
        const gridCol = (index % cols) + 1;
        const structure = structures.find((s) => s.x === gridCol && s.y === gridRow);
        const stack = stacks.find((s) => s.x === gridCol && s.y === gridRow);
        const bug = bugs.find((b) => b.x === gridCol && b.y === gridRow);

        if (!structure && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, structures)) {
          return null;
        }

        const canDrag =
          !!structure ||
          positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, [...items, ...stacks, ...bugs]);

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;
        const isDragging = dragState?.index === index;
        const cellBackgroundClass = isSelected
          ? "bg-amber-300/20"
          : gridCellsVisible
            ? "bg-zinc-200/20"
            : "bg-transparent";
        const placementStyle = structure
          ? {
              gridColumn: `${structure.x} / span ${structure.span}`,
              gridRow: `${structure.y} / span ${structure.span}`,
            }
          : {
              gridColumn: gridCol,
              gridRow: gridRow,
            };
        const dragStyle =
          isDragging && dragState
            ? { transform: `translate(${dragState.dx}px, ${dragState.dy}px)` }
            : {};

        return (
          <div
            key={index}
            className={`min-h-0 min-w-0 select-none rounded-sm transition-colors ${canDrag ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer"} ${cellBackgroundClass}`}
            style={{ ...placementStyle, ...dragStyle }}
            onPointerDown={(event) => handlePointerDown(canDrag, event)}
            onPointerMove={(event) => handlePointerMove(canDrag, index, event)}
            onPointerUp={(event) => handlePointerUp(structure, stack, bug, gridCol, gridRow, event)}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}
