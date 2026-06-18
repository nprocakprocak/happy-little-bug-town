import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_SAND_BG_TILE_WIDTH_RATIO,
  HOME_BANNER_HEIGHT_PX,
} from "../constants";

export function HomeBanner() {
  return (
    <div
      className="w-full"
      style={{
        aspectRatio: `${GROUND_GRID_MAX_WIDTH_PX} / ${HOME_BANNER_HEIGHT_PX}`,
        backgroundImage: "url('/backgrounds/bg-sand.webp')",
        backgroundRepeat: "repeat",
        backgroundSize: `${GROUND_SAND_BG_TILE_WIDTH_RATIO * 100}% auto`,
        backgroundPosition: `0 calc(100cqi * ${HOME_BANNER_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`,
      }}
    />
  );
}
