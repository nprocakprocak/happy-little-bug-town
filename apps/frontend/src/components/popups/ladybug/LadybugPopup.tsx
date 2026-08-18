"use client";

import { GridPopup } from "../shared/GridPopup";
import { LadybugUpgradePopupContent } from "./LadybugUpgradePopupContent";

interface LadybugPopupProps {
  onClose: () => void;
}

export function LadybugPopup({ onClose }: LadybugPopupProps) {
  return (
    <GridPopup>
      <LadybugUpgradePopupContent onClose={onClose} />
    </GridPopup>
  );
}
