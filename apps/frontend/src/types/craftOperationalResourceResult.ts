import { Item } from "./item";
import { Structure } from "./structure";
import { Tool } from "./tool";

export type CraftOperationalResourceResult =
  | {
      kind: "tool";
      tool: Tool;
      structure: Structure;
    }
  | {
      kind: "item";
      item: Item;
      structure: Structure;
    };
