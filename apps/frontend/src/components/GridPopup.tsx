"use client";

import { ReactNode } from "react";

interface GridPopupProps {
  children: ReactNode;
}

export function GridPopup({ children }: GridPopupProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
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
