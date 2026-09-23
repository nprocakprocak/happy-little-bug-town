import { BugType, isBugFed, ItemType } from "@happy-little-bug-town/utils";

export function bugTypeToImage(bugType: BugType, isFed: boolean = true): string {
  switch (bugType) {
    case "beetle":
      return "/bugs/beetle.webp";
    case "ant":
      return "/bugs/ant.webp";
    case "ladybug":
      return "/bugs/ladybug.webp";
    case "termite":
      return "/bugs/termite.webp";
    case "fly":
      return "/bugs/fly.webp";
    case "spider":
      return "/bugs/spider.webp";
    case "greenfly":
      return isFed ? "/bugs/greenfly.webp" : "/bugs/greenfly-hungry.webp";
    case "bee":
      return "/bugs/bee.webp";
    default:
      throw new Error(`Unknown bug type: ${bugType}`);
  }
}

export function bugToImage(bug: { bugType: BugType; items: { itemType: ItemType }[] }): string {
  return bugTypeToImage(bug.bugType, isBugFed(bug));
}

const BUG_SPRITE_SRC_BY_TYPE: Record<BugType, string[]> = {
  beetle: [bugTypeToImage("beetle")],
  ant: [bugTypeToImage("ant")],
  ladybug: [bugTypeToImage("ladybug")],
  termite: [bugTypeToImage("termite")],
  fly: [bugTypeToImage("fly")],
  spider: [bugTypeToImage("spider")],
  greenfly: [bugTypeToImage("greenfly", true), bugTypeToImage("greenfly", false)],
  bee: [bugTypeToImage("bee")],
};

export function allBugSpriteSrcs(): string[] {
  return Object.values(BUG_SPRITE_SRC_BY_TYPE).flat();
}
