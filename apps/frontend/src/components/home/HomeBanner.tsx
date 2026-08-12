"use client";

import { useState } from "react";
import Image from "next/image";

import {
  GROUND_GRID_MAX_WIDTH_PX,
  GROUND_BG_TILE_HEIGHT_PX,
  GROUND_BG_TILE_WIDTH_PX,
  HOME_BANNER_HEIGHT_PX,
} from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useAnthillBackgroundFade } from "../../hooks/useAnthillBackgroundFade";
import { useStructuresQuery } from "../../hooks/useStructures";
import { useMainStore } from "../../stores/main";
import { SettingsPopup } from "./SettingsPopup";

export function HomeBanner() {
  const { anonymousId, logout } = useAuth();
  const requiresLogin = useMainStore((state) => state.requiresLogin);
  const isTransformingToAnthill = useMainStore((state) => state.isTransformingToAnthill);
  const { data: structures = [] } = useStructuresQuery(Boolean(anonymousId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isStartingOver, setIsStartingOver] = useState(false);

  const useSandySoilBackground = structures.some(
    (structure) => structure.structureType === "anthill",
  );
  const { showSandySoil, backgroundFadeClassName, backgroundFadeStyle } = useAnthillBackgroundFade(
    isTransformingToAnthill,
    useSandySoilBackground,
  );
  const backgroundSize = `calc(100cqi * ${GROUND_BG_TILE_WIDTH_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px) calc(100cqi * ${GROUND_BG_TILE_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`;
  const backgroundPosition = `0 calc(100cqi * ${HOME_BANNER_HEIGHT_PX}px / ${GROUND_GRID_MAX_WIDTH_PX}px)`;

  const handleStartOver = async () => {
    setIsStartingOver(true);
    try {
      await logout();
    } finally {
      setIsStartingOver(false);
    }
  };

  return (
    <>
      <div
        className="relative z-10 w-full"
        style={{
          aspectRatio: `${GROUND_GRID_MAX_WIDTH_PX} / ${HOME_BANNER_HEIGHT_PX}`,
        }}
      >
        <div
          className={`absolute inset-0 ${backgroundFadeClassName}`}
          style={{
            ...backgroundFadeStyle,
            backgroundImage: "url('/backgrounds/bg-sand.webp')",
            backgroundRepeat: "repeat",
            backgroundSize,
            backgroundPosition,
            opacity: showSandySoil ? 0 : 1,
          }}
        />
        <div
          className={`absolute inset-0 ${backgroundFadeClassName}`}
          style={{
            ...backgroundFadeStyle,
            backgroundImage: "url('/backgrounds/bg-sandy-soil.webp')",
            backgroundRepeat: "repeat",
            backgroundSize,
            backgroundPosition,
            opacity: showSandySoil ? 1 : 0,
          }}
        />
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
        {requiresLogin && (
          <div
            role="alert"
            className="absolute inset-x-0 top-full flex items-center justify-center gap-3 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          >
            <p>This account requires a login to continue.</p>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="rounded-md bg-sky-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
            >
              Log in
            </button>
            <span>
              or{" "}
              <button
                type="button"
                onClick={() => void handleStartOver()}
                disabled={isStartingOver}
                className="underline underline-offset-2 transition-opacity hover:opacity-80 disabled:opacity-60"
              >
                {isStartingOver ? "starting over…" : "start over"}
              </button>
              .
            </span>
          </div>
        )}
      </div>
      {settingsOpen && <SettingsPopup onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
