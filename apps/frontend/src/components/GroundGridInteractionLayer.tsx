"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useGridVisibility } from "../context/GridVisibilityContext";
import type { DragPayload } from "../domain/drag-n-drop/dragPayload";
import { Item } from "../types/item";
import { Mine } from "../types/mine";
import { Position } from "../types/position";
import { Stack } from "../types/stack";
import { DRAG_THRESHOLD_PX } from "./constants";
import { buildGridDragPayload } from "./helpers/buildGridDragPayload";
import { gridCellFromClientPoint } from "./helpers/gridCellFromClientPoint";
import {
  findOverlappingItem,
  findOverlappingStack,
  positionOverlapsAnyItem,
  positionOverlapsAnyMine,
  positionOverlapsAnything,
} from "./helpers/overlaps";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
  stacks: Stack[];
  onMineClick: (mine: Mine) => void;
  onStackClick: (stack: Stack) => void;
  onDragChange: (payload: DragPayload | null) => void;
  onItemDropCancelled: (itemId: string, dropX: number, dropY: number) => void;
  onItemDropped: (
    itemId: string,
    x: number,
    y: number,
    targetItem?: Item,
    targetStack?: Stack,
  ) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  mines,
  items,
  stacks,
  onMineClick,
  onStackClick,
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
      const payload = buildGridDragPayload(index, dx, dy, cols, mines, items, stacks);
      if (payload !== null) {
        onDragChange(payload);
      }
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
      const payload = buildGridDragPayload(index, dx, dy, cols, mines, items, stacks);
      if (payload !== null) {
        onDragChange(payload);
      }
    }
  }

  function handlePointerUp(
    mine: Mine | undefined,
    stack: Stack | undefined,
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
        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;
        const itemToDrop = items.find((i) => i.x === gridCol && i.y === gridRow);
        const stackToDrop = stacks.find((s) => s.x === gridCol && s.y === gridRow);

        if (isOtherCell) {
          if (itemToDrop) {
            const overlappingItem = findOverlappingItem({ x: target.x, y: target.y }, items);
            const overlappingStack = findOverlappingStack({ x: target.x, y: target.y }, stacks);
            const overlapsMine = positionOverlapsAnyMine({ x: target.x, y: target.y }, mines);
            const shouldCancel =
              overlapsMine ||
              (overlappingItem && overlappingItem.itemType !== itemToDrop.itemType) ||
              (overlappingStack && overlappingStack.itemType !== itemToDrop.itemType);

            if (shouldCancel) {
              onItemDropCancelled(itemToDrop.id, target.x, target.y);
            } else {
              onItemDropped(itemToDrop.id, target.x, target.y, overlappingItem, overlappingStack);
            }
          }

          if (stackToDrop) {
            const overlappingItem = findOverlappingItem({ x: target.x, y: target.y }, items);
            const overlappingStack = findOverlappingStack({ x: target.x, y: target.y }, stacks);
            const overlapsMine = positionOverlapsAnyMine({ x: target.x, y: target.y }, mines);

            const targetStack =
              overlappingStack && overlappingStack.id !== stackToDrop.id
                ? overlappingStack
                : undefined;
            const sameItemType = targetStack?.itemType === stackToDrop.itemType;

            const shouldCancel = overlapsMine || !!overlappingItem || !sameItemType;

            if (shouldCancel) {
              onItemDropCancelled(stackToDrop.id, target.x, target.y);
            } else {
              onItemDropped(stackToDrop.id, target.x, target.y, undefined, targetStack);
            }
          }
        }
      }
      return;
    }

    if (mine) {
      onMineClick(mine);
    } else if (stack) {
      onStackClick(stack);
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
        const mine = mines.find((mine) => mine.x === gridCol && mine.y === gridRow);
        const stack = stacks.find((stack) => stack.x === gridCol && stack.y === gridRow);

        if (!mine && positionOverlapsAnyMine({ x: gridCol, y: gridRow }, mines)) {
          return null;
        }

        const canDrag = positionOverlapsAnyItem({ x: gridCol, y: gridRow }, [...items, ...stacks]);

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;
        const isDragging = dragState?.index === index;
        const cellBackgroundClass = isSelected
          ? "bg-amber-300/20"
          : gridCellsVisible
            ? "bg-zinc-200/20"
            : "bg-transparent";
        const placementStyle = mine
          ? {
              gridColumn: `${mine.x} / span ${mine.span}`,
              gridRow: `${mine.y} / span ${mine.span}`,
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
            onPointerUp={(event) => handlePointerUp(mine, stack, gridCol, gridRow, event)}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}
