import { Bug } from "./bug";
import { Item } from "./item";
import { Structure } from "./structure";
import { Stack } from "./stack";

export interface WithId {
  id: string;
}

export interface GridAnimatable {
  fromX?: number;
  fromY?: number;
}

export type GridEntity = Structure | Stack | Item | Bug;
