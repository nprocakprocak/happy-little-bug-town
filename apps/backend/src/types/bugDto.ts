import { Bug, Item } from "../prisma/prisma/client.js";

export type CreateBugData = Pick<Bug, "bugType" | "x" | "y" | "authorId">;

export type UpdateBugData = Partial<Pick<Bug, "x" | "y" | "structureId">>;

export type ItemOnBug = Pick<Item, "id" | "itemType">;

export type BugDto = Pick<Bug, "id" | "bugType" | "x" | "y" | "authorId" | "structureId"> & {
  items: ItemOnBug[];
};

export type BugOnGridDto = Pick<Bug, "id" | "bugType"> & {
  x: number;
  y: number;
  items: ItemOnBug[];
};
