"use client";

import { useState } from "react";
import { ItemType, ToolType } from "@happy-little-bug-town/utils";

import { WORKSHOP_ITEM_OPTIONS } from "../../../constants/workshopItems";
import { WORKSHOP_TOOL_OPTIONS } from "../../../constants/workshopTools";
import { Item } from "../../../types/item";
import { Tool } from "../../../types/tool";
import { GridPopup } from "../shared/GridPopup";
import { WorkshopItemsPopupContent } from "./WorkshopItemsPopupContent";
import { WorkshopToolsPopupContent } from "./WorkshopToolsPopupContent";

type WorkshopSection = "tools" | "items";

interface WorkshopPopupProps {
  onClose: () => void;
  onCreateTool: (toolType: ToolType) => void;
  onCreateItem: (itemType: ItemType) => void;
  tools: Tool[];
  items: Item[];
  isCreating?: boolean;
}

export function WorkshopPopup({
  onClose,
  onCreateTool,
  onCreateItem,
  tools,
  items,
  isCreating,
}: WorkshopPopupProps) {
  const hasCraftableTools = WORKSHOP_TOOL_OPTIONS.length > 0;
  const hasCraftableItems = WORKSHOP_ITEM_OPTIONS.length > 0;
  const [section, setSection] = useState<WorkshopSection>(hasCraftableTools ? "tools" : "items");

  return (
    <GridPopup>
      {hasCraftableTools && hasCraftableItems && (
        <div className="flex gap-[2cqi] px-[4cqi] pt-[4cqi]">
          <button
            type="button"
            className={`flex-1 rounded-sm px-[2cqi] py-[1.5cqi] text-[3.2cqi] ${
              section === "tools" ? "bg-stone-700 text-white" : "bg-stone-200 text-stone-800"
            }`}
            onClick={() => setSection("tools")}
          >
            Tools
          </button>
          <button
            type="button"
            className={`flex-1 rounded-sm px-[2cqi] py-[1.5cqi] text-[3.2cqi] ${
              section === "items" ? "bg-stone-700 text-white" : "bg-stone-200 text-stone-800"
            }`}
            onClick={() => setSection("items")}
          >
            Items
          </button>
        </div>
      )}
      {section === "tools" && hasCraftableTools ? (
        <WorkshopToolsPopupContent
          onClose={onClose}
          onCreateTool={onCreateTool}
          tools={tools}
          isCreating={isCreating}
        />
      ) : (
        <WorkshopItemsPopupContent
          onClose={onClose}
          onCreateItem={onCreateItem}
          items={items}
          isCreating={isCreating}
        />
      )}
    </GridPopup>
  );
}
