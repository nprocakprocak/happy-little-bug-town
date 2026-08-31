"use client";

import {
  canDemolishStructureType,
  canDiscardBugOnStructure,
  canDropBugOnStack,
  canRelocateStructureType,
  canStackItemType,
  canStructureAcceptDroppedBug,
  canSwapOnGrid,
  droppedBugMustBeFed,
  findOverlappingEntity,
  getSpannableSpan,
  isBugFed,
  isItemCrafted,
  Position,
  Positionable,
  positionOverlapsAnyEntity,
  structureFootprintFits
} from "@happy-little-bug-town/utils";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useGridVisibility } from "../../context/GridVisibilityContext";
import { useMainStore } from "../../stores/main";
import { Bug } from "../../types/bug";
import { GridEntity } from "../../types/gridEntity";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { gridCellFromClientPoint } from "../helpers/gridCellFromClientPoint";
import { groundGridTemplateStyle } from "../helpers/groundGridStyles";
import { calculateCellProperties } from "../helpers/interactionCell";
import { dropItem } from "../helpers/pointerUp/dropItem";
import { isBug, isItem, isStack, isStructure } from "../helpers/typeGuards";
import type { DragPayload } from "../types/dragPayload";
import { DragState } from "../types/dragState";
import { StackCreateBlockedHintLayer } from "./StackCreateBlockedHintLayer";

const DRAG_THRESHOLD_PX = 8;

