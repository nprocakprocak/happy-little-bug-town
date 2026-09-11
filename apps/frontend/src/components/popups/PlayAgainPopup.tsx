"use client";

import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { GridPopup } from "./shared/GridPopup";

interface PlayAgainPopupProps {
  onClose: () => void;
}

export function PlayAgainPopup({ onClose }: PlayAgainPopupProps) {
  const { resetGame } = useAuth();
  const [isResetting, setIsResetting] = useState(false);

  const handleYes = async () => {
    setIsResetting(true);
    try {
      await resetGame();
      onClose();
    } catch (error) {
      console.error("Failed to reset game:", error);
      setIsResetting(false);
    }
  };

  return (
    <GridPopup onClose={onClose}>
      <div className="flex flex-col items-center gap-[3cqi] px-[4cqi] pt-[4cqi] pb-[2cqi]">
        <p className="text-center text-[clamp(1rem,5cqi,2rem)] text-stone-800">
          Do you want to play again?
        </p>
      </div>
      <div className="flex justify-center gap-[3cqi] p-[3cqi]">
        <button
          type="button"
          onClick={() => void handleYes()}
          disabled={isResetting}
          className="min-w-[28%] rounded-md bg-sky-500 px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-white shadow-sm transition-colors hover:bg-sky-600 disabled:opacity-60"
        >
          {isResetting ? "Resetting…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isResetting}
          className="min-w-[28%] rounded-md bg-stone-200 px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300 disabled:opacity-60"
        >
          No
        </button>
      </div>
    </GridPopup>
  );
}
