"use client";

import { Structure } from "../../../types/structure";
import { GridPopup } from "../shared/GridPopup";
import { BeetleBuildPopupContent } from "./BeetleBuildPopupContent";

interface BeetlePopupProps {
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function BeetlePopup({ structures, onClose, onBuild }: BeetlePopupProps) {
  return (
    <GridPopup onClose={onClose}>
      <BeetleBuildPopupContent structures={structures} onClose={onClose} onBuild={onBuild} />
    </GridPopup>
  );
}
