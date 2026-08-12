import { useEffect, useState } from "react";

import { ANTHILL_TRANSFORM_FADE_MS } from "../constants";

export function useAnthillBackgroundFade(
  isTransformingToAnthill: boolean,
  useSandySoilBackground: boolean,
) {
  const [fadeStarted, setFadeStarted] = useState(false);

  useEffect(() => {
    if (!isTransformingToAnthill) {
      setFadeStarted(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFadeStarted(true);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isTransformingToAnthill]);

  const showSandySoil = useSandySoilBackground && (!isTransformingToAnthill || fadeStarted);

  return {
    showSandySoil,
    fadeStarted,
    backgroundFadeClassName: isTransformingToAnthill ? "transition-opacity" : "",
    backgroundFadeStyle: isTransformingToAnthill
      ? { transitionDuration: `${ANTHILL_TRANSFORM_FADE_MS}ms` }
      : undefined,
  };
}
