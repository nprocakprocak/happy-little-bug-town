"use client";

import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

interface SettingsResetGameSectionProps {
  onResetComplete: () => void;
}

export function SettingsResetGameSection({ onResetComplete }: SettingsResetGameSectionProps) {
  const { resetGame } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetGame();
      onResetComplete();
    } catch (error) {
      console.error("Failed to reset game:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-sm font-medium text-stone-800">Reset the game</p>
      {isConfirming ? (
        <>
          <p className="mt-2 text-center text-sm text-stone-600">
            Are you sure?
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleReset()}
              disabled={isResetting}
              className="min-w-[20%] rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {isResetting ? "Resetting…" : "Reset"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isResetting}
              className="min-w-[20%] rounded-md bg-stone-200 px-6 py-2 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirming(true)}
          className="mt-3 min-w-[20%] rounded-md bg-red-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
        >
          Reset
        </button>
      )}
    </div>
  );
}
