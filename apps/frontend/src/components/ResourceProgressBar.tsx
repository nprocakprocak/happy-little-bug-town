interface ResourceProgressBarProps {
  collected: number;
  max: number;
}

export function ResourceProgressBar({ collected, max }: ResourceProgressBarProps) {
  const filled = Math.min(collected, max);
  const fillPercent = (filled / max) * 100;

  return (
    <div className="absolute inset-x-[12%] bottom-[8%] z-10 h-[clamp(4px,2.5cqi,6px)] min-h-[4px] overflow-hidden rounded-full bg-black/45 shadow-sm">
      <div
        className="h-full rounded-full bg-lime-400 transition-[width] duration-200"
        style={{ width: `${fillPercent}%` }}
      />
    </div>
  );
}
