"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Mine } from "../types/mine";
import { Item } from "../types/item";
import { SelectedSquarePosition } from "../types/position";
import {
  gridCellFromClientPoint,
} from "./helpers/gridCellFromClientPoint";
import { positionOverlapsAnyMine } from "./helpers/overlaps";
import { DRAG_THRESHOLD_PX } from "./constants";

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  mines: Mine[];
  items: Item[];
  onMineClick: (mine: Mine) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  mines,
  items: _items,
  onMineClick,
}: GroundGridInteractionLayerProps) {
  const [selectedPosition, setSelectedPosition] = useState<SelectedSquarePosition | null>(null);
  const [dragState, setDragState] = useState<{ index: number; dx: number; dy: number } | null>(
    null,
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const cellCount = rows * cols;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    hasDraggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(index: number, event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerStartRef.current) {
      return;
    }
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;

    if (hasDraggedRef.current) {
      setDragState({ index, dx, dy });
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
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

      const container = gridContainerRef.current;
      if (container) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;
        if (isOtherCell && !positionOverlapsAnyMine({ x: target.x, y: target.y }, mines)) {
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

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;
        const isDragging = dragState?.index === index;
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
            className={`min-h-0 min-w-0 cursor-grab touch-none select-none rounded-sm transition-colors active:cursor-grabbing ${isSelected ? "bg-amber-300" : "bg-zinc-200/20"}`}
            style={{ ...placementStyle, ...dragStyle }}
            onPointerDown={handlePointerDown}
            onPointerMove={(event) => handlePointerMove(index, event)}
            onPointerUp={(event) => handlePointerUp(mine, gridCol, gridRow, event)}
            onPointerCancel={handlePointerCancel}
          />
        );
      })}
    </div>
  );
}
