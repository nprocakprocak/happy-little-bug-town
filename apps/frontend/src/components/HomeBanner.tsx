"use client";

import { useState } from "react";
import Image from "next/image";

import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_SAND_BG_TILE_WIDTH_RATIO,
  HOME_BANNER_HEIGHT_PX,
} from "../constants";
import { useAuth } from "../context/AuthContext";
import { SettingsPopup } from "./SettingsPopup";

export function HomeBanner() {
  const { requiresLogin } = useAuth();
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
      {requiresLogin && (
        <div
          role="alert"
          className="flex items-center justify-center gap-3 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          <p>Log in to save progress for this account.</p>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-md bg-sky-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            Sign in
          </button>
        </div>
      )}
      {settingsOpen && <SettingsPopup onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
