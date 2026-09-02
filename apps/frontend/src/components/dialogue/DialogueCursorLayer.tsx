"use client";

import Image from "next/image";
import { getSpannableSpan } from "@happy-little-bug-town/utils";

import { GridEntity } from "../../types/gridEntity";
import { gridPlacementStyle, groundGridTemplateStyle } from "../helpers/groundGridStyles";

interface DialogueCursorLayerProps {
  cols: number;
  rows: number;
  entityId: string;
  entities: GridEntity[];
}

export function DialogueCursorLayer({ cols, rows, entityId, entities }: DialogueCursorLayerProps) {
  const entity = entities.find((gridEntity) => gridEntity.id === entityId);
  if (!entity) {
    return null;
  }

  const span = getSpannableSpan(entity);

  return (
    <div
      className="pointer-eventds-none absolute inset-0 grid h-full w-full gap-1"
      style={groundGridTemplateStyle(cols, rows)}
    >
      <div
        className="relative min-h-0 min-w-0"
        style={gridPlacementStyle(entity.x, entity.y, span)}
      >
        <div
          className="absolute top-1/2 left-1/2"
          style={{
            width: `calc(100% / ${span})`,
            height: `calc(100% / ${span})`,
          }}
        >
          <div className="dialogue-cursor-pulse relative h-full w-full">
            <Image
              src="/dialogues/cursor-pointer.webp"
              alt=""
              fill
              className="-rotate-18 object-contain object-bottom"
              sizes="18cqi"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
