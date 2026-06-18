"use client";

import { ToolType } from "@happy-little-bug-town/utils";

import { Tool } from "../types/tool";
import { GridPopup } from "./GridPopup";
import { WorkshopToolsPopupContent } from "./WorkshopToolsPopupContent";

interface WorkshopPopupProps {
  onClose: () => void;
  onCreateTool: (toolType: ToolType) => void;
  tools: Tool[];
  isCreating?: boolean;
}

export function WorkshopPopup({ onClose, onCreateTool, tools, isCreating }: WorkshopPopupProps) {
  return (
    <GridPopup>
      <WorkshopToolsPopupContent
        onClose={onClose}
        onCreateTool={onCreateTool}
        tools={tools}
        isCreating={isCreating}
      />
    </GridPopup>
  );
}
