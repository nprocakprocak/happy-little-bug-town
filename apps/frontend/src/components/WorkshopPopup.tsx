"use client";

import { ToolType } from "@happy-little-park/utils";

import { GridPopup } from "./GridPopup";
import { WorkshopToolsPopupContent } from "./WorkshopToolsPopupContent";

interface WorkshopPopupProps {
  onClose: () => void;
  onCreateTool: (toolType: ToolType) => void;
  isCreating?: boolean;
}

export function WorkshopPopup({ onClose, onCreateTool, isCreating }: WorkshopPopupProps) {
  return (
    <GridPopup>
      <WorkshopToolsPopupContent
        onClose={onClose}
        onCreateTool={onCreateTool}
        isCreating={isCreating}
      />
    </GridPopup>
  );
}
