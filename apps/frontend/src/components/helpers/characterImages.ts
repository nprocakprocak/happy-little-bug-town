import { BugType } from "@happy-little-bug-town/utils";

export function bugTypeToBustSrc(bugType: BugType): string {
  switch (bugType) {
    case "beetle":
    case "ant":
    case "ladybug":
    case "termite":
    case "fly":
    case "spider":
    case "greenfly":
    case "bee":
      return `/characters/${bugType}.webp`;
    default:
      throw new Error(`Unknown bug type: ${bugType}`);
  }
}
