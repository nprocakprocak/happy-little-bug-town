import { BugType } from "@happy-little-bug-town/utils";

export function bugTypeToBustSrc(bugType: BugType): string {
  switch (bugType) {
    case "beetle":
    case "ant":
    case "ladybug":
    case "termite":
    case "spider":
    case "bee":
      return `/dialogues/${bugType}.webp`;
    default:
      throw new Error(`Unknown bug type for dialogue: ${bugType}`);
  }
}
