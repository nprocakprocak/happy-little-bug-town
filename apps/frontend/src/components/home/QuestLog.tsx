import { useActiveQuest } from "../../hooks/useActiveQuest";

export function QuestLog() {
  const questText = useActiveQuest();

  if (!questText) {
    return null;
  }

  return (
    <p
      role="status"
      className="absolute top-1/2 left-0 flex h-[8cqi] max-w-[calc(100%-10cqi)] -translate-y-1/2 items-center pl-[2cqi] pr-[1cqi] text-[clamp(0.65rem,2.6cqi,0.8rem)] leading-tight font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.75)]"
    >
      {questText}
    </p>
  );
}
