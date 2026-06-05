import { Item, Tool } from "../prisma/prisma/client.js";

export type CreateToolData = Pick<Tool, "toolType" | "x" | "y" | "authorId">;

export type UpdateToolData = Partial<Pick<Tool, "x" | "y" | "structureId">>;

export type ToolDto = Pick<Tool, "id" | "toolType" | "x" | "y" | "authorId" | "structureId"> & {
  itemIds: string[];
};
