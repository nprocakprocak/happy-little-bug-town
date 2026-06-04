import { BEETLE_MAX_LEAF_PARTS } from "@happy-little-park/utils";

interface BugsProgressBarProps {
  leafCount: number;
}

export function BugsProgressBar({ leafCount }: BugsProgressBarProps) {
  const collected = Math.min(leafCount, BEETLE_MAX_LEAF_PARTS);
  const fillPercent = (collected / BEETLE_MAX_LEAF_PARTS) * 100;

  return (
    <div className="absolute inset-x-[12%] bottom-[8%] z-10 h-[clamp(4px,2.5cqi,6px)] min-h-[4px] overflow-hidden rounded-full bg-black/45 shadow-sm">
      <div
        className="h-full rounded-full bg-lime-400 transition-[width] duration-200"
        style={{ width: `${fillPercent}%` }}
      />
    </div>
  );
}
