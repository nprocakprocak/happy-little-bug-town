import { Bug, Item } from "../prisma/prisma/client.js";

export type CreateBugData = Pick<Bug, "bugType" | "x" | "y" | "authorId">;

export type UpdateBugData = Partial<Pick<Bug, "x" | "y" | "structureId">>;

export type BugDto = Pick<Bug, "id" | "bugType" | "x" | "y" | "authorId" | "structureId"> & {
  itemIds: string[];
};

export type BugOnGridDto = Pick<Bug, "id" | "bugType"> & {
  x: number;
  y: number;
  itemIds: string[];
};
