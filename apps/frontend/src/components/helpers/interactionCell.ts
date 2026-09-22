import { CSSProperties } from "react";
import {
  canDemolishStructure,
  canRelocateStructure,
  getSpannableSpan,
  isSelfGeneratingHouse,
  Position,
} from "@happy-little-bug-town/utils";

import { GridEntity } from "../../types/gridEntity";
import { Item } from "../../types/item";
import { DragState } from "../types/dragState";
import { gridPlacementStyle } from "./groundGridStyles";
import { isStructure } from "./typeGuards";

interface CalculateCellPropertiesProps {
  entity: GridEntity | undefined;
  cellPosition: Position;
  cellIndex: number;
  isGridVisible: boolean;
  isDemolishMode: boolean;
  dragState: DragState | null;
  items: Item[];
}

interface CalculateCellProperties {
  placementStyle: CSSProperties;
  dragStyle: CSSProperties;
  canDrag: boolean;
  isDemolishLocked: boolean;
  cellBackgroundClass: string;
}

export function calculateCellProperties({
  entity,
  cellPosition,
  cellIndex,
  isGridVisible,
  isDemolishMode,
  dragState,
  items,
}: CalculateCellPropertiesProps): CalculateCellProperties {
  const structure = entity && isStructure(entity) ? entity : null;
  const isDemolishLocked = isDemolishMode && !!structure && canDemolishStructure(structure, items);
  const ignoresHammer = isDemolishMode && !!structure && isSelfGeneratingHouse(structure);

  const canDrag =
    !!entity &&
    !ignoresHammer &&
    (!isStructure(entity) || (!isDemolishLocked && canRelocateStructure(entity, items)));

  const isDragging = dragState?.index === cellIndex;

  const cellBackgroundClass = isGridVisible ? "bg-zinc-200/20" : "bg-transparent";

  const position = entity ? { x: entity.x, y: entity.y } : cellPosition;

  const span = entity ? getSpannableSpan(entity) : 1;

  const placementStyle = gridPlacementStyle(position.x, position.y, span);

  const dragStyle =
    isDragging && dragState ? { transform: `translate(${dragState.dx}px, ${dragState.dy}px)` } : {};

  return { placementStyle, dragStyle, canDrag, isDemolishLocked, cellBackgroundClass };
}
