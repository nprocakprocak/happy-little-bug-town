"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  BEETLE_MAX_LEAF_PARTS,
  canDropItemOnStructure,
  canDropItemOnTool,
  canDropToolOnStructure,
  canStackItemType,
  canStructureAcceptBugDrop,
  findOverlappingEntity,
  getStackSpan,
  isBugFed,
  Position,
  Positionable,
  positionOverlapsAnyEntity,
  structureDropRequiresFedBug,
  structureFootprintFits,
} from "@happy-little-bug-town/utils";

import { useGridVisibility } from "../../context/GridVisibilityContext";
import type { DragPayload } from "../../types/dragPayload";
import { Bug } from "../../types/bug";
import { Item } from "../../types/item";
import { Stack } from "../../types/stack";
import { Structure } from "../../types/structure";
import { Tool } from "../../types/tool";
import { isBug, isItem, isStack, isStructure, isTool } from "../../utils/typeGuards";
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
  tools: Tool[];
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
  tools,
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
      const payload = buildGridDragPayload(
        index,
        dx,
        dy,
        cols,
        structures,
        tools,
        items,
        stacks,
        bugs,
      );
      if (payload !== null) {
        onDragChange(payload);
      }
      return;
    }

    const distance = Math.hypot(dx, dy);
    if (distance >= DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
      setDragState({ index, dx, dy });
      const payload = buildGridDragPayload(
        index,
        dx,
        dy,
        cols,
        structures,
        tools,
        items,
        stacks,
        bugs,
      );
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
        const toolToDrop = tools.find((t) => t.x === gridCol && t.y === gridRow);
        const entityToDrop =
          itemToDrop ?? stackToDrop ?? bugToDrop ?? structureToDrop ?? toolToDrop;

        const draggedSpan = structureToDrop?.span ?? toolToDrop?.span ?? stackToDrop?.span ?? 1;
        const bounds = event.currentTarget.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / draggedSpan / 2;
        const centerY = bounds.top + bounds.height / draggedSpan / 2;
        const target = gridCellFromClientPoint(container, centerX, centerY, cols, rows);
        const isOtherCell = target.x !== gridCol || target.y !== gridRow;

        const overlappingEntity = findOverlappingEntity({ x: target.x, y: target.y }, [
          ...structures,
          ...tools,
          ...items,
          ...stacks,
          ...bugs,
        ]);
        const overlappingItem =
          overlappingEntity && isItem(overlappingEntity) ? overlappingEntity : undefined;
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
        const overlappingTool =
          overlappingEntity && isTool(overlappingEntity) && overlappingEntity.id !== toolToDrop?.id
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
              wouldCreateOrJoinStack &&
              (!canStackItemType(itemToDrop.itemType, tools) || !typeAllowed);
            const canDropLeafOnBeetle =
              itemToDrop.itemType === "leaf_part" &&
              overlappingBug?.bugType === "beetle" &&
              overlappingBug.itemIds.length < BEETLE_MAX_LEAF_PARTS;
            const canDropOnStructure =
              !!overlappingStructure && canDropItemOnStructure(itemToDrop, overlappingStructure);
            const canDropOnTool =
              !!overlappingTool && canDropItemOnTool(itemToDrop, overlappingTool);
            const wouldCreateStack =
              !!overlappingItem && sameTypeItems && canStackItemType(itemToDrop.itemType, tools);
            const stackFootprintBlocked =
              wouldCreateStack &&
              overlappingItem !== undefined &&
              !structureFootprintFits(
                { x: target.x, y: target.y, span: getStackSpan() },
                cols,
                rows,
                [
                  ...structures,
                  ...tools,
                  ...items.filter((i) => i.id !== itemToDrop.id && i.id !== overlappingItem.id),
                  ...stacks,
                  ...bugs,
                ],
              );
            const shouldCancel =
              (!!overlappingStructure && !canDropOnStructure) ||
              (!!overlappingTool && !canDropOnTool) ||
              stackNotAllowed ||
              stackFootprintBlocked ||
              (!!overlappingBug && !canDropLeafOnBeetle);

            if (shouldCancel) {
              onItemDropCancelled(itemToDrop.id, target);
            } else {
              onItemDropped(itemToDrop.id, target, overlappingEntity);
            }
          }

          if (stackToDrop) {
            const isMerge =
              !!overlappingStack &&
              overlappingStack.itemType === stackToDrop.itemType &&
              canStackItemType(stackToDrop.itemType, tools);
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
                { x: target.x, y: target.y, span: stackToDrop.span ?? 1 },
                cols,
                rows,
                [
                  ...structures,
                  ...tools,
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
              { x: target.x, y: target.y, span: structureToDrop.span },
              cols,
              rows,
              [
                ...structures.filter((s) => s.id !== structureToDrop.id),
                ...tools,
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

          if (toolToDrop) {
            const canDropToolOnStructureTarget =
              !!overlappingStructure && canDropToolOnStructure(toolToDrop, overlappingStructure);

            if (canDropToolOnStructureTarget) {
              onItemDropped(toolToDrop.id, target, overlappingStructure);
              return;
            }

            if (overlappingStructure) {
              onItemDropCancelled(toolToDrop.id, target);
              return;
            }

            const fits = structureFootprintFits(
              { x: target.x, y: target.y, span: toolToDrop.span },
              cols,
              rows,
              [
                ...structures,
                ...tools.filter((t) => t.id !== toolToDrop.id),
                ...items,
                ...stacks,
                ...bugs,
              ],
            );

            if (fits) {
              onItemDropped(toolToDrop.id, target);
            } else {
              onItemDropCancelled(toolToDrop.id, target);
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

    if (!startedOnThisCell) {
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
      style={groundGridTemplateStyle(cols, rows)}
    >
      {Array.from({ length: cellCount }, (_, index) => {
        const gridRow = Math.floor(index / cols) + 1;
        const gridCol = (index % cols) + 1;
        const structure = structures.find((s) => s.x === gridCol && s.y === gridRow);
        const tool = tools.find((t) => t.x === gridCol && t.y === gridRow);
        const stack = stacks.find((s) => s.x === gridCol && s.y === gridRow);
        const bug = bugs.find((b) => b.x === gridCol && b.y === gridRow);

        if (!structure && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, structures)) {
          return null;
        }

        if (!tool && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, tools)) {
          return null;
        }

        if (!stack && positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, stacks)) {
          return null;
        }

        const canDrag =
          !!structure ||
          !!tool ||
          !!stack ||
          positionOverlapsAnyEntity({ x: gridCol, y: gridRow }, [...items, ...bugs]);

        const isSelected = selectedPosition?.x === gridCol && selectedPosition?.y === gridRow;
        const isDragging = dragState?.index === index;
        const cellBackgroundClass = isSelected
          ? "bg-amber-300/20"
          : gridCellsVisible
            ? "bg-zinc-200/20"
            : "bg-transparent";
        const placementStyle = structure
          ? gridPlacementStyle(structure.x, structure.y, structure.span)
          : tool
            ? gridPlacementStyle(tool.x, tool.y, tool.span)
            : stack
              ? gridPlacementStyle(stack.x, stack.y, stack.span ?? 1)
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
