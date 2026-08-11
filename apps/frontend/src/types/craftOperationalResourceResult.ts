import { Bug } from "./bug";
import { Item } from "./item";
import { Structure } from "./structure";

export interface CraftOperationalResourceResult {
  item?: Item;
  bug?: Bug;
  structure: Structure;
}
