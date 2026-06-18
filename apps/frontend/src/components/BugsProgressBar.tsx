import { BEETLE_MAX_LEAF_PARTS } from "@happy-little-bug-town/utils";

import { ResourceProgressBar } from "./ResourceProgressBar";

interface BugsProgressBarProps {
  leafCount: number;
}

export function BugsProgressBar({ leafCount }: BugsProgressBarProps) {
  return <ResourceProgressBar collected={leafCount} max={BEETLE_MAX_LEAF_PARTS} />;
}
