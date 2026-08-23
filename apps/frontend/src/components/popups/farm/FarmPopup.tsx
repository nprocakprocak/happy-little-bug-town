"use client";

import { FARM_BUILDING_OPTIONS } from "../../../constants/farmBuild";
import { Structure } from "../../../types/structure";
import { BeetleBuildPopupContent } from "../beetle/BeetleBuildPopupContent";
import { GridPopup } from "../shared/GridPopup";

interface FarmPopupProps {
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
}

export function FarmPopup({ structures, onClose, onBuild }: FarmPopupProps) {
  return (
    <GridPopup>
      <BeetleBuildPopupContent
        structures={structures}
        buildingOptions={FARM_BUILDING_OPTIONS}
        onClose={onClose}
        onBuild={onBuild}
      />
    </GridPopup>
  );
}
