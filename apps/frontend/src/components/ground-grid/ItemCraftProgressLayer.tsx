"use client";

import { useMemo } from "react";
import {
  getItemSpan,
  getVisibleItemCraftProgress,
  isItemIncomplete,
} from "@happy-little-bug-town/utils";

import { Item } from "../../types/item";
import {
  gridDragStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "../helpers/groundGridStyles";
import { itemTypeToImageForItem } from "../helpers/itemImages";
import type { DragPayload } from "../types/dragPayload";
import { MissingResourceCounter } from "../ui/MissingResourceCounter";

interface ItemCraftProgressLayerProps {
  cols: number;
  rows: number;
  items: Item[];
  gridDrag: DragPayload | null;
}

export function ItemCraftProgressLayer({
  cols,
  rows,
  items,
  gridDrag,
}: ItemCraftProgressLayerProps) {
  const itemsUnderCraft = useMemo(() => items.filter(isItemIncomplete), [items]);

  return (
    <div
      className="pointer-events-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {itemsUnderCraft.flatMap((item) => {
        const isDragged = gridDrag?.entity.id === item.id;
        const dragStyle = gridDragStyle(gridDrag, isDragged);
        const progress = getVisibleItemCraftProgress(item);
        const span = getItemSpan(item.itemType);

        return progress.map(({ itemType, missing }, index) => (
          <div
            key={`${item.id}-${itemType}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...spanCellGridPosition(item.x, item.y, span, index),
              ...dragStyle,
            }}
          >
            <MissingResourceCounter imageSrc={itemTypeToImageForItem(itemType)} missing={missing} />
          </div>
        ));
      })}
    </div>
  );
}
