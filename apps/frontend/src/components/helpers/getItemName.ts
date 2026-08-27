import { WorkshopItemType } from "@happy-little-bug-town/utils";

export function itemTypeToName(itemType: WorkshopItemType): string {
  switch (itemType) {
    case "axe":
      return "Axe";
    case "hammer_and_chisel":
      return "Hammer and chisel";
    case "leaf_rake":
      return "Leaf rake";
    case "shovel":
      return "Shovel";
    case "knife":
      return "Knife";
    case "crucible":
      return "Crucible";
    case "wheelbarrel":
      return "Wheelbarrel";
    case "plow":
      return "Plow";
    case "basket":
      return "Basket";
    case "desk":
      return "Desk";
    case "fountain":
      return "Fountain";
  }
}
