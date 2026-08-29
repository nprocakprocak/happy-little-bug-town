"use client";

import { FARM_BUILDABLE_STRUCTURE_TYPES } from "@happy-little-bug-town/utils";

import { Structure } from "../../../types/structure";
import { BeetleBuildPopupContent } from "../beetle/BeetleBuildPopupContent";
import { GridPopup } from "../shared/GridPopup";

const FARM_BUILDING_OPTIONS: Structure[] = FARM_BUILDABLE_STRUCTURE_TYPES.map<Structure>(
  (structureType) => ({
    id: `farm-build-option-${structureType}`,
    x: 0,
    y: 0,
    structureType,
    upgradeLevel: 0,
    items: [],
    bugs: [],
  }),
);

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
