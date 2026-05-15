"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useGridVisibility } from "../context/GridVisibilityContext";
import type { GridDragPayload } from "../types/gridDrag";
import { buildGridDragPayload } from "./helpers/buildGridDragPayload";
import { gridCellFromClientPoint } from "./helpers/gridCellFromClientPoint";
import {
  positionOverlapsAnyItem,
  positionOverlapsAnyMine,
  positionOverlapsAnything,
} from "./helpers/overlaps";
import { DRAG_THRESHOLD_PX } from "./constants";
import { Item, Mine, Position } from "@happy-little-park/types";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
  onMineClick: (mine: Mine) => void;
  onDragChange: (payload: GridDragPayload | null) => void;
  onItemDropCancelled: (itemId: string, dropX: number, dropY: number) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  mines,
  items,
  onMineClick,
  onDragChange,
  onItemDropCancelled,
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
      const payload = buildGridDragPayload(index, dx, dy, cols, mines, items);
      if (payload !== null) {
        onDragChange(payload);
      }
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
      const payload = buildGridDragPayload(index, dx, dy, cols, mines, items);
      if (payload !== null) {
        onDragChange(payload);
      }
    }
  }

  function handlePointerUp(
    mine: Mine | undefined,
    gridCol: number,
    gridRow: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
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

        if (isOtherCell) {
          const shouldCancel = positionOverlapsAnything({ x: target.x, y: target.y }, mines, items);

          if (shouldCancel) {
            const item = items.find((i) => i.x === gridCol && i.y === gridRow);
            if (item) {
              onItemDropCancelled(item.id, target.x, target.y);
            }
            return;
          }

          setSelectedPosition({ x: target.x, y: target.y });
        }
      }
      return;
    }

    if (mine) {
      onMineClick(mine);
    } else {
      setSelectedPosition({ x: gridCol, y: gridRow });
    }
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
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

        if (!mine && positionOverlapsAnyMine({ x: gridCol, y: gridRow }, mines)) {
          return null;
        }

        const canDrag = positionOverlapsAnyItem({ x: gridCol, y: gridRow }, items);

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
            onPointerUp={(event) => handlePointerUp(mine, gridCol, gridRow, event)}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}
