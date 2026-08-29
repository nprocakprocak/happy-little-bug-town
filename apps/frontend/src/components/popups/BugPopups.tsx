"use client";

import { Bug } from "../../types/bug";
import { Structure } from "../../types/structure";
import { AntPopup } from "./ant/AntPopup";
import { BeePopup } from "./bee/BeePopup";
import { BeetlePopup } from "./beetle/BeetlePopup";
import { FlyPopup } from "./fly/FlyPopup";
import { GreenflyPopup } from "./greenfly/GreenflyPopup";
import { LadybugPopup } from "./ladybug/LadybugPopup";
import { SpiderPopup } from "./spider/SpiderPopup";
import { TermitePopup } from "./termite/TermitePopup";

interface BugPopupsProps {
  selectedBug: Bug | null;
  structures: Structure[];
  onClose: () => void;
  onBuild: (structure: Structure) => void;
  onUpgrade: (structure: Structure) => void;
}

export function BugPopups({
  selectedBug,
  structures,
  onClose,
  onBuild,
  onUpgrade,
}: BugPopupsProps) {
  if (!selectedBug) {
    return null;
  }

  switch (selectedBug.bugType) {
    case "beetle":
      return (
        <BeetlePopup
          beetle={selectedBug}
          structures={structures}
          onClose={onClose}
          onBuild={onBuild}
        />
      );
    case "ladybug":
      return (
        <LadybugPopup
          ladybug={selectedBug}
          structures={structures}
          onClose={onClose}
          onUpgrade={onUpgrade}
        />
      );
    case "ant":
      return <AntPopup ant={selectedBug} onClose={onClose} />;
    case "termite":
      return <TermitePopup termite={selectedBug} onClose={onClose} />;
    case "spider":
      return <SpiderPopup spider={selectedBug} onClose={onClose} />;
    case "fly":
      return <FlyPopup fly={selectedBug} onClose={onClose} />;
    case "greenfly":
      return <GreenflyPopup greenfly={selectedBug} onClose={onClose} />;
    case "bee":
      return <BeePopup bee={selectedBug} onClose={onClose} />;
  }
}
