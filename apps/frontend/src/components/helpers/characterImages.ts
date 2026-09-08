import { BugType } from "@happy-little-bug-town/utils";

export function hasDialogueBust(bugType: BugType): boolean {
  switch (bugType) {
    case "beetle":
    case "ant":
    case "ladybug":
    case "termite":
    case "spider":
    case "bee":
      return true;
    default:
      return false;
  }
}

export function bugTypeToBustSrc(bugType: BugType): string {
  if (!hasDialogueBust(bugType)) {
    throw new Error(`Unknown bug type for dialogue: ${bugType}`);
  }

  return `/dialogues/${bugType}.webp`;
}
