import { useEffect, useState } from "react";
import {
  getReachedGroundBackgroundId,
  getVisibleGroundBackgroundId,
  GroundBackgroundId,
  StructureType,
} from "@happy-little-bug-town/utils";

import { STRUCTURE_EVOLUTION_FADE_MS } from "../constants/evolution";

export function useGroundEvolutionPresentation(
  structureTypes: StructureType[],
  evolvingToStructureType: StructureType | null,
) {
  const isEvolving = evolvingToStructureType !== null;
  const [fadeStarted, setFadeStarted] = useState(false);

  useEffect(() => {
    if (!isEvolving) {
      setFadeStarted(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFadeStarted(true);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isEvolving]);

  const reachedBackgroundId = getReachedGroundBackgroundId(structureTypes);
  const visibleBackgroundId: GroundBackgroundId = getVisibleGroundBackgroundId(
    reachedBackgroundId,
    evolvingToStructureType,
    fadeStarted,
  );

  return {
    fadeStarted,
    visibleBackgroundId,
    backgroundFadeClassName: isEvolving ? "transition-opacity" : "",
    backgroundFadeStyle: isEvolving
      ? { transitionDuration: `${STRUCTURE_EVOLUTION_FADE_MS}ms` }
      : undefined,
  };
}
