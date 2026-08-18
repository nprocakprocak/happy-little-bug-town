"use client";

import { Structure } from "../../../types/structure";
import { GridPopup } from "../shared/GridPopup";
import { LadybugUpgradePopupContent } from "./LadybugUpgradePopupContent";

interface LadybugPopupProps {
  structures: Structure[];
  onClose: () => void;
}

export function LadybugPopup({ structures, onClose }: LadybugPopupProps) {
  return (
    <GridPopup>
      <LadybugUpgradePopupContent structures={structures} onClose={onClose} />
    </GridPopup>
  );
}
