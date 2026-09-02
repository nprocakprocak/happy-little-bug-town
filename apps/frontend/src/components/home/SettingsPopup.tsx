"use client";

import { MouseEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { HOME_BANNER_HEIGHT_PX } from "../constants/layout";
import { SettingsLoginSection } from "./SettingsLoginSection";
import { SettingsResetGameSection } from "./SettingsResetGameSection";

interface SettingsPopupProps {
  onClose: () => void;
}

export function SettingsPopup({ onClose }: SettingsPopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAwayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: HOME_BANNER_HEIGHT_PX }}
        onClick={handleAwayClick}
      >
        <div
          className="flex w-[84%] max-w-95 flex-col rounded-lg bg-stone-50 p-4 shadow-lg"
          role="dialog"
          aria-modal="true"
        >
          <p className="text-center text-lg font-medium text-stone-800">Settings</p>
          <div className="mt-4">
            <SettingsLoginSection />
          </div>
          <div className="mt-4 border-t border-stone-200 pt-4">
            <SettingsResetGameSection onResetComplete={onClose} />
          </div>
          <p className="mt-4 border-t border-stone-200 pt-4 text-center text-sm text-stone-600">
            Press{" "}
            <kbd className="rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-medium text-stone-800">
              G
            </kbd>{" "}
            to toggle grid visibility.
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[20%] rounded-md bg-stone-200 px-6 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
