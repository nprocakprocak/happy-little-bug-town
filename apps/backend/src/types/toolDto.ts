import { Item, Tool } from "../prisma/prisma/client.js";

export type CreateToolData = Pick<Tool, "toolType" | "x" | "y" | "authorId">;

export type UpdateToolData = Partial<Pick<Tool, "x" | "y" | "structureId">>;

export type ItemOnTool = Pick<Item, "id" | "itemType">;

export type ToolOnGridDto = Pick<Tool, "id" | "toolType" | "x" | "y"> & {
  span: number;
  items: ItemOnTool[];
};

export type ToolDto = Pick<Tool, "id" | "toolType" | "x" | "y" | "authorId" | "structureId"> & {
  items: ItemOnTool[];
};

export type ToolWithItems = Tool & { items: Item[] };