interface GroundGridInteractionLayerProps {
  cols: number;
  rows: number;
  structures: Structure[];
  items: Item[];
  stacks: Stack[];
  bugs: Bug[];
  onStructureClick: (structure: Structure) => void;
  onStackClick: (stack: Stack) => void;
  onBugClick: (bug: Bug) => void;
  onDragChange: (payload: DragPayload | null) => void;
  onItemDropCancelled: (itemId: string, dropPosition: Position) => void;
  onItemDropped: (
    itemId: string,
    position: Position,
    targetId?: string,
    targetEntity?: Positionable,
  ) => void;
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
  onBugClick,
  onDragChange,
  onItemDropCancelled,
  onItemDropped,
}: GroundGridInteractionLayerProps) {
  const { gridCellsVisible } = useGridVisibility();
  const isDemolishMode = useMainStore((state) => state.isDemolishMode);
  const setIsDemolishMode = useMainStore((state) => state.setIsDemolishMode);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [blockedStackHint, setBlockedStackHint] = useState<{
    origin: Position;
    nonce: number;
  } | null>(null);

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

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      setDragState(null);
      onDragChange(null);

      if (entityToDrop && isStructure(entityToDrop) && isDemolishMode && canDemolishStructureType(entityToDrop.structureType, items)) {
        // don't craft items in demolish mode
        return;
      }

      const container = gridContainerRef.current;
      if (container) {
        const draggedSpan = entityToDrop ? getSpannableSpan(entityToDrop) : 1;
        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / draggedSpan / 2;
        const centerY = bounds.top + bounds.height / draggedSpan / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;

        const overlapping = findOverlappingEntity({ x: target.x, y: target.y }, [
          ...structures,
          ...items,
          ...stacks,
          ...bugs,
        ]);

        const overlappingItem = overlapping && isItem(overlapping) && overlapping.id !== entityToDrop?.id ? overlapping : undefined;
        const overlappingStack = overlapping && isStack(overlapping) && overlapping.id !== entityToDrop?.id ? overlapping : undefined;
        const overlappingBug = overlapping && isBug(overlapping) && overlapping.id !== entityToDrop?.id ? overlapping : undefined;
        const overlappingStructure = overlapping && isStructure(overlapping) && overlapping.id !== entityToDrop?.id ? overlapping : undefined;
        const overlappingEntity = overlappingItem ?? overlappingStack ?? overlappingBug ?? overlappingStructure;
        const targetId = overlappingEntity?.id;

        if (isOtherCell) {
          if (entityToDrop && isItem(entityToDrop)) {
            const { shouldCancel, stackFootprintBlocked } = dropItem(entityToDrop, overlappingEntity, target, items, cols, rows,
              [
                ...structures,
                ...items.filter((i) => i.id !== entityToDrop.id && (!overlappingEntity || i.id !== overlappingEntity.id)),
                ...stacks,
                ...bugs,
              ]);

            if (shouldCancel) {
              if (stackFootprintBlocked) {
                setBlockedStackHint((prev) => ({
                  origin: target,
                  nonce: (prev?.nonce ?? 0) + 1,
                }));
              }
              onItemDropCancelled(entityToDrop.id, target);
            } else {
              onItemDropped(entityToDrop.id, target, targetId, overlappingEntity);
            }
          }

          if (entityToDrop && isStack(entityToDrop)) {
            const isMerge =
              !!overlappingStack &&
              overlappingStack.itemType === entityToDrop.itemType &&
              canStackItemType(entityToDrop.itemType, items);
            const shouldCancel =
              (!!overlappingEntity && !overlappingStack) ||
              (!!overlappingStack && !isMerge);

            if (shouldCancel) {
              onItemDropCancelled(entityToDrop.id, target);
            } else if (isMerge) {
              onItemDropped(entityToDrop.id, target, targetId, overlappingStack);
            } else {
              const fits = structureFootprintFits(
                { x: target.x, y: target.y, itemsCount: entityToDrop.itemsCount },
                cols,
                rows,
                [
                  ...structures,
                  ...items,
                  ...stacks.filter((s) => s.id !== entityToDrop.id),
                  ...bugs,
                ],
              );

              if (fits) {
                onItemDropped(entityToDrop.id, target);
              } else {
                onItemDropCancelled(entityToDrop.id, target);
              }
            }
          }

          if (entityToDrop && isStructure(entityToDrop)) {
            const fits = structureFootprintFits(
              {
                x: target.x,
                y: target.y,
                structureType: entityToDrop.structureType,
              },
              cols,
              rows,
              [
                ...structures.filter((s) => s.id !== entityToDrop.id),
                ...items,
                ...stacks,
                ...bugs,
              ],
            );

            if (fits && canRelocateStructureType(entityToDrop.structureType, items)) {
              onItemDropped(entityToDrop.id, target);
            } else {
              onItemDropCancelled(entityToDrop.id, target);
            }
          }

          if (entityToDrop && isBug(entityToDrop)) {
            const canDropOnStack =
              !!overlappingStack && canDropBugOnStack(entityToDrop, overlappingStack);

            const canDiscardOnStructure =
              !!overlappingStructure && canDiscardBugOnStructure(entityToDrop, overlappingStructure);

            if (
              overlappingStructure &&
              canStructureAcceptDroppedBug(entityToDrop, overlappingStructure)
            ) {
              if (droppedBugMustBeFed(entityToDrop, overlappingStructure) && !isBugFed(entityToDrop)) {
                onBugClick(entityToDrop);
                onItemDropCancelled(entityToDrop.id, target);
              } else {
                onItemDropped(entityToDrop.id, target, targetId, overlappingEntity);
              }
            } else if (canDiscardOnStructure) {
              onItemDropped(entityToDrop.id, target, targetId, overlappingEntity);
            } else if (canDropOnStack) {
              if (!isBugFed(entityToDrop)) {
                onBugClick(entityToDrop);
                onItemDropCancelled(entityToDrop.id, target);
              } else {
                onItemDropped(entityToDrop.id, target, targetId, overlappingEntity);
              }
            } else if (overlappingEntity && canSwapOnGrid(entityToDrop, overlappingEntity)) {
              onItemDropped(entityToDrop.id, target, targetId, overlappingEntity);
            } else if (overlappingEntity) {
              onItemDropCancelled(entityToDrop.id, target);
            } else {
              onItemDropped(entityToDrop.id, target);
            }
          }
        }
      }
      return;
    }

    if (!startedOnThisCell) {
      return;
    }

    if (entityToDrop && isStructure(entityToDrop)) {
      onStructureClick(entityToDrop);
    } else if (entityToDrop && isStack(entityToDrop)) {
      onStackClick(entityToDrop);
    } else if (entityToDrop && isItem(entityToDrop) && entityToDrop.itemType === "hammer" && isItemCrafted(entityToDrop)) {
      setIsDemolishMode(!isDemolishMode);
    } else if (
      entityToDrop && isBug(entityToDrop) &&
      (entityToDrop.bugType === "beetle" ||
        entityToDrop.bugType === "ladybug" ||
        (entityToDrop.bugType === "greenfly" && !isBugFed(entityToDrop)))
    ) {
      onBugClick(entityToDrop);
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

  const entities = [...structures, ...stacks, ...items, ...bugs];

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

          const {
            placementStyle,
            dragStyle,
            canDrag,
            isDemolishLocked,
            cellBackgroundClass
          } = calculateCellProperties({
            entity,
            cellPosition: { x: gridCol, y: gridRow },
            cellIndex: index,
            isGridVisible: gridCellsVisible,
            isDemolishMode,
            dragState,
            items,
            selectedPosition
          });

          return (
            <div
              key={index}
              className={`min-h-0 min-w-0 select-none rounded-sm transition-colors ${isDemolishLocked ? "cursor-pointer" : canDrag ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer"} ${cellBackgroundClass}`}
              style={{ ...placementStyle, ...dragStyle }}
              onPointerDown={(event) => handlePointerDown(index, event)}
              onPointerMove={(event) => handlePointerMove(entity, canDrag, isDemolishLocked, index, event)}
              onPointerUp={(event) =>
                handlePointerUp(entity, gridCol, gridRow, index, event)
              }
              onPointerCancel={handlePointerCancel}
            />
          );
        })}
      </div>
      {blockedStackHint ? (
        <StackCreateBlockedHintLayer
          key={blockedStackHint.nonce}
          cols={cols}
          rows={rows}
          origin={blockedStackHint.origin}
          onComplete={() => setBlockedStackHint(null)}
        />
      ) : null}
    </div>
  );
}
