"use client";

interface BeetlePopupProps {
  onClose: () => void;
}

export function BeetlePopup({ onClose }: BeetlePopupProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <div
        className="flex h-[84%] w-[84%] max-h-full max-w-full flex-col rounded-lg bg-stone-50 shadow-lg"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-1 items-center justify-center p-[4cqi]">
          <p className="text-[clamp(1rem,5cqi,2rem)] text-stone-800">Hello</p>
        </div>
        <div className="flex justify-center p-[3cqi]">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[20%] rounded-md bg-sky-500 px-[6cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-white shadow-sm transition-colors hover:bg-sky-600"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}
