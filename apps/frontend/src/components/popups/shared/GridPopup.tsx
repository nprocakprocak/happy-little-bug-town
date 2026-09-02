"use client";

import { MouseEvent, ReactNode } from "react";

interface GridPopupProps {
  children: ReactNode;
  onClose: () => void;
}

export function GridPopup({ children, onClose }: GridPopupProps) {
  const handleAwayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center" onClick={handleAwayClick}>
      <div
        className="flex w-[84%] max-h-[84%] max-w-full flex-col overflow-y-auto rounded-lg bg-stone-50 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
