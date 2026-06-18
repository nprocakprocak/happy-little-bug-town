"use client";

import { useState } from "react";
import Image from "next/image";

import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_SAND_BG_TILE_WIDTH_RATIO,
  HOME_BANNER_HEIGHT_PX,
} from "../constants";
import { SettingsPopup } from "./SettingsPopup";

export function HomeBanner() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-full"
        style={{
          aspectRatio: `${GROUND_GRID_MAX_WIDTH_PX} / ${HOME_BANNER_HEIGHT_PX}`,
          backgroundImage: "url('/backgrounds/bg-sand.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: `${GROUND_SAND_BG_TILE_WIDTH_RATIO * 100}% auto`,
          backgroundPosition: `0 calc(100cqi * ${HOME_BANNER_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`,
        }}
      >
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="absolute top-1/2 right-0 h-[8cqi] w-[8cqi] -translate-y-1/2"
        >
          <span className="relative block h-full w-full">
            <Image src="/icons/settings.webp" alt="" fill className="object-contain" sizes="8cqi" />
          </span>
        </button>
      </div>
      {settingsOpen && <SettingsPopup onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
