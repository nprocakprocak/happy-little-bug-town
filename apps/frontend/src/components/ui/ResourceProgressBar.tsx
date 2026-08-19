interface ResourceProgressBarProps {
  collected: number;
  max: number;
  layout?: "full" | "corner" | "inline";
}

export function ResourceProgressBar({ collected, max, layout = "full" }: ResourceProgressBarProps) {
  const filled = Math.min(collected, max);
  const fillPercent = max > 0 ? (filled / max) * 100 : 0;

  const layoutClassName =
    layout === "inline"
      ? "relative h-full w-full"
      : layout === "corner"
        ? "absolute inset-x-[8%] bottom-[6%] h-[clamp(3px,18%,5px)] min-h-[3px]"
        : "absolute inset-x-[12%] bottom-[8%] h-[clamp(4px,2.5cqi,6px)] min-h-[4px]";

  return (
    <div className={`${layoutClassName} overflow-hidden rounded-full bg-black/45 shadow-sm`}>
      <div
        className="h-full rounded-full bg-lime-400 transition-[width] duration-200"
        style={{ width: `${fillPercent}%` }}
      />
    </div>
  );
}
