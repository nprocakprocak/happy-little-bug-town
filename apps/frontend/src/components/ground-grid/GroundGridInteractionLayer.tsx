"use client";

import {
  findOverlappingEntity,
  getSpannableSpan,
  Position,
  positionOverlapsAnyEntity,
} from "@happy-little-bug-town/utils";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useGridVisibility } from "../../context/GridVisibilityContext";
import { useMainStore } from "../../stores/main";
import { GridEntity } from "../../types/gridEntity";
import { gridCellFromClientPoint } from "../helpers/gridCellFromClientPoint";
import { groundGridTemplateStyle } from "../helpers/groundGridStyles";
import { calculateCellProperties } from "../helpers/interactionCell";
import { isItem } from "../helpers/typeGuards";
import type { DragPayload } from "../types/dragPayload";
import { DragState } from "../types/dragState";

const DRAG_THRESHOLD_PX = 8;

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  entities: GridEntity[];
  onEntityClick: (entity: GridEntity) => void;
  onEntityDropped: (entity: GridEntity, position: Position, targetEntity?: GridEntity) => void;
  onDragChange: (payload: DragPayload | null) => void;
}

export function GroundGridInteractionLayer({
  cols,
  rows,
  entities,
  onEntityClick,
  onEntityDropped,
  onDragChange,
}: GroundGridInteractionLayerProps) {
  const { gridCellsVisible } = useGridVisibility();
  const isDemolishMode = useMainStore((state) => state.isDemolishMode);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const hasDraggedRef = useRef(false);

  const cellCount = rows * cols;

  function handlePointerDown(index: number, event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY, index };
    hasDraggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(
    entity: GridEntity | undefined,
    canDrag: boolean,
    isDemolishLocked: boolean,
    index: number,
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (!pointerStartRef.current) {
      return;
    }
    if (pointerStartRef.current.index !== index) {
      return;
    }
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;

    if (!canDrag) {
      if (isDemolishLocked && Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
        hasDraggedRef.current = true;
      }
      return;
    }

    if (hasDraggedRef.current) {
      setDragState({ index, dx, dy });
      if (entity) {
        onDragChange({ dx, dy, entity });
      }
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
      if (entity) {
        onDragChange({ dx, dy, entity });
      }
    }
  }

  function handlePointerUp(
    entityToDrop: GridEntity | undefined,
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

    // an entity was clicked
    if (!hasDraggedRef.current) {
      if (startedOnThisCell && entityToDrop) {
        onEntityClick(entityToDrop);
      }
      return;
    }

    // an entity was dragged and dropped

    hasDraggedRef.current = false;
    setDragState(null);
    onDragChange(null);

    const container = gridContainerRef.current;
    if (!container || !entityToDrop) {
      // nothing to drop or dropped outside the board boundaries
      return;
    }

    const draggedSpan = getSpannableSpan(entityToDrop);
    const bounds = event.currentTarget.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / draggedSpan / 2;
    const centerY = bounds.top + bounds.height / draggedSpan / 2;
    const targetPosition = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
    if (targetPosition.x === gridCol && targetPosition.y === gridRow) {
      // the entity was dropped on the same cell it was dragged from
      return;
    }

    const overlapping = findOverlappingEntity({ x: targetPosition.x, y: targetPosition.y }, entities) as GridEntity | undefined;
    const overlappingEntity =
      overlapping && overlapping.id !== entityToDrop.id ? overlapping : undefined;

    onEntityDropped(entityToDrop, targetPosition, overlappingEntity);
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

  const items = entities.filter(isItem);

  return (
    <div className="absolute inset-0">
      <div
        ref={gridContainerRef}
        className="absolute inset-0 grid h-full w-full gap-1"
        style={groundGridTemplateStyle(cols, rows)}
      >
        {Array.from({ length: cellCount }, (_, index) => {
          const gridRow = Math.floor(index / cols) + 1;
          const gridCol = (index % cols) + 1;
          const entity = entities.find((e) => e.x === gridCol && e.y === gridRow);

          if (!entity && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, entities)) {
            // don't render a cell if it overlaps a spanned cell
            return null;
          }

          const { placementStyle, dragStyle, canDrag, isDemolishLocked, cellBackgroundClass } =
            calculateCellProperties({
              entity,
              cellPosition: { x: gridCol, y: gridRow },
              cellIndex: index,
              isGridVisible: gridCellsVisible,
              isDemolishMode,
              dragState,
              items,
            });

          return (
            <div
              key={index}
              className={`min-h-0 min-w-0 select-none rounded-sm transition-colors ${isDemolishLocked ? "cursor-pointer" : canDrag ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default"} ${cellBackgroundClass}`}
              style={{ ...placementStyle, ...dragStyle }}
              onPointerDown={(event) => handlePointerDown(index, event)}
              onPointerMove={(event) =>
                handlePointerMove(entity, canDrag, isDemolishLocked, index, event)
              }
              onPointerUp={(event) => handlePointerUp(entity, gridCol, gridRow, index, event)}
              onPointerCancel={handlePointerCancel}
            />
          );
        })}
      </div>
    </div>
  );
}
