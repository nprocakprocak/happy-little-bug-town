import { Item, Tool } from "../prisma/prisma/client.js";

export type CreateToolData = Pick<Tool, "toolType" | "x" | "y" | "authorId">;

export type UpdateToolData = Partial<Pick<Tool, "x" | "y" | "structureId">>;

export type ItemOnTool = Pick<Item, "id" | "itemType">;

export type ToolOnGridDto = Pick<Tool, "id" | "toolType" | "x" | "y"> & {
  items: ItemOnTool[];
};

export type ToolDto = ToolOnGridDto & Pick<Tool, "authorId" | "structureId">;

export type ToolWithItems = Tool & { items: Item[] };
