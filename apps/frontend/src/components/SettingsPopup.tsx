"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { HOME_BANNER_HEIGHT_PX } from "../constants";

interface SettingsPopupProps {
  onClose: () => void;
}

export function SettingsPopup({ onClose }: SettingsPopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-x-0 z-30 flex justify-center"
      style={{ top: HOME_BANNER_HEIGHT_PX }}
    >
      <div
        className="flex w-[84%] max-w-[380px] flex-col rounded-lg bg-stone-50 p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <p className="text-center text-lg font-medium text-stone-800">Settings</p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[20%] rounded-md bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
