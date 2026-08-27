import { CSSProperties } from "react";
import { GROUND_BACKGROUND_IDS, GroundBackgroundId } from "@happy-little-bug-town/utils";

const GROUND_BACKGROUND_IMAGE_SRC: Record<GroundBackgroundId, string> = {
  sand: "/backgrounds/bg-sand.webp",
  sandy_soil: "/backgrounds/bg-sandy-soil.webp",
  fertile_soil: "/backgrounds/bg-fertile-soil.webp",
  grass: "/backgrounds/bg-grass.webp",
};

interface GroundBackgroundLayersProps {
  visibleBackgroundId: GroundBackgroundId;
  fadeClassName: string;
  fadeStyle?: CSSProperties;
  backgroundSize: string;
  backgroundPosition?: string;
}

export function GroundBackgroundLayers({
  visibleBackgroundId,
  fadeClassName,
  fadeStyle,
  backgroundSize,
  backgroundPosition,
}: GroundBackgroundLayersProps) {
  return (
    <>
      {GROUND_BACKGROUND_IDS.map((backgroundId) => (
        <div
          key={backgroundId}
          className={`absolute inset-0 ${fadeClassName}`}
          style={{
            ...fadeStyle,
            backgroundImage: `url('${GROUND_BACKGROUND_IMAGE_SRC[backgroundId]}')`,
            backgroundRepeat: "repeat",
            backgroundSize,
            backgroundPosition,
            opacity: visibleBackgroundId === backgroundId ? 1 : 0,
          }}
        />
      ))}
    </>
  );
}
