"use client";

interface PopupActionFooterProps {
  primaryLabel: string;
  onPrimaryClick: () => void;
  onClose: () => void;
  primaryDisabled?: boolean;
}

export function PopupActionFooter({
  primaryLabel,
  onPrimaryClick,
  onClose,
  primaryDisabled = false,
}: PopupActionFooterProps) {
  return (
    <div className="flex justify-center gap-[3cqi] p-[3cqi]">
      <button
        type="button"
        onClick={onPrimaryClick}
        disabled={primaryDisabled}
        className={`min-w-[28%] rounded-md px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium shadow-sm transition-colors ${
          primaryDisabled
            ? "cursor-not-allowed bg-stone-300 text-stone-500"
            : "bg-sky-500 text-white hover:bg-sky-600"
        }`}
      >
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="min-w-[28%] rounded-md bg-stone-200 px-[5cqi] py-[2cqi] text-[clamp(0.875rem,3.5cqi,1.25rem)] font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-300"
      >
        Close
      </button>
    </div>
  );
}
