"use client";

import { useMemo } from "react";
import { getVisibleToolCraftProgress, isToolIncomplete } from "@happy-little-bug-town/utils";

import type { DragPayload } from "../../types/dragPayload";
import { Tool } from "../../types/tool";
import {
  gridDragStyle,
  groundGridTemplateStyle,
  spanCellGridPosition,
} from "../helpers/groundGridStyles";
import { itemTypeToImageForItem } from "../helpers/itemTypeToImage";
import { MissingResourceCounter } from "../ui/MissingResourceCounter";

interface ToolCraftProgressLayerProps {
  cols: number;
  rows: number;
  tools: Tool[];
  gridDrag: DragPayload | null;
}

export function ToolCraftProgressLayer({
  cols,
  rows,
  tools,
  gridDrag,
}: ToolCraftProgressLayerProps) {
  const toolsUnderCraft = useMemo(() => tools.filter(isToolIncomplete), [tools]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      {toolsUnderCraft.flatMap((tool) => {
        const isDragged = gridDrag?.target.kind === "tool" && gridDrag.target.toolId === tool.id;
        const dragStyle = gridDragStyle(gridDrag, isDragged);
        const progress = getVisibleToolCraftProgress(tool);
        const span = tool.span ?? 1;

        return progress.map(({ itemType, missing }, index) => (
          <div
            key={`${tool.id}-${itemType}`}
            className="relative min-h-0 min-w-0"
            style={{
              ...spanCellGridPosition(tool.x, tool.y, span, index),
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
