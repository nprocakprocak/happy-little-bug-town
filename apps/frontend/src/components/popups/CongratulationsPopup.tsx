"use client";

import Image from "next/image";

interface CongratulationsPopupProps {
  onClose: () => void;
}

export function CongratulationsPopup({ onClose }: CongratulationsPopupProps) {
  return (
    <div className="absolute inset-0 bg-black/40 p-2">
      <div
        className="relative h-full w-full"
        role="dialog"
        aria-modal="true"
        aria-label="Congratulations"
      >
        <Image
          src="/dialogues/congratulations.webp"
          alt="Congratulations"
          fill
          className="object-cover"
          sizes="450px"
          priority
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-stone-700 shadow-sm transition-colors hover:bg-white hover:text-stone-900"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
