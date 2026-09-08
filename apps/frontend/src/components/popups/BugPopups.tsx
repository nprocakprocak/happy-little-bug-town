"use client";

import { Structure } from "../../types/structure";
import { BeetlePopup } from "./beetle/BeetlePopup";
import { LadybugPopup } from "./ladybug/LadybugPopup";

interface BugPopupsProps {
  popup: "build" | "upgrade" | null;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
  onUpgrade: (structure: Structure) => void;
}

export function BugPopups({ popup, structures, onClose, onBuild, onUpgrade }: BugPopupsProps) {
  if (popup === "build") {
    return <BeetlePopup structures={structures} onClose={onClose} onBuild={onBuild} />;
  }

  if (popup === "upgrade") {
    return <LadybugPopup structures={structures} onClose={onClose} onUpgrade={onUpgrade} />;
  }

  return null;
}
