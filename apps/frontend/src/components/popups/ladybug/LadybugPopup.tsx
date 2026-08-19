"use client";

import { Structure } from "../../../types/structure";
import { GridPopup } from "../shared/GridPopup";
import { LadybugUpgradePopupContent } from "./LadybugUpgradePopupContent";

interface LadybugPopupProps {
  structures: Structure[];
  onClose: () => void;
  onUpgrade: (structure: Structure) => void;
}

export function LadybugPopup({ structures, onClose, onUpgrade }: LadybugPopupProps) {
  return (
    <GridPopup>
      <LadybugUpgradePopupContent structures={structures} onClose={onClose} onUpgrade={onUpgrade} />
    </GridPopup>
  );
}
