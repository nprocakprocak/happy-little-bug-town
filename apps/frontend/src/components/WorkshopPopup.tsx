"use client";

import { GridPopup } from "./GridPopup";
import { WorkshopToolsPopupContent } from "./WorkshopToolsPopupContent";

interface WorkshopPopupProps {
  onClose: () => void;
}

export function WorkshopPopup({ onClose }: WorkshopPopupProps) {
  return (
    <GridPopup>
      <WorkshopToolsPopupContent onClose={onClose} />
    </GridPopup>
  );
}
